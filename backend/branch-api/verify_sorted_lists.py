"""Read-only deployed-handler smoke test via operator IAM (not JWT login testing)."""
import argparse
import base64
import json

import boto3

from sort_keys import ORDER_INDEX, canonical_date, chronological_key


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--profile', default='wraptitude')
    args = parser.parse_args()
    session = boto3.Session(profile_name=args.profile, region_name='us-east-2')
    assert session.client('sts').get_caller_identity()['Account'] == '539247487854'
    client = session.client('lambda')
    db = session.resource('dynamodb').meta.client

    def request(kind, branch, group='super-admin', cursor=None):
        query = {'branchId': branch, 'pageSize': '20', 'sort': 'newest'}
        if cursor:
            query['cursor'] = cursor
        event = {
            'rawPath': f'/admin/{kind}',
            'requestContext': {'http': {'method': 'GET'},
                               'authorizer': {'jwt': {'claims': {'cognito:groups': [group]}}}},
            'queryStringParameters': query,
        }
        response = client.invoke(FunctionName='wraptitudeBranchApi', Payload=json.dumps(event).encode())
        assert 'FunctionError' not in response
        return json.loads(response['Payload'].read())

    for kind, table, field, id_field in [
        ('services', 'wraptitudeAppService', 'createAt', 'ID'),
        ('quotes', 'wraptitudeAppQuote', 'submittedAt', 'ID'),
        ('clients', None, 'createdAt', 'userId'),
    ]:
        baseline = None
        if table:
            description = db.describe_table(TableName=table)['Table']
            assert next(i for i in description['GlobalSecondaryIndexes'] if i['IndexName'] == ORDER_INDEX)['IndexStatus'] == 'ACTIVE'
            baseline = [item for page in db.get_paginator('scan').paginate(
                TableName=table, ConsistentRead=True,
                ProjectionExpression='#id, branchId, #date, chronologicalKey',
                ExpressionAttributeNames={'#id': id_field, '#date': field},
            ) for item in page.get('Items', [])]
        for branch in ('markham', 'vaughan'):
            records, page_sizes, seen_cursors = [], [], set()
            next_cursor = None
            for _ in range(1000):
                result = request(kind, branch, cursor=next_cursor)
                assert result['statusCode'] == 200, (kind, branch, result['statusCode'])
                page = json.loads(result['body'])['data']
                assert len(page['items']) <= 20
                assert all(item['branchId'] == branch for item in page['items'])
                records.extend(page['items'])
                page_sizes.append(len(page['items']))
                next_cursor = page['nextCursor']
                if not next_cursor:
                    break
                assert next_cursor not in seen_cursors
                seen_cursors.add(next_cursor)
            else:
                raise AssertionError('Pagination never ended')
            ids = [row[id_field] for row in records]
            assert len(ids) == len(set(ids)), 'Duplicate records across pages'
            dates = [canonical_date(row.get(field)) for row in records]
            assert dates == sorted(dates, reverse=True), f'{kind} is not globally newest-first'
            if baseline is not None:
                expected = sorted([row for row in baseline if row['branchId'] == branch],
                                  key=lambda row: chronological_key(row.get(field), row[id_field]), reverse=True)
                assert ids == [row[id_field] for row in expected], 'Missing, extra or misordered records'
            print(json.dumps({'list': kind, 'branch': branch, 'count': len(records),
                              'pageSizes': page_sizes, 'newestFirst': True}), flush=True)
        for branch, group in [('markham', 'vaughan-admin'), ('vaughan', 'markham-admin')]:
            assert request(kind, branch, group)['statusCode'] == 403
        if kind != 'clients':
            wrong_branch_cursor = base64.urlsafe_b64encode(json.dumps({
                'branchId': 'markham', 'ID': 'not-a-real-id',
                'chronologicalKey': chronological_key('2026-01-01', 'not-a-real-id'),
            }).encode()).decode().rstrip('=')
            assert request(kind, 'vaughan', 'vaughan-admin', wrong_branch_cursor)['statusCode'] == 400
    print('PASS: deployed handler ordering, complete pagination and branch rejection. No records changed.')


if __name__ == '__main__':
    main()
