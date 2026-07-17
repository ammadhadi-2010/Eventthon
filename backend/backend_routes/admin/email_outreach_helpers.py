"""Email Outreach — helpers for lead formatting and queries."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse


def lead_favicon_url(website: str) -> str:
    raw = str(website or "").strip()
    if not raw:
        return ""
    if "://" not in raw:
        raw = f"https://{raw}"
    host = urlparse(raw).netloc.replace("www.", "")
    if not host:
        return ""
    return f"https://www.google.com/s2/favicons?domain={host}&sz=64"


def normalize_website(website: str) -> str:
    raw = str(website or "").strip()
    if not raw:
        return ""
    return raw.replace("https://", "").replace("http://", "").strip("/")


def ui_status(raw: str) -> str:
    key = str(raw or "new").lower()
    mapping = {
        "new": "not_contacted",
        "not_contacted": "not_contacted",
        "emailed": "emailed",
        "opened": "opened",
        "replied": "replied",
        "interested": "interested",
    }
    return mapping.get(key, "not_contacted")


def db_status(raw: str) -> str:
    key = str(raw or "not_contacted").lower()
    if key in ("new", "not_contacted"):
        return "not_contacted"
    if key in ("emailed", "opened", "replied", "interested"):
        return key
    return "not_contacted"


def tab_filter(tab: str) -> dict[str, Any]:
    key = str(tab or "all").lower()
    if key == "not_contacted":
        return {"status": {"$in": ["new", "not_contacted"]}}
    if key == "emailed":
        return {"status": {"$in": ["emailed", "opened"]}}
    if key == "replied":
        return {"status": "replied"}
    if key == "interested":
        return {"status": "interested"}
    return {}


def format_last_contact(value: Any) -> str:
    if not value:
        return "—"
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return value
    if not isinstance(value, datetime):
        return "—"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    seconds = max(int((now - value).total_seconds()), 0)
    if seconds < 3600:
        mins = max(seconds // 60, 1)
        return f"{mins} min ago" if mins == 1 else f"{mins} mins ago"
    if seconds < 86400:
        hours = max(seconds // 3600, 1)
        return f"{hours} hour ago" if hours == 1 else f"{hours} hours ago"
    days = max(seconds // 86400, 1)
    return f"{day_label(days)} ago"


def day_label(days: int) -> str:
    return f"{days} day" if days == 1 else f"{days} days"


def serialize_lead(doc: dict[str, Any]) -> dict[str, Any]:
    website = normalize_website(doc.get("website") or "")
    imageurl = str(doc.get("imageurl") or "").strip() or lead_favicon_url(website)
    return {
        "id": str(doc.get("id") or doc.get("_id") or ""),
        "company": doc.get("company") or "Partner",
        "website": website,
        "contactEmail": doc.get("email") or doc.get("contact_email") or "",
        "contactName": doc.get("contact_name") or "",
        "status": ui_status(doc.get("status")),
        "lastContact": format_last_contact(doc.get("last_contacted_at")),
        "imageurl": imageurl,
        "category": doc.get("category") or "",
        "country": doc.get("country") or "",
        "city": doc.get("city") or "",
    }


def tab_counts_pipeline() -> dict[str, int]:
    return {
        "all": 0,
        "not_contacted": 0,
        "emailed": 0,
        "replied": 0,
        "interested": 0,
    }
