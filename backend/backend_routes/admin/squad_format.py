"""Admin squad list/detail formatting."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional


def normalize_admin_squad_status(doc: dict) -> str:
    raw = str(doc.get("status") or "active").strip().lower()
    if raw in ("archived", "disbanded"):
        return "DISBANDED"
    if raw == "suspended":
        return "SUSPENDED"
    if raw in ("draft", "pending"):
        return "PENDING"
    return "ACTIVE"


def status_to_db(status: str) -> str:
    key = str(status or "").strip().upper()
    if key == "DISBANDED":
        return "archived"
    if key == "SUSPENDED":
        return "suspended"
    if key == "PENDING":
        return "draft"
    return "active"


def _format_created_on(value: Any) -> str:
    if not value:
        return "—"
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return value[:16] if len(value) > 16 else value
    else:
        return "—"
    return dt.strftime("%b %d, %Y")


def _activity_time(value: Any) -> str:
    if not value:
        return "—"
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return value[:16] if len(value) > 16 else str(value)
    else:
        return "—"
    delta = datetime.utcnow() - dt.replace(tzinfo=None)
    sec = int(delta.total_seconds())
    if sec < 3600:
        return f"{max(1, sec // 60)} min ago"
    if sec < 86400:
        return f"{sec // 3600} hours ago"
    return f"{sec // 86400} days ago"


def squad_admin_row(doc: dict, leader_name: str = "Squad Leader") -> Dict[str, Any]:
    members = doc.get("members") or []
    projects = doc.get("projects") or []
    squad_id = str(doc.get("_id") or "")
    name = doc.get("squad_name") or "Squad"
    return {
        "_id": squad_id,
        "id": squad_id,
        "squad_name": name,
        "niche": doc.get("niche") or "General",
        "description": doc.get("description") or "",
        "members_count": len(members),
        "online": len([m for m in members if m.get("online")]),
        "projects_count": len(projects),
        "imageurl": doc.get("imageurl") or doc.get("banner") or "",
        "leader_id": doc.get("leader_id"),
        "leader_name": leader_name,
        "members": members,
        "projects": projects,
        "settings": doc.get("settings") or {},
        "created_at": doc.get("created_at"),
        "status": doc.get("status") or "active",
        "admin_status": normalize_admin_squad_status(doc),
        "activity_feed": doc.get("activity_feed") or [],
    }


def squad_stats_payload(rows: List[dict]) -> Dict[str, Any]:
    total = len(rows)
    active = sum(1 for row in rows if normalize_admin_squad_status(row) == "ACTIVE")
    members = sum(len(row.get("members") or []) for row in rows)
    pending = sum(1 for row in rows if normalize_admin_squad_status(row) == "PENDING")
    return {
        "totalSquads": total,
        "activeSquads": active,
        "totalMembers": members,
        "pendingRequests": pending,
    }


def format_activity_feed(feed: Optional[List[dict]]) -> List[dict]:
    items = []
    for index, row in enumerate(feed or []):
        message = row.get("message") or row.get("text") or row.get("label") or "Squad activity"
        items.append(
            {
                "id": row.get("id") or f"act-{index}",
                "message": message,
                "time": _activity_time(row.get("created_at") or row.get("time")),
            }
        )
    return items
