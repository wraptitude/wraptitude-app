"""Customer post-confirmation trigger: fixed signup branch and immediate membership."""
import os
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource('dynamodb')
users = dynamodb.Table(os.environ['USER_TABLE'])
memberships = dynamodb.Table(os.environ['MEMBERSHIP_TABLE'])


def lambda_handler(event, _context):
    # Password resets must not recreate customer profiles or memberships.
    if event.get('triggerSource') != 'PostConfirmation_ConfirmSignUp':
        return event
    attributes = event['request']['userAttributes']
    user_id = attributes['sub']
    branch_id = attributes.get('custom:home_branch', 'markham')
    if branch_id not in ('markham', 'vaughan'):
        raise ValueError('Invalid registered branch')
    timestamp = datetime.now(timezone.utc).isoformat()
    result = users.update_item(
        Key={'userId': user_id},
        UpdateExpression='SET #name = :name, email = :email, phone_number = :phone, homeBranchId = :branch, createdAt = if_not_exists(createdAt, :created)',
        ExpressionAttributeNames={'#name': 'name'},
        ExpressionAttributeValues={':name': attributes.get('name', ''), ':email': attributes.get('email', ''),
                                   ':phone': attributes.get('phone_number', ''), ':branch': branch_id, ':created': timestamp},
        ReturnValues='ALL_NEW',
    )
    memberships.update_item(
        Key={'branchId': branch_id, 'userId': user_id},
        UpdateExpression='SET createdAt = if_not_exists(createdAt, :created), clientCreatedAt = :client_created, lastActiveAt = :created ADD sources :sources',
        ExpressionAttributeValues={':created': timestamp, ':client_created': result['Attributes']['createdAt'], ':sources': {'account'}},
    )
    return event
