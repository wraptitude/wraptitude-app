import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import MagicMock, patch

with patch.dict(os.environ, {'USER_TABLE': 'users', 'MEMBERSHIP_TABLE': 'memberships'}), patch('boto3.resource'):
    spec = importlib.util.spec_from_file_location('signup', Path(__file__).with_name('account_signup.py'))
    signup = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(signup)


class SignupTests(unittest.TestCase):
    def test_new_account_immediately_joins_only_registered_branch(self):
        for branch in ('markham', 'vaughan'):
            users, memberships = MagicMock(), MagicMock()
            users.update_item.return_value = {'Attributes': {'createdAt': '2026-09-23T00:00:00+00:00'}}
            event = {'triggerSource': 'PostConfirmation_ConfirmSignUp', 'request': {'userAttributes': {'sub': 'new-user', 'custom:home_branch': branch}}}
            with patch.object(signup, 'users', users), patch.object(signup, 'memberships', memberships):
                self.assertEqual(signup.lambda_handler(event, None), event)
            self.assertEqual(users.update_item.call_args.kwargs['ExpressionAttributeValues'][':branch'], branch)
            self.assertEqual(memberships.update_item.call_args.kwargs['Key'], {'branchId': branch, 'userId': 'new-user'})
            self.assertIn('if_not_exists(createdAt', users.update_item.call_args.kwargs['UpdateExpression'])

    def test_password_reset_does_not_overwrite_customer(self):
        with patch.object(signup, 'users') as users, patch.object(signup, 'memberships') as memberships:
            signup.lambda_handler({'triggerSource': 'PostConfirmation_ConfirmForgotPassword'}, None)
            users.update_item.assert_not_called()
            memberships.update_item.assert_not_called()

    def test_invalid_branch_does_not_create_membership(self):
        with patch.object(signup, 'memberships') as memberships:
            with self.assertRaises(ValueError):
                signup.lambda_handler({'triggerSource': 'PostConfirmation_ConfirmSignUp', 'request': {'userAttributes': {'sub': 'user', 'custom:home_branch': 'invalid'}}}, None)
            memberships.update_item.assert_not_called()


if __name__ == '__main__':
    unittest.main()
