import unittest
from unittest.mock import MagicMock, patch
from boto3.dynamodb.conditions import ConditionExpressionBuilder
from test_orders import app, event


class ClientVehicleTests(unittest.TestCase):
    def test_order_vehicles_are_newest_first_deduplicated_and_branch_scoped(self):
        orders = [
            {'ID': 'old', 'branchId': 'markham', 'createAt': '2025-01-01', 'vehicleYear': '2020', 'vehicleMake': 'Honda', 'vehicleModel': 'Civic'},
            {'ID': 'new', 'branchId': 'markham', 'createAt': '2026-01-01', 'vehicleYear': '2024', 'vehicleMake': 'Tesla', 'vehicleModel': 'Model 3'},
            {'ID': 'repeat', 'branchId': 'markham', 'vehicleYear': '2020', 'vehicleMake': ' HONDA ', 'vehicleModel': 'Civic'},
            {'ID': 'empty', 'branchId': 'markham'},
            {'ID': 'other-branch', 'branchId': 'vaughan', 'vehicleMake': 'Hidden'},
        ]
        with patch.object(app, 'query_all', return_value=orders) as query:
            vehicles = app.client_vehicles({'userId': 'u', 'vehicleMake': 'Honda', 'vehicleModel': 'Civic', 'vehicleYear': '2020'}, 'markham')
        self.assertEqual([v['vehicleMake'] for v in vehicles], ['Tesla', 'Honda'])
        self.assertEqual(query.call_args.kwargs['IndexName'], 'userID-index')
        expression = ConditionExpressionBuilder().build_expression(query.call_args.kwargs['FilterExpression'])
        self.assertEqual(list(expression.attribute_value_placeholders.values()), ['markham'])
        self.assertNotIn('step1Img', query.call_args.kwargs['ProjectionExpression'])

    def test_legacy_profiles_partial_vehicles_and_empty_profiles(self):
        with patch.object(app, 'query_all', return_value=[]):
            self.assertEqual(app.client_vehicles({'userId': 'u'}, 'markham'), [])
            self.assertEqual(app.client_vehicles({'userId': 'u', 'vehicleYear': 2024, 'vehicleMake': ' Ford '}, 'markham'),
                             [{'vehicleYear': '2024', 'vehicleMake': 'Ford', 'vehicleModel': ''}])

    def test_vehicle_query_continues_past_empty_filtered_pages(self):
        table = MagicMock()
        table.query.side_effect = [
            {'Items': [], 'LastEvaluatedKey': {'ID': 'cursor', 'userID': 'u'}},
            {'Items': [{'ID': 'car', 'branchId': 'markham', 'vehicleMake': 'Toyota'}]},
        ]
        with patch.object(app, 'SERVICE_TABLE', table):
            self.assertEqual(app.client_vehicles({'userId': 'u'}, 'markham')[0]['vehicleMake'], 'Toyota')
        self.assertEqual(table.query.call_args.kwargs['ExclusiveStartKey'], {'ID': 'cursor', 'userID': 'u'})

    def test_client_listing_adds_vehicles_only_for_authorized_members(self):
        memberships = MagicMock()
        memberships.query.return_value = {'Items': [{'userId': 'matching'}, {'userId': 'other'}]}
        with patch.object(app, 'MEMBERSHIP_TABLE', memberships), \
             patch.object(app, 'account_branch', side_effect=['vaughan', 'markham']), \
             patch.object(app, 'user_by_id', return_value={'userId': 'matching'}), \
             patch.object(app, 'client_vehicles', return_value=[{'vehicleMake': 'Tesla'}]) as vehicles:
            result = app.route(event(path='/admin/clients', pageSize='20'))
        self.assertEqual(result['items'][0]['vehicles'], [{'vehicleMake': 'Tesla'}])
        self.assertEqual(len(result['items']), 1)
        vehicles.assert_called_once_with({'userId': 'matching'}, 'vaughan')


if __name__ == '__main__':
    unittest.main()
