"""Top UPDATES carousel API — isolated from home timeline (/api/posts/all)."""
from datetime import datetime

from fastapi import APIRouter, Depends

from backend_routes.alerts.alerts_helpers import verify_alerts_owner_from_headers
from backend_routes.dashboard.carousel_highlight_feed import fetch_carousel_highlights

router = APIRouter(tags=["Dashboard Updates"])


def _normalize_highlight(row: dict) -> dict:
    created = row.get("created_at")
    if isinstance(created, datetime):
        created = created.isoformat()
    imageurl = str(row.get("imageurl") or "").strip()
    return {
        "id": str(row.get("id") or ""),
        "update_type": str(row.get("update_type") or "article"),
        "title": str(row.get("title") or "Platform update"),
        "message": str(row.get("message") or "").strip(),
        "imageurl": imageurl,
        "author_name": str(row.get("author_name") or "EventThon Member"),
        "author_title": str(row.get("author_title") or "Member"),
        "author_imageurl": imageurl,
        "created_at": created,
        "action_url": str(row.get("action_url") or "").strip(),
        "likes_count": int(row.get("likes_count") or 0),
        "comments_count": int(row.get("comments_count") or 0),
        "progress_percent": row.get("progress_percent"),
        "achievement_metric": str(row.get("achievement_metric") or ""),
    }


@router.get("")
async def list_dashboard_updates(user: dict = Depends(verify_alerts_owner_from_headers)):
    """Carousel reads AI-flagged highlights only; home feed uses /api/posts/all."""
    del user
    highlights = await fetch_carousel_highlights(limit=40)
    data = [_normalize_highlight(row) for row in highlights if row]
    return {"status": "success", "data": data}
