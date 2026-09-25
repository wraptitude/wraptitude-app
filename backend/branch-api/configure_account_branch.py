"""Configure the existing customer pool without replacing unrelated settings.

Dry-run by default. Deploy the SAM stack and back up the pool/client configuration
before --apply. The immutable schema attribute cannot be removed once added.
"""
import argparse
import boto3

POOL_ID = 'us-east-2_YkquiI7T9'
CLIENT_ID = '7vlqq7r376oloodmlr2vgucfgl'
ATTRIBUTE = 'custom:home_branch'


def configure(cognito, trigger_arn, apply=False):
    pool = cognito.describe_user_pool(UserPoolId=POOL_ID)['UserPool']
    client = cognito.describe_user_pool_client(UserPoolId=POOL_ID, ClientId=CLIENT_ID)['UserPoolClient']
    existing = next((item for item in pool['SchemaAttributes'] if item['Name'] == ATTRIBUTE), None)
    if existing and (existing['Mutable'] or existing['AttributeDataType'] != 'String'):
        raise ValueError('Existing home_branch schema is incompatible; refusing to change it')
    print({'addImmutableAttribute': existing is None, 'postConfirmationTrigger': trigger_arn, 'apply': apply})
    if not apply:
        return
    if not existing:
        cognito.add_custom_attributes(UserPoolId=POOL_ID, CustomAttributes=[{
            'Name': 'home_branch', 'AttributeDataType': 'String', 'Mutable': False,
            'StringAttributeConstraints': {'MinLength': '7', 'MaxLength': '7'},
        }])
    # Missing read/write lists mean default access to all attributes. Explicit
    # lists need the new attribute appended; preserve every other client setting.
    client_fields = cognito.meta.service_model.operation_model('UpdateUserPoolClient').input_shape.members
    client_update = {key: value for key, value in client.items() if key in client_fields}
    changed = False
    for field in ('ReadAttributes', 'WriteAttributes'):
        if field in client and ATTRIBUTE not in client[field]:
            client_update[field] = [*client[field], ATTRIBUTE]
            changed = True
    if changed:
        cognito.update_user_pool_client(**client_update)
    # update-user-pool is a full configuration update. Preserve supported fields
    # and every other trigger, including the existing pre-signup flow.
    pool_fields = cognito.meta.service_model.operation_model('UpdateUserPool').input_shape.members
    pool_update = {key: value for key, value in pool.items() if key in pool_fields}
    pool_update['UserPoolId'] = POOL_ID
    pool_update['PoolName'] = pool['Name']
    pool_update['LambdaConfig'] = {**pool.get('LambdaConfig', {}), 'PostConfirmation': trigger_arn}
    cognito.update_user_pool(**pool_update)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    session = boto3.Session(profile_name='wraptitude', region_name='us-east-2')
    trigger = session.client('lambda').get_function_configuration(FunctionName='wraptitudeCustomerAccountSignup')
    configure(session.client('cognito-idp'), trigger['FunctionArn'], args.apply)


if __name__ == '__main__':
    main()
