#!/usr/bin/env python3
"""Populate the client registration date used by branch customer pagination."""

import argparse
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError


def memberships(table):
    arguments = {"ProjectionExpression": "branchId, userId, createdAt, clientCreatedAt"}
    while True:
        result = table.scan(**arguments)
        yield from result.get("Items", [])
        if "LastEvaluatedKey" not in result:
            return
        arguments["ExclusiveStartKey"] = result["LastEvaluatedKey"]


def normalized_created_at(value):
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).isoformat()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write missing dates to DynamoDB")
    parser.add_argument("--profile", default="wraptitude")
    parser.add_argument("--region", default="us-east-2")
    arguments = parser.parse_args()

    session = boto3.Session(profile_name=arguments.profile, region_name=arguments.region)
    dynamodb = session.resource("dynamodb")
    membership_table = dynamodb.Table("wraptitudeBranchMembership")
    user_table = dynamodb.Table("wraptitudeAppUser")

    missing = 0
    updated = 0
    for membership in memberships(membership_table):
        user = user_table.get_item(
            Key={"userId": membership["userId"]},
            ProjectionExpression="createdAt",
        ).get("Item") or {}
        original_date = user.get("createdAt") or membership.get("createdAt") or datetime.now(timezone.utc).isoformat()
        created_at = normalized_created_at(original_date)
        previous_date = membership.get("clientCreatedAt")
        if previous_date == created_at:
            continue
        missing += 1
        if arguments.apply:
            try:
                membership_table.update_item(
                    Key={"branchId": membership["branchId"], "userId": membership["userId"]},
                    UpdateExpression="SET clientCreatedAt = :created",
                    ConditionExpression=(
                        Attr("clientCreatedAt").eq(previous_date)
                        if previous_date else Attr("clientCreatedAt").not_exists()
                    ),
                    ExpressionAttributeValues={":created": created_at},
                )
                updated += 1
            except ClientError as error:
                if error.response["Error"]["Code"] != "ConditionalCheckFailedException":
                    raise

    print(f"Dates to update: {missing}; updated: {updated}; dry run: {not arguments.apply}")


if __name__ == "__main__":
    main()
