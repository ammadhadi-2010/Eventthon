"""Admin project list formatting helpers."""
from __future__ import annotations

from collections import OrderedDict
from datetime import datetime
from typing import Any, Dict, List

from backend_routes.projects.serializers import status_to_label


def normalize_admin_project_status(doc: dict) -> str:
    raw = str(doc.get("status") or "in-progress").strip().lower()
    if raw in ("in-progress", "in-review", "planning"):
        return "In Progress"
    if raw == "completed":
        return "Completed"
    if raw == "on-hold":
        return "On Hold"
    if raw in ("cancelled", "archived"):
        return "Cancelled"
    return "In Progress"


def status_to_db(status: str) -> str:
    key = str(status or "").strip().lower()
    if key in ("in progress", "active"):
        return "in-progress"
    if key == "completed":
        return "completed"
    if key in ("on hold", "paused"):
        return "on-hold"
    if key in ("cancelled", "archived"):
        return "cancelled"
    return "in-progress"


def _format_date(value: Any) -> str:
    if not value:
        return "—"
    if isinstance(value, datetime):
        return value.strftime("%b %d, %Y")
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).strftime("%b %d, %Y")
        except (TypeError, ValueError):
            return value[:16] if len(value) > 16 else value
    return "—"


def _month_bucket_keys() -> List[str]:
    now = datetime.utcnow()
    keys: List[str] = []
    year, month = now.year, now.month
    for _ in range(7):
        keys.append(datetime(year, month, 1).strftime("%b"))
        month -= 1
        if month < 1:
            month = 12
            year -= 1
    return list(reversed(keys))


def project_stats_payload(rows: List[dict]) -> Dict[str, int]:
    total = len(rows)
    active = sum(1 for row in rows if normalize_admin_project_status(row) == "In Progress")
    completed = sum(1 for row in rows if normalize_admin_project_status(row) == "Completed")
    on_hold = sum(1 for row in rows if normalize_admin_project_status(row) == "On Hold")
    return {
        "totalProjects": total,
        "activeProjects": active,
        "completedProjects": completed,
        "onHoldProjects": on_hold,
    }


def project_timeline_payload(rows: List[dict]) -> List[Dict[str, Any]]:
    keys = _month_bucket_keys()
    buckets: "OrderedDict[str, Dict[str, Any]]" = OrderedDict(
        (k, {"month": k, "created": 0, "completed": 0, "inProgress": 0}) for k in keys
    )
    for doc in rows:
        created = doc.get("created_at")
        if not isinstance(created, datetime):
            continue
        label = created.strftime("%b")
        if label not in buckets:
            continue
        buckets[label]["created"] += 1
        status = str(doc.get("status") or "").lower()
        if status == "completed":
            buckets[label]["completed"] += 1
        elif status in ("in-progress", "in-review", "planning"):
            buckets[label]["inProgress"] += 1
    return list(buckets.values())


def project_status_slices(rows: List[dict]) -> List[Dict[str, Any]]:
    total = len(rows) or 1
    completed = sum(1 for row in rows if normalize_admin_project_status(row) == "Completed")
    in_progress = sum(1 for row in rows if normalize_admin_project_status(row) == "In Progress")
    on_hold = sum(1 for row in rows if normalize_admin_project_status(row) == "On Hold")
    cancelled = sum(1 for row in rows if normalize_admin_project_status(row) == "Cancelled")

    def share(count: int) -> str:
        return f"{(count / total * 100):.1f}%"

    return [
        {"name": "Completed", "value": completed, "color": "#14b8a6", "share": share(completed)},
        {"name": "In Progress", "value": in_progress, "color": "#8b5cf6", "share": share(in_progress)},
        {"name": "On Hold", "value": on_hold, "color": "#ec4899", "share": share(on_hold)},
        {"name": "Cancelled", "value": cancelled, "color": "#f97316", "share": share(cancelled)},
    ]


def project_admin_row(doc: dict, team: List[dict]) -> Dict[str, Any]:
    project_id = str(doc.get("_id") or doc.get("id") or "")
    title = doc.get("title") or doc.get("name") or "Untitled Project"
    imageurl = (doc.get("imageurl") or doc.get("cover_preview") or "").strip()
    return {
        "_id": project_id,
        "id": project_id,
        "name": title,
        "title": title,
        "category": doc.get("category") or "General",
        "description": doc.get("short_description") or doc.get("description") or "",
        "status": doc.get("status") or "in-progress",
        "admin_status": normalize_admin_project_status(doc),
        "status_label": doc.get("status_label") or status_to_label(doc.get("status") or ""),
        "progress": int(doc.get("progress") or 0),
        "budget": doc.get("budget") or "",
        "due_date": doc.get("deadline") or doc.get("due_date") or "—",
        "posted_on": _format_date(doc.get("created_at")),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        "team": team,
        "team_extra": int(doc.get("team_extra") or 0),
        "imageurl": imageurl,
        "owner_user_id": doc.get("owner_user_id") or "",
        "agency": doc.get("agency") or "Studio",
        "tasks_count": int(doc.get("tasks_count") or 0),
        "visibility": doc.get("visibility") or "private",
    }
