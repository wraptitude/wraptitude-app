"""Number allocation races, retry safety and branch authorization."""
import copy
import json
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from botocore.exceptions import ClientError
from invoice_numbers import allocate_invoice_number, InvoiceBranchMismatch, InvoiceNumberBusy
from test_orders import app, event


class TransactionCanceled(ClientError):
    pass


class AtomicLedger:
    exceptions = SimpleNamespace(TransactionCanceledException=TransactionCanceled)

    def __init__(self):
        self.items = {}
        self.lock = threading.Lock()
        self.failures = []

    def get_item(self, **request):
        assert request['ConsistentRead'] is True
        with self.lock:
            return {'Item': copy.deepcopy(self.items.get(request['Key']['id']['S'], {}))}

    def transact_write_items(self, **request):
        with self.lock:
            if self.failures:
                raise self.failures.pop(0)
            writes = [entry['Put'] for entry in request['TransactItems']]
            codes = []
            for write in writes:
                current = self.items.get(write['Item']['id']['S'])
                valid = (current is None if write['ConditionExpression'] == 'attribute_not_exists(id)'
                         else current and current['lastNumber'] == write['ExpressionAttributeValues'][':previous'])
                codes.append('None' if valid else 'ConditionalCheckFailed')
            if any(code != 'None' for code in codes):
                raise cancelled(*codes)
            for write in writes:
                self.items[write['Item']['id']['S']] = copy.deepcopy(write['Item'])


def cancelled(*codes):
    return TransactionCanceled({
        'Error': {'Code': 'TransactionCanceledException', 'Message': 'Test conflict'},
        'CancellationReasons': [{'Code': code} for code in codes],
    }, 'TransactWriteItems')


class InvoiceNumberTests(unittest.TestCase):
    def test_shared_sequence_reprints_and_invoice_date_are_persistent(self):
        db = AtomicLedger()
        first = allocate_invoice_number(db, 'test', 'a', 'markham')
        second = allocate_invoice_number(db, 'test', 'b', 'vaughan')
        self.assertEqual(first['invoiceNumber'], 'INV-000001')
        self.assertEqual(second['invoiceNumber'], 'INV-000002')
        self.assertEqual(allocate_invoice_number(db, 'test', 'a', 'markham'), first)
        self.assertEqual(db.items['COUNTER#global']['lastNumber']['N'], '2')
        with self.assertRaises(InvoiceBranchMismatch):
            allocate_invoice_number(db, 'test', 'a', 'vaughan')

    def test_concurrent_orders_and_retries_do_not_duplicate_or_skip_numbers(self):
        db = AtomicLedger()
        with ThreadPoolExecutor(max_workers=12) as pool:
            results = list(pool.map(lambda i: allocate_invoice_number(
                db, 'test', f'order-{i % 20}', 'markham' if i % 2 else 'vaughan'), range(80)))
        self.assertEqual({row['invoiceNumber'] for row in results}, {f'INV-{i:06d}' for i in range(1, 21)})
        self.assertEqual(len(db.items), 21)
        for i in range(20):
            self.assertEqual(results[i], results[i + 20])

    def test_conflict_retries_but_other_errors_fail_closed(self):
        db = AtomicLedger()
        db.failures = [cancelled('TransactionConflict', 'None')]
        with patch('invoice_numbers.time.sleep'):
            self.assertEqual(allocate_invoice_number(db, 'test', 'a', 'markham')['invoiceNumber'], 'INV-000001')
        db.failures = [cancelled('ValidationError', 'None')]
        with self.assertRaises(TransactionCanceled):
            allocate_invoice_number(db, 'test', 'b', 'markham')
        self.assertEqual(db.items['COUNTER#global']['lastNumber']['N'], '1')

    def test_bounded_contention_returns_retryable_error_without_consuming_number(self):
        db = AtomicLedger()
        db.failures = [cancelled('TransactionConflict', 'None') for _ in range(12)]
        with patch('invoice_numbers.time.sleep'), self.assertRaises(InvoiceNumberBusy):
            allocate_invoice_number(db, 'test', 'a', 'markham')
        self.assertEqual(db.items, {})

    def test_retry_after_lost_response_reuses_committed_identity(self):
        db = AtomicLedger()
        commit = db.transact_write_items
        def lost_response(**request):
            commit(**request)
            raise TimeoutError('Response lost after commit')
        with patch.object(db, 'transact_write_items', side_effect=lost_response), self.assertRaises(TimeoutError):
            allocate_invoice_number(db, 'test', 'a', 'markham')
        self.assertEqual(allocate_invoice_number(db, 'test', 'a', 'markham')['invoiceNumber'], 'INV-000001')
        self.assertEqual(len(db.items), 2)

    def test_api_checks_admin_branch_and_service_before_allocating(self):
        table = MagicMock()
        with patch.object(app, 'SERVICE_TABLE', table), patch.object(app, 'allocate_invoice_number') as allocate, \
                patch.object(app, 'INVOICE_NUMBER_TABLE', 'test'):
            request = event(method='POST', path='/admin/invoices/number')
            request['body'] = json.dumps({'serviceId': 'order', 'branchId': 'vaughan'})
            table.get_item.return_value = {'Item': {'ID': 'order', 'branchId': 'markham'}}
            self.assertEqual(app.lambda_handler(request, None)['statusCode'], 404)
            table.get_item.return_value = {}
            self.assertEqual(app.lambda_handler(request, None)['statusCode'], 404)
            request['requestContext']['authorizer']['jwt']['claims']['cognito:groups'] = ['customer']
            self.assertEqual(app.lambda_handler(request, None)['statusCode'], 403)
            allocate.assert_not_called()
            request['requestContext']['authorizer']['jwt']['claims']['cognito:groups'] = ['vaughan-admin']
            table.get_item.return_value = {'Item': {'ID': 'order', 'branchId': 'vaughan'}}
            allocate.return_value = {'invoiceNumber': 'INV-000001', 'invoiceDate': '2026-09-28'}
            self.assertEqual(app.lambda_handler(request, None)['statusCode'], 200)
            allocate.assert_called_once_with(app.invoice_db, 'test', 'order', 'vaughan')


if __name__ == '__main__':
    unittest.main()
