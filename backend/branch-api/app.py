import base64
import binascii
import json
import os
import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
from urllib.parse import urlparse

import boto3
from boto3.dynamodb.conditions import Attr, Key
from sort_keys import ORDER_INDEX, chronological_key


dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")
lambda_client = boto3.client("lambda")
sns = boto3.client("sns")
cognito = boto3.client("cognito-idp")
CUSTOMER_USER_POOL_ID = os.environ.get("CUSTOMER_USER_POOL_ID", "us-east-2_YkquiI7T9")

SERVICE_TABLE = dynamodb.Table(os.environ["SERVICE_TABLE"])
USER_TABLE = dynamodb.Table(os.environ["USER_TABLE"])
QUOTE_TABLE = dynamodb.Table(os.environ["QUOTE_TABLE"])
NON_URGENT_TABLE = dynamodb.Table(os.environ["NON_URGENT_TABLE"])
URGENT_TABLE = dynamodb.Table(os.environ["URGENT_TABLE"])
MEMBERSHIP_TABLE = dynamodb.Table(os.environ["MEMBERSHIP_TABLE"])
VERSION_POLICY_TABLE = dynamodb.Table(os.environ["VERSION_POLICY_TABLE"])

SERVICE_BUCKET = os.environ["PRIVATE_SERVICE_BUCKET"]
QUOTE_BUCKET = os.environ["PRIVATE_QUOTE_BUCKET"]
EMERGENCY_BUCKET = os.environ["PRIVATE_EMERGENCY_BUCKET"]
LEGACY_SERVICE_BUCKET = os.environ["LEGACY_SERVICE_BUCKET"]
LEGACY_QUOTE_BUCKET = os.environ["LEGACY_QUOTE_BUCKET"]
LEGACY_EMERGENCY_BUCKET = os.environ["LEGACY_EMERGENCY_BUCKET"]
INVOICE_EMAIL_FUNCTION = os.environ.get("INVOICE_EMAIL_FUNCTION", "")
NON_URGENT_TOPIC_ARN = os.environ.get("NON_URGENT_TOPIC_ARN", "")
ADMIN_ORIGIN = os.environ.get("ADMIN_ORIGIN", "https://main.dfik0czr5tmeb.amplifyapp.com")

BRANCHES = {
    "markham": {
        "id": "markham",
        "name": "Markham",
        "address": "23 Laidlaw Blvd Unit 3, Markham, ON L3P 1W7",
        "phone": "(437) 340-1121",
        "email": "wraptitude.ca@gmail.com",
        "hours": "Monday–Saturday 11:00 AM–7:00 PM; Sunday Closed",
    },
    "vaughan": {
        "id": "vaughan",
        "name": "Vaughan",
        "address": "8635 Keele Street, Unit 8, Vaughan, ON L4K 3P5",
        "phone": "(416) 818-1293",
        "email": "info@wraptitude-vaughan.ca",
        "hours": "Monday–Saturday 11:00 AM–7:00 PM; Sunday Closed",
    },
}

SERVICE_FIELDS = {
    "cost",
    "depositAmount",
    "details",
    "serviceTrackingEnable",
    "serviceType",
    "step0",
    "step1",
    "step2",
    "step3",
    "step4",
    "step5",
    "vehicleMake",
    "vehicleModel",
    "vehicleYear",
}
IMAGE_FIELDS = {f"step{number}Img" for number in range(6)}


class DecimalEncoder(json.JSONEncoder):
    def default(self, value: Any) -> Any:
        if isinstance(value, Decimal):
            return int(value) if value % 1 == 0 else float(value)
        return super().default(value)


class ApiError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalized_created_at(value: Any, fallback: str) -> str:
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat()
    except ValueError:
        return fallback


def response(status_code: int, body: Any) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
        },
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def parse_body(event: dict[str, Any]) -> dict[str, Any]:
    raw_body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw_body = base64.b64decode(raw_body).decode("utf-8")
    try:
        payload = json.loads(raw_body)
    except (TypeError, json.JSONDecodeError) as error:
        raise ApiError(400, "Invalid JSON body") from error
    if not isinstance(payload, dict):
        raise ApiError(400, "Request body must be an object")
    return payload


def request_details(event: dict[str, Any]) -> tuple[str, str]:
    http = event.get("requestContext", {}).get("http", {})
    return http.get("method", "GET").upper(), event.get("rawPath", "/")


def claims(event: dict[str, Any]) -> dict[str, Any]:
    return event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {})


def parse_groups(raw_groups: Any) -> set[str]:
    if isinstance(raw_groups, list):
        return set(raw_groups)
    if not raw_groups:
        return set()
    text = str(raw_groups).strip()
    if text.startswith("["):
        try:
            parsed = json.loads(text)
            return set(parsed) if isinstance(parsed, list) else set()
        except json.JSONDecodeError:
            text = text.strip("[]")
    return {group.strip().strip("'\"") for group in text.split(",") if group.strip()}


def allowed_admin_branches(event: dict[str, Any]) -> set[str]:
    user_claims = claims(event)
    groups = parse_groups(user_claims.get("cognito:groups"))
    if "super-admin" in groups:
        return set(BRANCHES)
    allowed = set()
    if "markham-admin" in groups:
        allowed.add("markham")
    if "vaughan-admin" in groups:
        allowed.add("vaughan")
    if not allowed:
        raise ApiError(403, "Administrator has no assigned branch")
    return allowed


def valid_branch(value: Any) -> str:
    branch_id = str(value or "").lower()
    if branch_id not in BRANCHES:
        raise ApiError(400, "branchId must be markham or vaughan")
    return branch_id


def admin_branch(event: dict[str, Any], payload: dict[str, Any] | None = None) -> str:
    payload = payload or {}
    query = event.get("queryStringParameters") or {}
    branch_id = valid_branch(payload.get("branchId") or query.get("branchId"))
    if branch_id not in allowed_admin_branches(event):
        raise ApiError(403, "Administrator cannot access this branch")
    return branch_id


def customer_id(event: dict[str, Any]) -> str:
    user_id = claims(event).get("sub")
    if not user_id:
        raise ApiError(401, "Missing customer identity")
    return str(user_id)


def scan_all(table: Any, filter_expression: Any | None = None) -> list[dict[str, Any]]:
    kwargs: dict[str, Any] = {}
    if filter_expression is not None:
        kwargs["FilterExpression"] = filter_expression
    items: list[dict[str, Any]] = []
    while True:
        result = table.scan(**kwargs)
        items.extend(result.get("Items", []))
        if "LastEvaluatedKey" not in result:
            return items
        kwargs["ExclusiveStartKey"] = result["LastEvaluatedKey"]


def query_all(table: Any, **kwargs: Any) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    while True:
        result = table.query(**kwargs)
        items.extend(result.get("Items", []))
        if "LastEvaluatedKey" not in result:
            return items
        kwargs["ExclusiveStartKey"] = result["LastEvaluatedKey"]


def user_by_id(user_id: str) -> dict[str, Any] | None:
    return USER_TABLE.get_item(Key={"userId": user_id}).get("Item")


def account_branch(user_id: str) -> str:
    """Immutable Cognito signup attribute, never a device setting or request field."""
    try:
        user = cognito.admin_get_user(UserPoolId=CUSTOMER_USER_POOL_ID, Username=user_id)
    except cognito.exceptions.UserNotFoundException as error:
        raise ApiError(404, "Customer account not found") from error
    attributes = {item["Name"]: item["Value"] for item in user.get("UserAttributes", [])}
    branch_id = attributes.get("custom:home_branch", "markham")
    if branch_id not in BRANCHES:
        raise ApiError(403, "Customer branch is not configured correctly")
    return branch_id


def customer_branch(event: dict[str, Any], payload: dict[str, Any] | None = None) -> str:
    branch_id = account_branch(customer_id(event))
    requested = (payload or {}).get("branchId") or (event.get("queryStringParameters") or {}).get("branchId")
    if requested is not None and valid_branch(requested) != branch_id:
        raise ApiError(403, "This account belongs to another branch")
    return branch_id


def customer_account(event: dict[str, Any]) -> dict[str, str]:
    user_id = customer_id(event)
    branch_id = customer_branch(event)
    add_membership(user_id, branch_id, "account")
    return {"userId": user_id, "branchId": branch_id}


def add_membership(user_id: str, branch_id: str, source: str) -> None:
    if not user_id:
        return
    timestamp = now_iso()
    user = user_by_id(user_id)
    client_created_at = normalized_created_at((user or {}).get("createdAt"), timestamp)
    MEMBERSHIP_TABLE.update_item(
        Key={"branchId": branch_id, "userId": user_id},
        UpdateExpression=(
            "SET createdAt = if_not_exists(createdAt, :created), "
            "clientCreatedAt = if_not_exists(clientCreatedAt, :client_created), "
            "lastActiveAt = :active "
            "ADD sources :sources"
        ),
        ExpressionAttributeValues={
            ":created": timestamp,
            ":client_created": client_created_at,
            ":active": timestamp,
            ":sources": {source},
        },
    )


def image_location(
    value: str,
    private_bucket: str,
    legacy_bucket: str,
    private_prefix: str,
) -> tuple[str, str]:
    if not value:
        return private_bucket, ""
    if not value.startswith("http"):
        key = value.lstrip("/")
        bucket = private_bucket if key.startswith(f"{private_prefix}/") else legacy_bucket
        return bucket, key
    parsed = urlparse(value)
    host = parsed.netloc.lower()
    if private_bucket in host:
        return private_bucket, parsed.path.lstrip("/")
    if legacy_bucket in host:
        return legacy_bucket, parsed.path.lstrip("/")
    raise ApiError(400, "Image belongs to an unexpected bucket")


def signed_get(bucket: str, key: str) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=900,
    )


def sign_item_images(
    item: dict[str, Any],
    private_bucket: str,
    legacy_bucket: str,
    private_prefix: str,
) -> dict[str, Any]:
    signed = dict(item)
    fields = IMAGE_FIELDS if private_bucket == SERVICE_BUCKET else {"imageUrl"}
    for field in fields:
        raw_value = str(item.get(field) or "")
        if not raw_value:
            continue
        try:
            bucket, key = image_location(
                raw_value,
                private_bucket,
                legacy_bucket,
                private_prefix,
            )
            signed[f"{field}Key"] = key
            signed[field] = signed_get(bucket, key)
        except ApiError:
            signed[field] = ""
    return signed


def ensure_record_branch(item: dict[str, Any] | None, branch_id: str) -> dict[str, Any]:
    if not item:
        raise ApiError(404, "Record not found")
    if item.get("branchId", "markham") != branch_id:
        raise ApiError(404, "Record not found")
    return item


def admin_me(event: dict[str, Any]) -> dict[str, Any]:
    user_claims = claims(event)
    allowed = sorted(allowed_admin_branches(event))
    return {
        "email": user_claims.get("email"),
        "name": user_claims.get("name") or user_claims.get("email"),
        "branches": allowed,
        "isSuperAdmin": set(allowed) == set(BRANCHES),
    }


def app_version_policy(event: dict[str, Any]) -> dict[str, Any]:
    platform = str((event.get("queryStringParameters") or {}).get("platform") or "").lower()
    if platform not in {"ios", "android"}:
        raise ApiError(400, "platform must be ios or android")
    item = VERSION_POLICY_TABLE.get_item(Key={"platform": platform}).get("Item") or {}
    return {
        "enabled": item.get("enabled") is True,
        "minimumVersion": str(item.get("minimumVersion") or ""),
        "latestVersion": str(item.get("latestVersion") or ""),
        "storeUrl": str(item.get("storeUrl") or ""),
        "message": str(item.get("message") or ""),
    }


def admin_clients(event: dict[str, Any]) -> Any:
    branch_id = admin_branch(event)
    query = event.get("queryStringParameters") or {}
    page_size = query.get("pageSize")
    cursor = query.get("cursor")
    if page_size is None:
        if cursor:
            raise ApiError(400, "pageSize is required with cursor")
        memberships = query_all(
            MEMBERSHIP_TABLE,
            KeyConditionExpression=Key("branchId").eq(branch_id),
        )
        next_cursor = None
    else:
        if not str(page_size).isdecimal() or not 1 <= int(page_size) <= 50:
            raise ApiError(400, "pageSize must be between 1 and 50")
        query_args: dict[str, Any] = {
            "IndexName": "branchId-clientCreatedAt-index",
            "KeyConditionExpression": Key("branchId").eq(branch_id),
            "ScanIndexForward": False,
            "Limit": int(page_size),
        }
        if cursor:
            try:
                if not re.fullmatch(r"[A-Za-z0-9_-]{1,2048}", cursor):
                    raise ValueError("Invalid cursor")
                start_key = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
                if (
                    not isinstance(start_key, dict)
                    or set(start_key) != {"branchId", "userId", "clientCreatedAt"}
                    or start_key["branchId"] != branch_id
                    or not all(isinstance(value, str) and value for value in start_key.values())
                ):
                    raise ValueError("Invalid cursor")
            except (ValueError, binascii.Error) as error:
                raise ApiError(400, "Invalid pagination cursor") from error
            query_args["ExclusiveStartKey"] = start_key
        result = MEMBERSHIP_TABLE.query(**query_args)
        memberships = result.get("Items", [])
        last_key = result.get("LastEvaluatedKey")
        next_cursor = (
            base64.urlsafe_b64encode(json.dumps(last_key).encode()).decode().rstrip("=")
            if last_key else None
        )
    clients = []
    for membership in memberships:
        try:
            registered_branch = account_branch(membership["userId"])
        except ApiError as error:
            if error.status_code != 404:
                raise
            # Retained historical profiles can outlive deleted Cognito accounts.
            continue
        if registered_branch != branch_id:
            continue
        user = user_by_id(membership["userId"])
        if user:
            clients.append({**user, "branchId": branch_id, "branchJoinedAt": membership.get("createdAt")})
    if page_size is None:
        return sorted(clients, key=lambda item: item.get("createdAt", ""), reverse=True)
    return {"items": clients, "nextCursor": next_cursor}


def admin_services(event: dict[str, Any]) -> dict[str, Any]:
    """One bounded page of branch orders; never load the entire service table."""
    # Keep old bounded scan cursors valid during the backend-first rollout.
    # The current admin requests sort=newest and never uses this legacy path.
    if (event.get("queryStringParameters") or {}).get("sort") == "newest":
        branch_id, result = ordered_branch_page(event, SERVICE_TABLE)
        fields = ("ID", "branchId", "userID", "vehicleMake", "vehicleModel", "vehicleYear",
                  "serviceType", "createAt", "step5")
        items = []
        for item in result["items"]:
            user = user_by_id(item["userID"]) or {}
            items.append({**{field: item.get(field) for field in fields},
                          "customerName": user.get("name", "Customer"),
                          "customerEmail": user.get("email", "")})
        return {**result, "items": items}
    branch_id = admin_branch(event)
    query = event.get("queryStringParameters") or {}
    try:
        page_size = int(query.get("pageSize", "20"))
        if not 1 <= page_size <= 50:
            raise ValueError("Invalid page size")
    except (ValueError, TypeError) as error:
        raise ApiError(400, "pageSize must be between 1 and 50") from error
    scan_args = {"FilterExpression": Attr("branchId").eq(branch_id), "Limit": page_size}
    cursor = query.get("cursor")
    if cursor:
        try:
            if not re.fullmatch(r"[A-Za-z0-9_-]{1,2048}", cursor):
                raise ValueError("Invalid cursor")
            decoded = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
            if (
                not isinstance(decoded, dict)
                or set(decoded) != {"branchId", "ID"}
                or decoded["branchId"] != branch_id
                or not isinstance(decoded["ID"], str)
                or not decoded["ID"]
            ):
                raise ValueError("Invalid cursor")
        except (ValueError, TypeError, binascii.Error) as error:
            raise ApiError(400, "Invalid pagination cursor") from error
        scan_args["ExclusiveStartKey"] = {"ID": decoded["ID"]}
    result = SERVICE_TABLE.scan(**scan_args)
    fields = ("ID", "branchId", "userID", "vehicleMake", "vehicleModel", "vehicleYear",
              "serviceType", "createAt", "step5")
    items = []
    for item in result.get("Items", []):
        ensure_record_branch(item, branch_id)
        user = user_by_id(item["userID"]) or {}
        items.append({**{field: item.get(field) for field in fields},
                      "customerName": user.get("name", "Customer"),
                      "customerEmail": user.get("email", "")})
    last_key = result.get("LastEvaluatedKey")
    next_cursor = (
        base64.urlsafe_b64encode(json.dumps({**last_key, "branchId": branch_id}).encode())
        .decode().rstrip("=") if last_key else None
    )
    # Scan Limit counts evaluated rows, not matching rows. An empty page may
    # still have a cursor; callers must keep the Load more control available.
    return {"items": items, "nextCursor": next_cursor}


def ordered_branch_page(event: dict[str, Any], table: Any) -> tuple[str, dict[str, Any]]:
    """Query one branch in globally descending order, including across pages."""
    branch_id = admin_branch(event)
    query = event.get("queryStringParameters") or {}
    size = str(query.get("pageSize", "20"))
    if not size.isdecimal() or not 1 <= int(size) <= 50:
        raise ApiError(400, "pageSize must be between 1 and 50")
    args = {
        "IndexName": ORDER_INDEX,
        "KeyConditionExpression": Key("branchId").eq(branch_id),
        "ScanIndexForward": False,
        "Limit": int(size),
    }
    cursor = query.get("cursor")
    if cursor:
        try:
            if not isinstance(cursor, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,2048}", cursor):
                raise ValueError("Invalid cursor")
            decoded = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
            if (not isinstance(decoded, dict)
                    or set(decoded) != {"branchId", "ID", "chronologicalKey"}
                    or decoded["branchId"] != branch_id
                    or not all(isinstance(value, str) and value for value in decoded.values())):
                raise ValueError("Invalid cursor")
        except (ValueError, TypeError, binascii.Error) as error:
            raise ApiError(400, "Invalid pagination cursor. Please refresh.") from error
        args["ExclusiveStartKey"] = decoded
    result = table.query(**args)
    items = [ensure_record_branch(item, branch_id) for item in result.get("Items", [])]
    last_key = result.get("LastEvaluatedKey")
    next_cursor = (base64.urlsafe_b64encode(json.dumps(last_key).encode()).decode().rstrip("=")
                   if last_key else None)
    return branch_id, {"items": items, "nextCursor": next_cursor}


def admin_quotes(event: dict[str, Any]) -> Any:
    if "pageSize" not in (event.get("queryStringParameters") or {}):
        # Compatibility for an already-open pre-pagination admin tab.
        return sorted(list_branch_records(event, "quotes"),
                      key=lambda item: chronological_key(item.get("submittedAt"), item["ID"]),
                      reverse=True)
    _branch_id, page = ordered_branch_page(event, QUOTE_TABLE)
    return {**page, "items": [
        sign_item_images(item, QUOTE_BUCKET, LEGACY_QUOTE_BUCKET, "quotes")
        for item in page["items"]
    ]}


def services_for_user(user_id: str, branch_id: str) -> list[dict[str, Any]]:
    services = query_all(
        SERVICE_TABLE,
        IndexName="userID-index",
        KeyConditionExpression=Key("userID").eq(user_id),
        FilterExpression=Attr("branchId").eq(branch_id),
    )
    return [
        sign_item_images(item, SERVICE_BUCKET, LEGACY_SERVICE_BUCKET, "service")
        for item in services
    ]


def admin_client_services(event: dict[str, Any], user_id: str) -> list[dict[str, Any]]:
    branch_id = admin_branch(event)
    if account_branch(user_id) != branch_id:
        raise ApiError(404, "Client not found in this branch")
    membership = MEMBERSHIP_TABLE.get_item(Key={"branchId": branch_id, "userId": user_id}).get("Item")
    if not membership:
        raise ApiError(404, "Client not found in this branch")
    return services_for_user(user_id, branch_id)


def clean_service_payload(payload: dict[str, Any], existing: dict[str, Any] | None = None) -> dict[str, Any]:
    result = dict(existing or {})
    for field in SERVICE_FIELDS:
        if field in payload:
            result[field] = payload[field]
    for field in IMAGE_FIELDS:
        key_field = f"{field}Key"
        if key_field in payload:
            result[field] = str(payload[key_field] or "")
        elif field in payload and payload[field] and not str(payload[field]).startswith("http"):
            result[field] = str(payload[field])
    return result


def create_service(event: dict[str, Any]) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = admin_branch(event, payload)
    user_id = str(payload.get("userID") or "")
    if not user_id or not user_by_id(user_id):
        raise ApiError(400, "A valid userID is required")
    if account_branch(user_id) != branch_id:
        raise ApiError(403, "Orders must belong to the customer's registered branch")
    timestamp = now_iso()
    item = clean_service_payload(payload)
    item.update(
        {
            "ID": str(uuid.uuid4()),
            "userID": user_id,
            "branchId": branch_id,
            "createAt": timestamp,
            "editAt": timestamp,
        }
    )
    item["chronologicalKey"] = chronological_key(item["createAt"], item["ID"])
    SERVICE_TABLE.put_item(Item=item)
    add_membership(user_id, branch_id, "service")
    return sign_item_images(item, SERVICE_BUCKET, LEGACY_SERVICE_BUCKET, "service")


def update_service(event: dict[str, Any], service_id: str) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = admin_branch(event, payload)
    existing = ensure_record_branch(SERVICE_TABLE.get_item(Key={"ID": service_id}).get("Item"), branch_id)
    updated = clean_service_payload(payload, existing)
    updated["ID"] = service_id
    updated["branchId"] = branch_id
    updated["editAt"] = now_iso()
    updated["chronologicalKey"] = chronological_key(existing.get("createAt"), service_id)
    SERVICE_TABLE.put_item(Item=updated)
    return sign_item_images(updated, SERVICE_BUCKET, LEGACY_SERVICE_BUCKET, "service")


def delete_service(event: dict[str, Any], service_id: str) -> dict[str, Any]:
    branch_id = admin_branch(event)
    existing = ensure_record_branch(SERVICE_TABLE.get_item(Key={"ID": service_id}).get("Item"), branch_id)
    SERVICE_TABLE.delete_item(Key={"ID": service_id})
    return {"deleted": existing["ID"]}


def presign_service_upload(event: dict[str, Any]) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = admin_branch(event, payload)
    content_type = str(payload.get("contentType") or "image/jpeg").lower()
    if not content_type.startswith("image/"):
        raise ApiError(400, "Only image uploads are supported")
    extension = re.sub(r"[^a-z0-9]", "", content_type.split("/", 1)[1])[:8] or "jpg"
    key = f"service/{branch_id}/{uuid.uuid4().hex}.{extension}"
    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": SERVICE_BUCKET, "Key": key, "ContentType": content_type},
        ExpiresIn=300,
    )
    return {"key": key, "uploadUrl": upload_url, "viewUrl": signed_get(SERVICE_BUCKET, key)}


def list_branch_records(event: dict[str, Any], record_type: str) -> list[dict[str, Any]]:
    branch_id = admin_branch(event)
    if record_type == "quotes":
        records = scan_all(QUOTE_TABLE, Attr("branchId").eq(branch_id))
        return [
            sign_item_images(item, QUOTE_BUCKET, LEGACY_QUOTE_BUCKET, "quotes")
            for item in records
        ]
    records = scan_all(NON_URGENT_TABLE, Attr("branchId").eq(branch_id))
    urgent = scan_all(URGENT_TABLE, Attr("branchId").eq(branch_id))
    return [
        *[
            {
                **sign_item_images(
                    item,
                    EMERGENCY_BUCKET,
                    LEGACY_EMERGENCY_BUCKET,
                    "emergency",
                ),
                "urgency": "non-urgent",
            }
            for item in records
        ],
        *[{**item, "urgency": "urgent"} for item in urgent],
    ]


def customer_services(event: dict[str, Any]) -> list[dict[str, Any]]:
    branch_id = customer_branch(event)
    return services_for_user(customer_id(event), branch_id)


def customer_branches(event: dict[str, Any]) -> list[dict[str, str]]:
    return [{"branchId": customer_branch(event)}]


def store_base64_image(value: str, bucket: str, prefix: str) -> str:
    if not value:
        return ""
    encoded = value.split(",", 1)[1] if "," in value else value
    try:
        image = base64.b64decode(encoded, validate=True)
    except (ValueError, TypeError) as error:
        raise ApiError(400, "Invalid image data") from error
    if len(image) > 6 * 1024 * 1024:
        raise ApiError(413, "Image is too large")
    key = f"{prefix}/{uuid.uuid4().hex}.jpg"
    s3.put_object(Bucket=bucket, Key=key, Body=image, ContentType="image/jpeg")
    return key


def create_quote(event: dict[str, Any], authenticated: bool) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = customer_branch(event, payload) if authenticated else valid_branch(payload.get("branchId"))
    user_id = customer_id(event) if authenticated else ""
    item = {
        "ID": str(uuid.uuid4()),
        "branchId": branch_id,
        "submittedAt": now_iso(),
        "name": str(payload.get("name") or ""),
        "email": str(payload.get("email") or ""),
        "phone": str(payload.get("phone") or ""),
        "vehicleMake": str(payload.get("vehicleMake") or ""),
        "vehicleModel": str(payload.get("vehicleModel") or ""),
        "vehicleYear": str(payload.get("vehicleYear") or ""),
        "serviceType": payload.get("serviceType") or "",
        "message": str(payload.get("message") or ""),
        "imageUrl": store_base64_image(str(payload.get("image") or ""), QUOTE_BUCKET, f"quotes/{branch_id}"),
    }
    if user_id:
        item["userId"] = user_id
    item["chronologicalKey"] = chronological_key(item["submittedAt"], item["ID"])
    QUOTE_TABLE.put_item(Item=item)
    if user_id:
        add_membership(user_id, branch_id, "quote")
    return {"id": item["ID"], "branchId": branch_id}


def create_non_urgent(event: dict[str, Any]) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = customer_branch(event, payload)
    user_id = customer_id(event)
    user = user_by_id(user_id) or {}
    item = {
        "ID": str(uuid.uuid4()),
        "branchId": branch_id,
        "userId": user_id,
        "name": user.get("name") or payload.get("name") or "",
        "email": user.get("email") or payload.get("email") or "",
        "phone": user.get("phone_number") or payload.get("phone") or "",
        "serviceType": payload.get("serviceType") or "",
        "details": payload.get("details") or "",
        "timestamp": now_iso(),
        "imageUrl": store_base64_image(
            str(payload.get("image") or ""),
            EMERGENCY_BUCKET,
            f"emergency/{branch_id}",
        ),
    }
    NON_URGENT_TABLE.put_item(Item=item)
    add_membership(user_id, branch_id, "emergency")
    if NON_URGENT_TOPIC_ARN:
        sns.publish(
            TopicArn=NON_URGENT_TOPIC_ARN,
            Subject=f"New {BRANCHES[branch_id]['name']} non-urgent request",
            Message=json.dumps({key: value for key, value in item.items() if key != "imageUrl"}),
        )
    return {"id": item["ID"], "branchId": branch_id}


def create_urgent(event: dict[str, Any]) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = customer_branch(event, payload)
    user_id = customer_id(event)
    user = user_by_id(user_id) or {}
    item = {
        "ID": str(uuid.uuid4()),
        "branchId": branch_id,
        "userId": user_id,
        "userName": user.get("name") or "",
        "userEmail": user.get("email") or "",
        "userPhone": user.get("phone_number") or "",
        "serviceType": payload.get("serviceType") or "",
        "servicePhoneNumber": BRANCHES[branch_id]["phone"],
        "timestamp": now_iso(),
    }
    URGENT_TABLE.put_item(Item=item)
    add_membership(user_id, branch_id, "emergency")
    return {"id": item["ID"], "branchId": branch_id}


def send_invoice(event: dict[str, Any]) -> dict[str, Any]:
    payload = parse_body(event)
    branch_id = admin_branch(event, payload)
    service_id = str(payload.get("serviceId") or "")
    ensure_record_branch(SERVICE_TABLE.get_item(Key={"ID": service_id}).get("Item"), branch_id)
    if not INVOICE_EMAIL_FUNCTION:
        raise ApiError(503, "Invoice email service is not configured")
    forwarded = {key: payload.get(key) for key in ("to", "subject", "bodyText", "filename", "pdfBase64", "cc")}
    result = lambda_client.invoke(
        FunctionName=INVOICE_EMAIL_FUNCTION,
        InvocationType="RequestResponse",
        Payload=json.dumps({"body": json.dumps(forwarded), "requestContext": {"http": {"method": "POST"}}}),
    )
    raw_result = json.loads(result["Payload"].read())
    body = json.loads(raw_result.get("body", "{}"))
    if int(raw_result.get("statusCode", 500)) >= 400:
        raise ApiError(502, body.get("message", "Invoice email failed"))
    return body


def route(event: dict[str, Any]) -> Any:
    method, path = request_details(event)
    if method == "OPTIONS" and path.startswith(("/admin/", "/customer/")):
        return {}
    if method == "GET" and path == "/public/branches":
        return list(BRANCHES.values())
    if method == "GET" and path == "/public/app-version":
        return app_version_policy(event)
    if method == "POST" and path == "/public/quotes":
        return create_quote(event, False)
    if method == "GET" and path == "/customer/services":
        return customer_services(event)
    if method == "GET" and path == "/customer/account":
        return customer_account(event)
    if method == "GET" and path == "/customer/branches":
        return customer_branches(event)
    if method == "POST" and path == "/customer/quotes":
        return create_quote(event, True)
    if method == "POST" and path == "/customer/emergencies/non-urgent":
        return create_non_urgent(event)
    if method == "POST" and path == "/customer/emergencies/urgent":
        return create_urgent(event)
    if method == "GET" and path == "/admin/me":
        return admin_me(event)
    if method == "GET" and path == "/admin/clients":
        return admin_clients(event)
    client_match = re.fullmatch(r"/admin/clients/([^/]+)/services", path)
    if method == "GET" and client_match:
        return admin_client_services(event, client_match.group(1))
    if method == "POST" and path == "/admin/services":
        return create_service(event)
    if method == "GET" and path == "/admin/services":
        return admin_services(event)
    service_match = re.fullmatch(r"/admin/services/([^/]+)", path)
    if method == "PATCH" and service_match:
        return update_service(event, service_match.group(1))
    if method == "DELETE" and service_match:
        return delete_service(event, service_match.group(1))
    if method == "POST" and path == "/admin/uploads/presign":
        return presign_service_upload(event)
    if method == "GET" and path == "/admin/quotes":
        return admin_quotes(event)
    if method == "GET" and path == "/admin/emergencies":
        return list_branch_records(event, "emergencies")
    if method == "POST" and path == "/admin/invoices/send":
        return send_invoice(event)
    raise ApiError(404, "Route not found")


def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    try:
        result = route(event)
        return response(200, {"data": result})
    except ApiError as error:
        return response(error.status_code, {"message": error.message})
    except Exception as error:
        print(json.dumps({"error": type(error).__name__, "message": str(error)}))
        return response(500, {"message": "Internal server error"})
