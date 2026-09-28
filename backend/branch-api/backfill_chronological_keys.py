"""Audit/backfill only sort metadata; existing timestamps and branches are untouched.

Indexes are additive on legacy externally-managed tables, not new SAM resources.
Default is read-only. Run --apply only after backups and writer rollout, then verify.
"""
import argparse
import json
import sys

import boto3
from boto3.dynamodb.conditions import Attr

from sort_keys import OLDEST_DATE, ORDER_INDEX, canonical_date, chronological_key

TABLES = {'wraptitudeAppService': 'createAt', 'wraptitudeAppQuote': 'submittedAt'}
EXPECTED_ACCOUNT = '539247487854'


def backfill(db, table_name, date_field, apply=False):
    table = db.Table(table_name)
    totals = dict(rows=0, missing_branch=0, invalid_dates=0, needs_update=0, updated=0, conflicts=0)
    for page in db.meta.client.get_paginator('scan').paginate(
        TableName=table_name, ConsistentRead=True,
        ProjectionExpression='#id, branchId, #date, chronologicalKey',
        ExpressionAttributeNames={'#id': 'ID', '#date': date_field},
    ):
        for item in page.get('Items', []):
            totals['rows'] += 1
            if item.get('branchId') not in ('markham', 'vaughan'):
                totals['missing_branch'] += 1
                continue
            date = item.get(date_field)
            totals['invalid_dates'] += canonical_date(date) == OLDEST_DATE
            key = chronological_key(date, item['ID'])
            if item.get('chronologicalKey') == key:
                continue
            totals['needs_update'] += 1
            if apply:
                condition = Attr('ID').exists() & Attr('branchId').eq(item['branchId'])
                condition &= Attr(date_field).eq(date) if date_field in item else Attr(date_field).not_exists()
                condition &= (Attr('chronologicalKey').eq(item['chronologicalKey'])
                              if 'chronologicalKey' in item else Attr('chronologicalKey').not_exists())
                try:
                    table.update_item(
                        Key={'ID': item['ID']},
                        UpdateExpression='SET chronologicalKey = :key',
                        ExpressionAttributeValues={':key': key},
                        ConditionExpression=condition,
                    )
                    totals['updated'] += 1
                except db.meta.client.exceptions.ConditionalCheckFailedException:
                    # Do not overwrite a concurrent edit or recreate a deleted record.
                    totals['conflicts'] += 1
    return totals


def ensure_index(client, table_name):
    table = client.describe_table(TableName=table_name)['Table']
    schema = [{'AttributeName': 'branchId', 'KeyType': 'HASH'},
              {'AttributeName': 'chronologicalKey', 'KeyType': 'RANGE'}]
    for index in table.get('GlobalSecondaryIndexes', []):
        if index['IndexName'] == ORDER_INDEX:
            if index['KeySchema'] != schema or index['Projection']['ProjectionType'] != 'ALL':
                raise ValueError(f'Unexpected existing index schema: {table_name}')
            return index['IndexStatus']
    if table.get('BillingModeSummary', {}).get('BillingMode') != 'PAY_PER_REQUEST':
        raise ValueError('Review capacity settings before changing a provisioned table')
    client.update_table(
        TableName=table_name,
        AttributeDefinitions=[{'AttributeName': 'branchId', 'AttributeType': 'S'},
                              {'AttributeName': 'chronologicalKey', 'AttributeType': 'S'}],
        GlobalSecondaryIndexUpdates=[{'Create': {
            'IndexName': ORDER_INDEX, 'KeySchema': schema,
            'Projection': {'ProjectionType': 'ALL'},
        }}],
    )
    return 'CREATING'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--profile', default='wraptitude')
    parser.add_argument('--region', default='us-east-2')
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--create-indexes', action='store_true')
    args = parser.parse_args()
    session = boto3.Session(profile_name=args.profile, region_name=args.region)
    if session.client('sts').get_caller_identity()['Account'] != EXPECTED_ACCOUNT:
        raise ValueError('Not the Wraptitude AWS account')
    db = session.resource('dynamodb')
    result = {name: backfill(db, name, date_field, args.apply) for name, date_field in TABLES.items()}
    if args.create_indexes:
        if not args.apply:
            raise ValueError('--create-indexes requires --apply and prior backups')
        for name in TABLES:
            result[name]['index_status'] = ensure_index(db.meta.client, name)
    print(json.dumps(result, indent=2))
    return 1 if any(row['conflicts'] or row['missing_branch'] for row in result.values()) else 0


if __name__ == '__main__':
    sys.exit(main())
