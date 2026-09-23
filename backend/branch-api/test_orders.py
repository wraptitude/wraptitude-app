"""Offline branch-order authorization and pagination regression tests."""
import base64
import importlib.util
import json
import os
from pathlib import Path
import unittest
from unittest.mock import MagicMock, patch

from boto3.dynamodb.conditions import ConditionExpressionBuilder


ENV_KEYS = (
    'SERVICE_TABLE', 'USER_TABLE', 'QUOTE_TABLE', 'NON_URGENT_TABLE', 'URGENT_TABLE',
    'MEMBERSHIP_TABLE', 'VERSION_POLICY_TABLE', 'PRIVATE_SERVICE_BUCKET',
    'PRIVATE_QUOTE_BUCKET', 'PRIVATE_EMERGENCY_BUCKET', 'LEGACY_SERVICE_BUCKET',
    'LEGACY_QUOTE_BUCKET', 'LEGACY_EMERGENCY_BUCKET',
)
with patch.dict(os.environ, {key: key for key in ENV_KEYS}), \
        patch('boto3.resource'), patch('boto3.client'):
    spec = importlib.util.spec_from_file_location('branch_app', Path(__file__).with_name('app.py'))
    app = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(app)


def event(branch='vaughan', group='vaughan-admin', method='GET', path='/admin/services', **query):
    return {
        'rawPath': path,
        'requestContext': {
            'http': {'method': method},
            'authorizer': {'jwt': {'claims': {'sub': 'signed-in-customer', 'cognito:groups': [group]}}},
        },
        'queryStringParameters': {'branchId': branch, **query},
    }


def cursor(value):
    return base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip('=')


class OrderTests(unittest.TestCase):
    def setUp(self):
        self.table = MagicMock()
        self.table.scan.return_value = {'Items': []}
        self.table_patch = patch.object(app, 'SERVICE_TABLE', self.table)
        self.table_patch.start()
        self.addCleanup(self.table_patch.stop)
        self.cognito = MagicMock()
        self.cognito.admin_get_user.return_value = {'UserAttributes': [{'Name': 'custom:home_branch', 'Value': 'vaughan'}]}
        self.cognito_patch = patch.object(app, 'cognito', self.cognito)
        self.cognito_patch.start()
        self.addCleanup(self.cognito_patch.stop)

    def test_cross_branch_or_non_admin_rejected_before_read(self):
        for branch, group in [('markham', 'vaughan-admin'), ('vaughan', 'markham-admin'), ('markham', 'customer')]:
            with self.subTest(branch=branch, group=group):
                result = app.lambda_handler(event(branch, group), None)
                self.assertEqual(result['statusCode'], 403)
        self.table.scan.assert_not_called()

    def test_super_admin_still_reads_only_selected_branch_with_bounded_limit(self):
        for branch in ['markham', 'vaughan']:
            app.route(event(branch, 'super-admin', pageSize='15'))
            args = self.table.scan.call_args.kwargs
            self.assertEqual(args['Limit'], 15)
            expression = ConditionExpressionBuilder().build_expression(args['FilterExpression'])
            self.assertEqual(list(expression.attribute_name_placeholders.values()), ['branchId'])
            self.assertEqual(list(expression.attribute_value_placeholders.values()), [branch])

    def test_only_order_summary_and_basic_customer_contact_returned(self):
        self.table.scan.return_value = {'Items': [{
            'ID': 'v-order', 'branchId': 'vaughan', 'userID': 'shared-customer',
            'step5': 'pending', 'step1Img': 'private-key',
        }]}
        with patch.object(app, 'user_by_id', return_value={'name': 'Test', 'email': 'test@example.com', 'privateField': 'hidden'}):
            result = app.route(event())
        order = result['items'][0]
        self.assertEqual(order['branchId'], 'vaughan')
        self.assertEqual(order['customerName'], 'Test')
        self.assertNotIn('step1Img', order)
        self.assertNotIn('privateField', order)

    def test_empty_filtered_page_retains_cursor_and_resumes(self):
        self.table.scan.return_value = {'Items': [], 'LastEvaluatedKey': {'ID': 'scan-position'}}
        result = app.route(event())
        self.assertEqual(result['items'], [])
        self.assertTrue(result['nextCursor'])
        app.route(event(cursor=result['nextCursor']))
        self.assertEqual(self.table.scan.call_args.kwargs['ExclusiveStartKey'], {'ID': 'scan-position'})

    def test_invalid_or_cross_branch_cursors_rejected(self):
        for value in ['%', cursor({'branchId': 'markham', 'ID': 'm'}), cursor([]), cursor({'branchId': 'vaughan', 'ID': 1}), cursor({'branchId': 'vaughan', 'ID': 'v', 'extra': 'x'})]:
            with self.subTest(cursor=value):
                self.assertEqual(app.lambda_handler(event(cursor=value), None)['statusCode'], 400)
        self.table.scan.assert_not_called()

    def test_invalid_page_sizes_rejected(self):
        for size in ['0', '51', '-1', 'bad', '1.2']:
            self.assertEqual(app.lambda_handler(event(pageSize=size), None)['statusCode'], 400)
        self.table.scan.assert_not_called()

    def test_cannot_reassign_existing_order_or_delete_other_branch_order(self):
        self.table.get_item.return_value = {'Item': {'ID': 'm-order', 'userID': 'customer', 'branchId': 'markham'}}
        for method in ['PATCH', 'DELETE']:
            request = event(method=method, path='/admin/services/m-order')
            request['body'] = json.dumps({'branchId': 'vaughan', 'userID': 'different-customer'})
            self.assertEqual(app.lambda_handler(request, None)['statusCode'], 404)
        self.table.put_item.assert_not_called()
        self.table.delete_item.assert_not_called()

    def test_create_order_uses_authorized_branch_and_creates_membership(self):
        request = event(method='POST')
        request['body'] = json.dumps({'branchId': 'vaughan', 'userID': 'customer', 'vehicleMake': 'Test'})
        with patch.object(app, 'user_by_id', return_value={'userId': 'customer'}), \
                patch.object(app, 'add_membership') as membership, \
                patch.object(app, 'sign_item_images', side_effect=lambda item, *_: item):
            result = app.route(request)
            membership.assert_called_once_with('customer', 'vaughan', 'service')
        self.assertEqual(result['branchId'], 'vaughan')
        self.assertEqual(self.table.put_item.call_args.kwargs['Item']['branchId'], 'vaughan')

    def test_update_cannot_change_customer_ownership(self):
        self.table.get_item.return_value = {'Item': {'ID': 'v-order', 'userID': 'original', 'branchId': 'vaughan'}}
        request = event(method='PATCH', path='/admin/services/v-order')
        request['body'] = json.dumps({'branchId': 'vaughan', 'userID': 'different', 'details': 'Updated'})
        with patch.object(app, 'sign_item_images', side_effect=lambda item, *_: item):
            result = app.route(request)
        self.assertEqual(result['userID'], 'original')
        self.assertEqual(result['branchId'], 'vaughan')

    def test_customer_identity_comes_from_verified_claims_not_query(self):
        with patch.object(app, 'services_for_user', return_value=[]) as services:
            app.route(event(path='/customer/services', userID='victim'))
            services.assert_called_once_with('signed-in-customer', 'vaughan')

    def test_existing_accounts_without_attribute_are_markham(self):
        self.cognito.admin_get_user.return_value = {'UserAttributes': []}
        self.assertEqual(app.account_branch('legacy-customer'), 'markham')
        with patch.object(app, 'add_membership') as membership:
            result = app.route(event(branch='markham', path='/customer/account'))
        self.assertEqual(result['branchId'], 'markham')
        membership.assert_called_once_with('signed-in-customer', 'markham', 'account')

    def test_registered_customer_cannot_read_other_branch(self):
        with patch.object(app, 'services_for_user') as services:
            result = app.lambda_handler(event(branch='markham', path='/customer/services'), None)
        self.assertEqual(result['statusCode'], 403)
        services.assert_not_called()

    def test_customer_cannot_route_requests_to_other_branch(self):
        for path in ['/customer/quotes', '/customer/emergencies/urgent', '/customer/emergencies/non-urgent']:
            request = event(method='POST', path=path)
            request['body'] = json.dumps({'branchId': 'markham', 'userID': 'victim'})
            with self.subTest(path=path), patch.object(app, 'store_base64_image') as upload:
                self.assertEqual(app.lambda_handler(request, None)['statusCode'], 403)
                upload.assert_not_called()

    def test_admin_cannot_create_order_for_customer_registered_elsewhere(self):
        self.cognito.admin_get_user.return_value = {'UserAttributes': []}
        request = event(method='POST')
        request['body'] = json.dumps({'branchId': 'vaughan', 'userID': 'legacy-customer'})
        with patch.object(app, 'user_by_id', return_value={'userId': 'legacy-customer'}):
            self.assertEqual(app.lambda_handler(request, None)['statusCode'], 403)
        self.table.put_item.assert_not_called()

    def test_customer_branch_ignores_spoofed_token_custom_claim(self):
        self.cognito.admin_get_user.return_value = {'UserAttributes': []}
        request = event(branch='markham', path='/customer/branches')
        request['requestContext']['authorizer']['jwt']['claims']['custom:home_branch'] = 'vaughan'
        self.assertEqual(app.route(request), [{'branchId': 'markham'}])

    def test_invalid_account_branch_fails_closed(self):
        self.cognito.admin_get_user.return_value = {'UserAttributes': [{'Name': 'custom:home_branch', 'Value': 'unknown'}]}
        self.assertEqual(app.lambda_handler(event(path='/customer/services'), None)['statusCode'], 403)


if __name__ == '__main__':
    unittest.main()
