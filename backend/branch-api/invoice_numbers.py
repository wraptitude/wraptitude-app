"""Durable, shared invoice identities. Counter and assignment commit together."""
import random
import time
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from boto3.dynamodb.types import TypeDeserializer, TypeSerializer


COUNTER_KEY = "COUNTER#global"
INVOICE_PREFIX = "INVOICE#"
_serializer = TypeSerializer()
_deserializer = TypeDeserializer()


class InvoiceNumberBusy(Exception):
    pass


class InvoiceBranchMismatch(Exception):
    pass


def _encode(item):
    return {key: _serializer.serialize(value) for key, value in item.items()}


def _read(client, table_name, key):
    result = client.get_item(
        TableName=table_name, Key={"id": {"S": key}}, ConsistentRead=True,
    )
    return {key: _deserializer.deserialize(value) for key, value in result.get("Item", {}).items()}


def allocate_invoice_number(client, table_name, service_id, branch_id):
    """Return the same identity on every retry/reprint, starting globally at 1."""
    invoice_key = INVOICE_PREFIX + service_id
    for attempt in range(12):
        existing = _read(client, table_name, invoice_key)
        if existing:
            if existing["branchId"] != branch_id:
                raise InvoiceBranchMismatch()
            return {key: existing[key] for key in ("invoiceNumber", "invoiceDate")}

        counter = _read(client, table_name, COUNTER_KEY)
        previous = int(counter["lastNumber"]) if counter else 0
        if previous < 0:
            raise ValueError("Invalid invoice counter")
        current = previous + 1
        now = datetime.now(ZoneInfo("America/Toronto"))
        identity = {"invoiceNumber": f"INV-{current:06d}", "invoiceDate": now.date().isoformat()}
        counter_write = {
            "TableName": table_name,
            "Item": _encode({"id": COUNTER_KEY, "lastNumber": current}),
            "ConditionExpression": "lastNumber = :previous" if counter else "attribute_not_exists(id)",
        }
        if counter:
            counter_write["ExpressionAttributeValues"] = _encode({":previous": previous})
        try:
            client.transact_write_items(
                ClientRequestToken=str(uuid.uuid4()),
                TransactItems=[
                    {"Put": counter_write},
                    {"Put": {
                        "TableName": table_name,
                        "Item": _encode({
                            "id": invoice_key, "serviceId": service_id, "branchId": branch_id,
                            "createdAt": now.isoformat(), **identity,
                        }),
                        "ConditionExpression": "attribute_not_exists(id)",
                    }},
                ],
            )
            return identity
        except client.exceptions.TransactionCanceledException as error:
            codes = [reason.get("Code", "None") for reason in error.response.get("CancellationReasons", [])]
            if not codes or not any(code in ("ConditionalCheckFailed", "TransactionConflict") for code in codes):
                raise
            if any(code not in ("None", "ConditionalCheckFailed", "TransactionConflict") for code in codes):
                raise
            # A concurrent request won. Re-read its assignment or the new counter.
            time.sleep(random.uniform(0.01, min(0.5, 0.025 * 2 ** attempt)))

    # The final competing transaction may have allocated this same order.
    existing = _read(client, table_name, invoice_key)
    if existing and existing["branchId"] == branch_id:
        return {key: existing[key] for key in ("invoiceNumber", "invoiceDate")}
    raise InvoiceNumberBusy("Invoice numbering is busy. Please try again.")
