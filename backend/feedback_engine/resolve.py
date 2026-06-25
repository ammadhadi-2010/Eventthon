"""One-click feedback resolve handler with automatic user notification."""
from __future__ import annotations

import logging
from datetime import datetime

from backend_routes.alerts.alerts_helpers import resolve_user
from database import notification_collection

from .reporter import resolve_feedback_reporter
from .presentation import normalize_status
from .reporter import enrich_feedback_row
from .store import apply_feedback_resolve, find_feedback_report

logger = logging.getLogger(__name__)

RESOLVE_NOTIFICATION_MESSAGE = (
    "Update: The bug you reported has been successfully resolved by the development team. "
    "Thank you for making EventThon stable! 🚀"
)


async def _push_resolve_notification(user: dict, doc: dict) -> None:
    user_ref = str(user.get("_id") or "")
    identifier = str(user.get("email") or user.get("mobile") or user.get("user_id") or "").strip()
    await notification_collection.insert_one(
        {
            "user_ref": user_ref,
            "identifier": identifier,
            "category": "system",
            "priority": "high",
            "title": "Bug report resolved",
            "actor_name": "EventThon Development Team",
            "message": RESOLVE_NOTIFICATION_MESSAGE,
            "details": "Your submitted issue has been marked as resolved in the engineering queue.",
            "action_label": "View Alerts",
            "action_url": "/notifications/alerts",
            "section": "today",
            "is_read": False,
            "created_at": datetime.utcnow(),
            "audience": "member",
            "source": "feedback_resolve",
            "feedback_id": str(doc.get("_id") or ""),
        }
    )


async def submit_feedback_resolve(report_id: str) -> dict:
    existing = await find_feedback_report(report_id)
    if not existing:
        raise ValueError("Feedback report not found")

    previous = normalize_status(existing.get("status"))
    updated = await apply_feedback_resolve(report_id)
    if not updated:
        raise ValueError("Could not resolve feedback report")

    if previous != "Resolved":
        user = await resolve_feedback_reporter(existing) or await _resolve_user_fallback(existing)
        if user:
            await _push_resolve_notification(user, existing)
            logger.info("Feedback resolve notification sent to user_ref=%s report=%s", user.get("_id"), report_id)
        else:
            logger.warning("Feedback resolve saved without user notification: report=%s", report_id)

    return await enrich_feedback_row(updated)


async def _resolve_user_fallback(doc: dict):
    for key in ("user_id", "user_email", "user_mobile"):
        ident = str(doc.get(key) or "").strip()
        if not ident:
            continue
        user = await resolve_user(ident)
        if user:
            return user
    return None
