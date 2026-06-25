"""Map live feedback bug reports into admin alert center feed rows."""
from __future__ import annotations

from datetime import datetime, timedelta

from database import feedbacks_collection
from feedback_engine.presentation import build_title, normalize_status

BUG_REPORTS_PANEL_URL = "/admin-control/bug-reports"
OPEN_STATUSES = {"new", "open", "in progress", "in_progress"}


def _is_open_report(status: str) -> bool:
    normalized = normalize_status(status).lower()
    return normalized in OPEN_STATUSES or normalized not in {"resolved", "closed"}


async def fetch_bug_report_alert_rows(read_ids: set[str], *, limit: int = 20) -> list[dict]:
    rows: list[dict] = []
    now = datetime.utcnow()
    cursor = feedbacks_collection.find({}).sort("created_at", -1).limit(limit)

    async for doc in cursor:
        status = str(doc.get("status") or "New")
        if not _is_open_report(status):
            continue

        report_id = str(doc.get("_id") or "")
        alert_id = f"bug-report-{report_id}"
        issue_title = build_title({"type": doc.get("type"), "description": doc.get("description")})
        created = doc.get("created_at") if isinstance(doc.get("created_at"), datetime) else now

        rows.append(
            {
                "_id": alert_id,
                "category": "bug_report",
                "alert_kind": "bug_report",
                "priority": "high",
                "title": f"New Bug Report Pending Verification: {issue_title}",
                "message": str(doc.get("description") or "User submitted a new bug report.")[:160],
                "issue_title": issue_title,
                "actor_name": str(doc.get("user_email") or doc.get("user_mobile") or "Reporter"),
                "action_url": BUG_REPORTS_PANEL_URL,
                "action_label": "Open Bug Reports",
                "section": _section_for(created),
                "is_read": alert_id in read_ids,
                "created_at": created.isoformat(),
            }
        )

    return rows


def _section_for(ts: datetime) -> str:
    now = datetime.utcnow()
    day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday = day - timedelta(days=1)
    if ts >= day:
        return "today"
    if ts >= yesterday:
        return "yesterday"
    return "earlier"
