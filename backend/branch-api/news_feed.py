"""Compatibility handler for the API URL already installed in mobile apps."""
import json
import os

import boto3
from news import NewsStore

store = NewsStore(
    boto3.resource('dynamodb').Table(os.environ['NEWS_TABLE']),
    boto3.client('s3'), os.environ['NEWS_IMAGE_BUCKET'],
)


def lambda_handler(event, context):
    # The existing REST API returns this envelope as JSON (non-proxy integration).
    return {
        'statusCode': 200,
        'body': json.dumps(store.public_posts()),
        'headers': {'Content-Type': 'application/json', 'Cache-Control': 'no-store'},
    }
