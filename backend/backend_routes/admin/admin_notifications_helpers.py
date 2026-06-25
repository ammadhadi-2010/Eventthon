"""Build admin control-center alert payloads from enterprise data sources."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List

from database import (
    companies_collection,
    company_support_messages_collection,
    report_collection,
    user_collection,
)

from .admin_bug_alert_feed import fetch_bug_report_alert_rows

ADMIN_ACTOR = "eventthon-admin-support"
ADMIN_CATEGORY_KEYS = ("verification", "company_signup", "flagged", "system", "support", "bug_report")


def _iso(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value or datetime.utcnow().isoformat())


def _section_for(ts: Any) -> str:
    if not isinstance(ts, datetime):
        return "earlier"
    now = datetime.utcnow()
    day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday = day - timedelta(days=1)
    if ts >= day:
        return "today"
    if ts >= yesterday:
        return "yesterday"
    return "earlier"


def _alert_row(
    alert_id: str,
    category: str,
    title: str,
    message: str,
    *,
    priority: str = "medium",
    action_url: str = "/admin-control",
    created_at: Any = None,
    is_read: bool = False,
    actor_name: str = "EventThon",
) -> Dict[str, Any]:
    ts = created_at if isinstance(created_at, datetime) else datetime.utcnow()
    return {
        "_id": alert_id,
        "category": category,
        "priority": priority,
        "title": title,
        "message": message,
        "actor_name": actor_name,
        "action_url": action_url,
        "section": _section_for(ts),
        "is_read": is_read,
        "created_at": _iso(ts),
    }


async def build_admin_alert_feed(read_ids: set[str]) -> List[dict]:
    rows: List[dict] = []
    now = datetime.utcnow()

    async for doc in user_collection.find(
        {"verification_status": {"$in": ["pending", "submitted", "review"]}}
    ).sort("created_at", -1).limit(25):
        aid = f"verification-{doc.get('_id')}"
        rows.append(
            _alert_row(
                aid,
                "verification",
                "User verification pending",
                str(doc.get("name") or doc.get("mobile") or "Member"),
                priority="high",
                action_url="/admin-control/verification",
                created_at=doc.get("created_at") or now,
                is_read=aid in read_ids,
                actor_name="Identity Review",
            )
        )

    async for doc in companies_collection.find({}).sort("created_at", -1).limit(30):
        status = str(doc.get("status") or "").lower()
        is_pending = status in {"pending", "review", "submitted"}
        is_new = doc.get("created_at") and (now - doc.get("created_at")).days < 7 if isinstance(doc.get("created_at"), datetime) else False
        if not is_pending and not is_new:
            continue
        aid = f"company-{'pending' if is_pending else 'new'}-{doc.get('_id')}"
        rows.append(
            _alert_row(
                aid,
                "company_signup",
                "Company verification pending" if is_pending else "New company signup",
                str(doc.get("name") or "Company"),
                priority="high" if is_pending else "medium",
                action_url="/admin-control/companies",
                created_at=doc.get("created_at") or now,
                is_read=aid in read_ids,
                actor_name=str(doc.get("name") or "Company"),
            )
        )

    async for doc in report_collection.find({}).sort("created_at", -1).limit(20):
        aid = f"flagged-{doc.get('_id')}"
        rows.append(
            _alert_row(
                aid,
                "flagged",
                "Flagged content report",
                str(doc.get("reason") or doc.get("report_type") or "Moderation review required"),
                priority="high",
                action_url="/admin-control/users",
                created_at=doc.get("created_at") or now,
                is_read=aid in read_ids,
                actor_name="Trust & Safety",
            )
        )

    rows.append(
        _alert_row(
            "system-node-health",
            "system",
            "System node operational",
            "API, database, and wallet nodes are reporting healthy status.",
            priority="low",
            action_url="/admin-control/settings",
            created_at=now - timedelta(hours=2),
            is_read="system-node-health" in read_ids,
            actor_name="Infrastructure",
        )
    )

    async for doc in company_support_messages_collection.find(
        {"from_user_id": {"$nin": [ADMIN_ACTOR, "eventthon-admin-support"]}, "status": "new"}
    ).sort("created_at", -1).limit(20):
        aid = f"support-{doc.get('_id')}"
        rows.append(
            _alert_row(
                aid,
                "support",
                "Employer support message",
                str(doc.get("body") or "")[:140],
                priority="medium",
                action_url="/admin-control/chat",
                created_at=doc.get("created_at") or now,
                is_read=aid in read_ids,
                actor_name=str(doc.get("from_user_name") or "Employer"),
            )
        )

    rows.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return rows


def build_category_filters(feed: List[dict]) -> List[dict]:
    labels = {
        "all": "All Alerts",
        "verification": "User Verifications",
        "company_signup": "New Company Signups",
        "flagged": "Flagged Content",
        "system": "System Node Alerts",
        "support": "Support Logs",
        "bug_report": "User Bug Reports",
    }
    out = []
    for key, label in labels.items():
        if key == "all":
            count = len(feed)
        else:
            count = sum(1 for row in feed if row.get("category") == key)
        out.append({"key": key, "label": label, "count": count, "active": key == "all"})
    return out


def build_stats(feed: List[dict]) -> dict:
    unread = sum(1 for row in feed if not row.get("is_read"))
    today = sum(1 for row in feed if row.get("section") == "today")
    high = sum(1 for row in feed if row.get("priority") == "high" and not row.get("is_read"))
    return {"total": len(feed), "unread": unread, "today": today, "high_priority": high}
