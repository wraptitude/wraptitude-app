"""Offline global-ordering, pagination, ownership and timestamp regressions."""
import unittest
from unittest.mock import MagicMock, patch

from boto3.dynamodb.conditions import ConditionExpressionBuilder
from test_orders import app, cursor, event
from sort_keys import OLDEST_DATE, ORDER_INDEX, canonical_date, chronological_key


class SortedListTests(unittest.TestCase):
    def setUp(self):
        self.services = MagicMock()
        self.quotes = MagicMock()
        self.memberships = MagicMock()
        for name, table in [('SERVICE_TABLE', self.services), ('QUOTE_TABLE', self.quotes),
                            ('MEMBERSHIP_TABLE', self.memberships)]:
            table.query.return_value = {'Items': []}
            p = patch.object(app, name, table)
            p.start()
            self.addCleanup(p.stop)

    def test_timezone_and_fraction_precision_are_normalized(self):
        self.assertEqual(canonical_date('2026-09-25T10:00:00-04:00'),
                         '2026-09-25T14:00:00.000000+00:00')
        self.assertEqual(canonical_date('2026-09-25T14:00:00Z'),
                         canonical_date('2026-09-25T14:00:00.000000+00:00'))
        self.assertLess(chronological_key('2026-11-01T01:59:59-04:00', 'a'),
                        chronological_key('2026-11-01T01:00:00-05:00', 'b'))
        self.assertEqual(canonical_date('bad'), OLDEST_DATE)
        self.assertLess(chronological_key(None, 'z'), chronological_key('2025-01-01', 'a'))
        self.assertLess(chronological_key('2025-01-01', 'a'), chronological_key('2025-01-01', 'b'))

    def test_orders_and_quotes_use_descending_branch_index_not_scan(self):
        for path, table in [('/admin/services', self.services), ('/admin/quotes', self.quotes)]:
            for branch in ['markham', 'vaughan']:
                result = app.route(event(branch, 'super-admin', path=path, pageSize='15', sort='newest'))
                args = table.query.call_args.kwargs
                self.assertEqual(args['IndexName'], ORDER_INDEX)
                self.assertFalse(args['ScanIndexForward'])
                self.assertEqual(args['Limit'], 15)
                expression = ConditionExpressionBuilder().build_expression(args['KeyConditionExpression'])
                self.assertEqual(list(expression.attribute_value_placeholders.values()), [branch])
                self.assertNotIn('FilterExpression', args)
                self.assertEqual(result, {'items': [], 'nextCursor': None})
            table.scan.assert_not_called()

    def test_cursor_resumes_full_index_key_and_final_page_ends(self):
        key = {'branchId': 'vaughan', 'ID': 'b', 'chronologicalKey': chronological_key('2026-09-24', 'b')}
        self.quotes.query.side_effect = [
            {'Items': [{'ID': 'a', 'branchId': 'vaughan'}, {'ID': 'b', 'branchId': 'vaughan'}], 'LastEvaluatedKey': key},
            {'Items': [{'ID': 'c', 'branchId': 'vaughan'}]},
        ]
        with patch.object(app, 'sign_item_images', side_effect=lambda item, *_: item):
            first = app.route(event(path='/admin/quotes', pageSize='2'))
            second = app.route(event(path='/admin/quotes', pageSize='2', cursor=first['nextCursor']))
        self.assertEqual(self.quotes.query.call_args.kwargs['ExclusiveStartKey'], key)
        self.assertEqual([r['ID'] for r in first['items'] + second['items']], ['a', 'b', 'c'])
        self.assertIsNone(second['nextCursor'])

    def test_wrong_branch_and_malformed_cursor_fail_before_read(self):
        valid_key = {'branchId': 'vaughan', 'ID': 'a', 'chronologicalKey': chronological_key('2026-09-25', 'a')}
        for path, table in [('/admin/services', self.services), ('/admin/quotes', self.quotes)]:
            self.assertEqual(app.lambda_handler(event(branch='markham', path=path, pageSize='20', sort='newest'), None)['statusCode'], 403)
            for value in ['%', cursor([]), cursor({**valid_key, 'branchId': 'markham'}),
                          cursor({**valid_key, 'ID': 1}), cursor({'branchId': 'vaughan', 'ID': 'a'})]:
                self.assertEqual(app.lambda_handler(event(path=path, pageSize='20', sort='newest', cursor=value), None)['statusCode'], 400)
            table.query.assert_not_called()

    def test_invalid_page_sizes_do_not_read(self):
        for size in ['0', '51', 'bad', '-1', '1.2']:
            self.assertEqual(app.lambda_handler(event(sort='newest', pageSize=size), None)['statusCode'], 400)
        self.services.query.assert_not_called()

    def test_index_result_branch_checked_before_signing_images(self):
        self.quotes.query.return_value = {'Items': [{'ID': 'a', 'branchId': 'markham'}]}
        with patch.object(app, 'sign_item_images') as sign:
            result = app.lambda_handler(event(path='/admin/quotes', pageSize='20'), None)
        self.assertEqual(result['statusCode'], 404)
        sign.assert_not_called()

    def test_quotes_sign_only_current_page(self):
        self.quotes.query.return_value = {'Items': [{'ID': 'a', 'branchId': 'vaughan', 'imageUrl': 'private-key'}]}
        with patch.object(app, 'sign_item_images', return_value={'ID': 'a', 'imageUrl': 'signed'}) as sign:
            result = app.route(event(path='/admin/quotes', pageSize='20'))
        self.assertEqual(result['items'][0]['imageUrl'], 'signed')
        sign.assert_called_once()

    def test_clients_already_use_descending_created_index(self):
        app.route(event(path='/admin/clients', pageSize='20'))
        args = self.memberships.query.call_args.kwargs
        self.assertEqual(args['IndexName'], 'branchId-clientCreatedAt-index')
        self.assertFalse(args['ScanIndexForward'])
        self.assertEqual(args['Limit'], 20)

    def test_order_edit_keeps_original_creation_sort_key(self):
        import json
        original = {'ID': 'a', 'branchId': 'vaughan', 'userID': 'u', 'createAt': '2025-01-01T00:00:00Z'}
        self.services.get_item.return_value = {'Item': original}
        request = event(method='PATCH', path='/admin/services/a')
        request['body'] = json.dumps({'branchId': 'vaughan', 'createAt': '2099-01-01', 'chronologicalKey': 'spoof', 'step1': 'completed'})
        with patch.object(app, 'sign_item_images', side_effect=lambda item, *_: item):
            app.route(request)
        written = self.services.put_item.call_args.kwargs['Item']
        self.assertEqual(written['createAt'], original['createAt'])
        self.assertEqual(written['chronologicalKey'], chronological_key(original['createAt'], 'a'))

    def test_new_quote_key_uses_server_time_and_id(self):
        import json
        request = event(method='POST', path='/public/quotes')
        request['body'] = json.dumps({'branchId': 'vaughan', 'submittedAt': '2099-01-01', 'chronologicalKey': 'spoof'})
        app.route(request)
        written = self.quotes.put_item.call_args.kwargs['Item']
        self.assertNotEqual(written['submittedAt'], '2099-01-01')
        self.assertEqual(written['chronologicalKey'], chronological_key(written['submittedAt'], written['ID']))


if __name__ == '__main__':
    unittest.main()
