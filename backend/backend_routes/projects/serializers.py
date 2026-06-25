from datetime import datetime
from typing import Optional

from bson import ObjectId

STATUS_LABELS = {
    "in-progress": "In Progress",
    "in-review": "In Review",
    "completed": "Completed",
    "on-hold": "On Hold",
    "planning": "Planning",
}


def status_to_label(status: str) -> str:
    return STATUS_LABELS.get((status or "").strip(), "In Progress")


def map_wizard_status(raw: str) -> str:
    key = (raw or "").strip().lower()
    return {
        "planning": "planning",
        "active": "in-progress",
        "paused": "on-hold",
        "completed": "completed",
    }.get(key, "in-progress")


def _iso(dt) -> Optional[str]:
    if isinstance(dt, datetime):
        return dt.isoformat()
    return None


def serialize_project(doc: dict) -> dict:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    cover = (out.get("imageurl") or out.get("cover_preview") or "").strip()
    if cover:
        out["imageurl"] = cover
    out["updated"] = out.get("updated_label") or out.get("updated") or ""
    out["created_at"] = _iso(out.get("created_at"))
    out["updated_at"] = _iso(out.get("updated_at"))
    return out


def explore_card_from_row(row: dict) -> dict:
    """Public feed card with imageurl for marketplace grid."""
    imageurl = (row.get("imageurl") or row.get("cover_preview") or "").strip()
    return {
        "id": row["id"],
        "title": row.get("title"),
        "author": row.get("agency", "Studio"),
        "badge": (row.get("badges") or ["OPEN"])[0],
        "badgeTone": row.get("icon_tone") or "web",
        "rating": 4.5 + (row.get("progress", 0) % 5) * 0.1,
        "members": len(row.get("team", [])) + row.get("team_extra", 0),
        "comments": row.get("tasks_count", 0) // 2,
        "funding": row.get("budget", ""),
        "tone": row.get("icon_tone", "web"),
        "imageurl": imageurl,
        "imageUrl": imageurl,
        "category": row.get("category", ""),
        "timeline": row.get("deadline", ""),
    }


def serialize_saved(doc: dict) -> dict:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    out["created_at"] = _iso(out.get("created_at"))
    return out


def project_oid(raw: str) -> ObjectId:
    if not ObjectId.is_valid(raw):
        raise ValueError("invalid project id")
    return ObjectId(raw)
