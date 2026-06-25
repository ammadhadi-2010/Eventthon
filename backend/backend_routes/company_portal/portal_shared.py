"""Company portal — status buckets and shared helpers."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from backend_routes.jobs.hub_shared import normalize_status

PORTAL_BUCKETS = ("pending", "reviewing", "shortlisted", "rejected")
BUCKET_LABELS = {
    "pending": "Pending",
    "reviewing": "Reviewing",
    "shortlisted": "Shortlisted",
    "rejected": "Rejected",
}


def portal_bucket(raw: str) -> str:
    key = normalize_status(raw)
    if key == "applied":
        return "pending"
    if key in ("in-review", "interview"):
        return "reviewing"
    if key in ("shortlisted", "offered"):
        return "shortlisted"
    if key in ("reject", "rejected"):
        return "rejected"
    return "pending"


def relative_time(ts: Any) -> str:
    if not ts:
        return "Recently"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return "Recently"
    if not isinstance(ts, datetime):
        return "Recently"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(delta.total_seconds())
    if sec < 3600:
        return f"{max(1, sec // 60)} min ago"
    if sec < 86400:
        return f"{max(1, sec // 3600)} hours ago"
    return f"{max(1, sec // 86400)} days ago"


def format_joined_year(ts: Any) -> str:
    if not ts:
        return "—"
    if isinstance(ts, str) and len(ts) >= 4:
        return ts[:4]
    if isinstance(ts, datetime):
        return str(ts.year)
    return "—"
