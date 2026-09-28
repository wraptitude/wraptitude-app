#!/usr/bin/env python3
"""Backfill legacy records as Markham and create branch memberships.

Safe to run repeatedly. Existing branchId values are preserved.
"""

from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Attr


REGION = "us-east-2"
DEFAULT_BRANCH = "markham"
PROFILE = "wraptitude"

TABLES = {
    "users": "wraptitudeAppUser",
    "services": "wraptitudeAppService",
    "quotes": "wraptitudeAppQuote",
    "non_urgent": "wraptitudeAppEmergencyServiceNonUrgentForm",
    "urgent": "wraptitudeAppEmergencyServiceUrgentRecord",
    "memberships": "wraptitudeBranchMembership",
}


def scan_all(table, **kwargs):
    items = []
    while True:
        result = table.scan(**kwargs)
        items.extend(result.get("Items", []))
        if "LastEvaluatedKey" not in result:
            return items
        kwargs["ExclusiveStartKey"] = result["LastEvaluatedKey"]


def add_membership(table, user_id, source):
    if not user_id:
        return
    timestamp = datetime.now(timezone.utc).isoformat()
    table.update_item(
        Key={"branchId": DEFAULT_BRANCH, "userId": user_id},
        UpdateExpression=(
            "SET createdAt = if_not_exists(createdAt, :created), lastActiveAt = :active "
            "ADD sources :sources"
        ),
        ExpressionAttributeValues={
            ":created": timestamp,
            ":active": timestamp,
            ":sources": {source},
        },
    )


def main():
    session = boto3.Session(profile_name=PROFILE, region_name=REGION)
    dynamodb = session.resource("dynamodb")
    membership_table = dynamodb.Table(TABLES["memberships"])

    counts = {}
    for logical_name in ("services", "quotes", "non_urgent", "urgent"):
        table = dynamodb.Table(TABLES[logical_name])
        records = scan_all(table, FilterExpression=Attr("branchId").not_exists())
        counts[logical_name] = len(records)
        for item in records:
            update_expression = "SET branchId = :branch"
            if logical_name == "services" and item.get("userID") == "":
                update_expression += " REMOVE userID"
            table.update_item(
                Key={"ID": item["ID"]},
                UpdateExpression=update_expression,
                ExpressionAttributeValues={":branch": DEFAULT_BRANCH},
                ConditionExpression=Attr("branchId").not_exists(),
            )
            add_membership(
                membership_table,
                item.get("userID") or item.get("userId"),
                logical_name,
            )

    users = scan_all(dynamodb.Table(TABLES["users"]))
    counts["users"] = len(users)
    for user in users:
        add_membership(membership_table, user.get("userId"), "legacy-user")

    print("Migration complete:", counts)


if __name__ == "__main__":
    main()
