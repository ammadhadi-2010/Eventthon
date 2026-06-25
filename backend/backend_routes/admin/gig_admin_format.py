"""Admin gig list formatting helpers."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List


def normalize_admin_gig_status(doc: dict) -> str:
    raw = str(doc.get("status") or "draft").strip().lower()
    if raw in ("published", "active", "live"):
        return "ACTIVE"
    if raw == "completed":
        return "COMPLETED"
    if raw in ("cancelled", "canceled", "suspended"):
        return "CANCELLED"
    return "PENDING"


def status_to_db(status: str) -> str:
    key = str(status or "").strip().upper()
    if key == "ACTIVE":
        return "published"
    if key == "COMPLETED":
        return "completed"
    if key == "SUSPENDED":
        return "suspended"
    if key == "CANCELLED":
        return "cancelled"
    return "draft"


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


def format_budget(doc: dict) -> str:
    price = float(doc.get("starting_price") or doc.get("price") or 0)
    if price <= 0:
        return "—"
    high = float(doc.get("max_price") or max(price * 2, price))
    return f"${price:.0f} - ${high:.0f}"


def gig_stats_payload(rows: List[dict]) -> Dict[str, int]:
    total = len(rows)
    active = sum(1 for row in rows if normalize_admin_gig_status(row) == "ACTIVE")
    pending = sum(1 for row in rows if normalize_admin_gig_status(row) == "PENDING")
    completed = sum(1 for row in rows if normalize_admin_gig_status(row) == "COMPLETED")
    return {
        "totalGigs": total,
        "activeGigs": active,
        "pendingApproval": pending,
        "completedGigs": completed,
    }


def gig_admin_row(doc: dict, seller: dict) -> Dict[str, Any]:
    gig_id = str(doc.get("_id") or "")
    title = doc.get("title") or "Untitled Gig"
    imageurl = doc.get("imageurl") or doc.get("cover_imageurl") or ""
    return {
        "_id": gig_id,
        "id": gig_id,
        "title": title,
        "category": doc.get("category") or "General",
        "service_type": doc.get("service_type") or "General",
        "description": doc.get("description") or "",
        "starting_price": doc.get("starting_price") or 0,
        "budget_label": format_budget(doc),
        "status": doc.get("status") or "draft",
        "admin_status": normalize_admin_gig_status(doc),
        "created_at": doc.get("created_at"),
        "posted_on": _format_date(doc.get("created_at")),
        "delivery_time": doc.get("delivery_time") or "7 Days",
        "seller_user_id": doc.get("seller_user_id") or "",
        "seller": seller,
        "tags": doc.get("tags") or [],
        "imageurl": imageurl,
    }
