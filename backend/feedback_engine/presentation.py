"""Admin-facing presentation helpers for feedback bug reports."""
from __future__ import annotations

from datetime import datetime

ALLOWED_STATUSES = frozenset({"New", "In Progress", "Resolved", "Closed"})

STATUS_ALIASES = {
    "open": "New",
    "new": "New",
    "in progress": "In Progress",
    "in_progress": "In Progress",
    "resolved": "Resolved",
    "closed": "Closed",
}

TYPE_LABELS = {
    "bug": "Bug",
    "feature_request": "Feature request",
    "abuse": "Abuse",
    "payment": "Payment",
    "other": "Other",
    "design": "Design Issue",
    "feature": "New Feature Idea",
}

PRIORITY_BY_TYPE = {
    "bug": "High",
    "abuse": "High",
    "payment": "High",
    "feature_request": "Medium",
    "feature": "Medium",
    "design": "Medium",
    "other": "Low",
}


def normalize_status(value: str) -> str:
    key = str(value or "New").strip().lower()
    mapped = STATUS_ALIASES.get(key)
    if mapped:
        return mapped
    cleaned = str(value or "New").strip()
    return cleaned if cleaned in ALLOWED_STATUSES else "New"


def derive_priority(report_type: str, stored: str | None = None) -> str:
    if stored in {"High", "Medium", "Low"}:
        return stored
    return PRIORITY_BY_TYPE.get(str(report_type or "bug").lower(), "Medium")


def build_report_code(row: dict) -> str:
    created = row.get("created_at")
    year = datetime.utcnow().year
    if created:
        try:
            year = datetime.fromisoformat(str(created).replace("Z", "+00:00")).year
        except ValueError:
            pass
    tail = str(row.get("id") or "000")[-3:].upper()
    return f"#BR-{year}-{tail}"


def build_title(row: dict) -> str:
    label = TYPE_LABELS.get(str(row.get("type") or "bug").lower(), "Bug")
    detail = str(row.get("description") or "").strip()
    if not detail:
        return f"{label} Issue"
    short = detail if len(detail) <= 72 else f"{detail[:72]}..."
    return f"{label}: {short}"


def build_summary(rows: list[dict]) -> dict:
    counts = {name: 0 for name in ALLOWED_STATUSES}
    for row in rows:
        status = normalize_status(row.get("status"))
        counts[status] = counts.get(status, 0) + 1
    return {
        "total": len(rows),
        "new": counts["New"],
        "in_progress": counts["In Progress"],
        "resolved": counts["Resolved"],
        "closed": counts["Closed"],
    }


def present_feedback_row(row: dict) -> dict:
    payload = dict(row)
    payload["status"] = normalize_status(payload.get("status"))
    payload["priority"] = derive_priority(str(payload.get("type") or ""), payload.get("priority"))
    payload["report_code"] = build_report_code(payload)
    payload["title"] = build_title(payload)
    payload["page_location"] = str(payload.get("page_url") or "")
    return payload
