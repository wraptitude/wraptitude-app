"""Canonical UTC keys: chronological across timezones, stable for equal dates."""
from datetime import datetime, timezone

OLDEST_DATE = "0001-01-01T00:00:00.000000+00:00"
ORDER_INDEX = "branchId-chronologicalKey-index"


def canonical_date(value, fallback=OLDEST_DATE):
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat(timespec="microseconds")
    except (ValueError, OverflowError):
        return fallback


def chronological_key(value, record_id):
    return f"{canonical_date(value)}#{record_id}"
