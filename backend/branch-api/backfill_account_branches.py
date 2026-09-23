"""Backfill fixed account branches and membership. Dry-run unless --apply.

Never reassigns orders, deletes memberships, or changes Cognito users. Accounts
without the new immutable signup attribute are Markham customers.
"""
import argparse
from datetime import datetime, timezone
import boto3


def backfill(session, apply=False):
    cognito = session.client('cognito-idp')
    accounts = {}
    for page in cognito.get_paginator('list_users').paginate(UserPoolId='us-east-2_YkquiI7T9'):
        for user in page['Users']:
            attributes = {item['Name']: item['Value'] for item in user['Attributes']}
            branch = attributes.get('custom:home_branch', 'markham')
            if branch not in ('markham', 'vaughan'):
                raise ValueError('Invalid Cognito branch; refusing backfill')
            accounts[attributes['sub']] = branch
    db = session.resource('dynamodb')
    users = db.Table('wraptitudeAppUser')
    memberships = db.Table('wraptitudeBranchMembership')
    counts = {'markham': 0, 'vaughan': 0, 'missingCognitoAccount': 0, 'missingMembership': 0}
    timestamp = datetime.now(timezone.utc).isoformat()
    for page in db.meta.client.get_paginator('scan').paginate(TableName=users.name):
        for user in page.get('Items', []):
            user_id = user.get('userId')
            branch = accounts.get(user_id)
            if branch is None:
                counts['missingCognitoAccount'] += 1
                continue
            counts[branch] += 1
            membership_key = {'branchId': branch, 'userId': user_id}
            if not memberships.get_item(Key=membership_key).get('Item'):
                counts['missingMembership'] += 1
            if not apply:
                continue
            raw_created = user.get('createdAt') or timestamp
            created = datetime.fromisoformat(raw_created.replace('Z', '+00:00'))
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            created_at = created.astimezone(timezone.utc).isoformat()
            users.update_item(Key={'userId': user_id}, UpdateExpression='SET homeBranchId = :branch',
                              ExpressionAttributeValues={':branch': branch})
            memberships.update_item(
                Key=membership_key,
                UpdateExpression='SET createdAt = if_not_exists(createdAt, :created), clientCreatedAt = :client_created ADD sources :sources',
                ExpressionAttributeValues={':created': timestamp, ':client_created': created_at, ':sources': {'account'}},
            )
    print({'apply': apply, **counts})
    return counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    backfill(boto3.Session(profile_name='wraptitude', region_name='us-east-2'), args.apply)


if __name__ == '__main__':
    main()
