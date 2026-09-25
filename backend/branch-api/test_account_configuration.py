import unittest
from unittest.mock import MagicMock
from botocore.session import Session
from configure_account_branch import configure


class ConfigurationTests(unittest.TestCase):
    def client(self):
        cognito = MagicMock()
        cognito.meta.service_model = Session().get_service_model('cognito-idp')
        cognito.describe_user_pool.return_value = {'UserPool': {
            'Id': 'us-east-2_YkquiI7T9', 'Name': 'existing-customer-pool', 'SchemaAttributes': [],
            'LambdaConfig': {'PreSignUp': 'existing-pre-signup', 'PostConfirmation': 'old-post-confirmation'},
            'MfaConfiguration': 'OFF', 'Policies': {'PasswordPolicy': {'MinimumLength': 6}},
            'AutoVerifiedAttributes': [], 'UserPoolTags': {'application': 'wraptitude'},
        }}
        cognito.describe_user_pool_client.return_value = {'UserPoolClient': {
            'UserPoolId': 'us-east-2_YkquiI7T9', 'ClientId': 'client', 'ClientName': 'existing-app',
            'ReadAttributes': ['name'], 'WriteAttributes': ['name'],
            'ExplicitAuthFlows': ['ALLOW_USER_SRP_AUTH'], 'RefreshTokenValidity': 30,
        }}
        return cognito

    def test_dry_run_never_mutates_configuration(self):
        cognito = self.client()
        configure(cognito, 'new-trigger')
        cognito.update_user_pool.assert_not_called()
        cognito.update_user_pool_client.assert_not_called()
        cognito.add_custom_attributes.assert_not_called()

    def test_preserves_existing_auth_and_trigger_configuration(self):
        cognito = self.client()
        configure(cognito, 'new-trigger', apply=True)
        pool = cognito.update_user_pool.call_args.kwargs
        client = cognito.update_user_pool_client.call_args.kwargs
        self.assertEqual(pool['LambdaConfig'], {'PreSignUp': 'existing-pre-signup', 'PostConfirmation': 'new-trigger'})
        self.assertEqual(pool['MfaConfiguration'], 'OFF')
        self.assertEqual(pool['Policies']['PasswordPolicy']['MinimumLength'], 6)
        self.assertEqual(client['ExplicitAuthFlows'], ['ALLOW_USER_SRP_AUTH'])
        self.assertEqual(client['RefreshTokenValidity'], 30)
        self.assertEqual(client['WriteAttributes'], ['name', 'custom:home_branch'])
        self.assertFalse(cognito.add_custom_attributes.call_args.kwargs['CustomAttributes'][0]['Mutable'])

    def test_refuses_mutable_existing_attribute(self):
        cognito = self.client()
        cognito.describe_user_pool.return_value['UserPool']['SchemaAttributes'] = [{'Name': 'custom:home_branch', 'Mutable': True, 'AttributeDataType': 'String'}]
        with self.assertRaises(ValueError):
            configure(cognito, 'new-trigger', apply=True)
        cognito.update_user_pool.assert_not_called()


if __name__ == '__main__':
    unittest.main()
