"""Admin reply handler — resolve feedback and notify the reporting user."""
from __future__ import annotations

import logging
from datetime import datetime

from backend_routes.alerts.alerts_helpers import resolve_user
from database import notification_collection

from .reporter import enrich_feedback_row
from .store import apply_feedback_reply, find_feedback_report

logger = logging.getLogger(__name__)

TYPE_LABELS = {
    "bug": "Bug",
    "feature_request": "Feature request",
    "abuse": "Abuse",
    "payment": "Payment",
    "other": "Other",
    "design": "Design Issue",
    "feature": "New Feature Idea",
}


async def _resolve_report_user(doc: dict):
    for key in ("user_id", "user_email", "user_mobile"):
        ident = str(doc.get(key) or "").strip()
        if not ident:
            continue
        user = await resolve_user(ident)
        if user:
            return user
    return None


async def _push_user_notification(user: dict, doc: dict, reply_message: str, admin_name: str) -> None:
    user_ref = str(user.get("_id") or "")
    identifier = str(user.get("email") or user.get("mobile") or user.get("user_id") or "").strip()
    label = TYPE_LABELS.get(str(doc.get("type") or ""), "Feedback")
    await notification_collection.insert_one(
        {
            "user_ref": user_ref,
            "identifier": identifier,
            "category": "system",
            "priority": "high",
            "title": "Your feedback report was resolved",
            "actor_name": admin_name,
            "message": reply_message,
            "details": (
                f"Engineering reviewed your {label} report and shared an update. "
                "Thank you for helping improve EventThon network stability."
            ),
            "action_label": "View Alerts",
            "action_url": "/notifications/alerts",
            "section": "today",
            "is_read": False,
            "created_at": datetime.utcnow(),
            "audience": "member",
            "source": "feedback_reply",
            "feedback_id": str(doc.get("_id") or ""),
        }
    )


async def submit_feedback_reply(report_id: str, message: str, admin_name: str) -> dict:
    existing = await find_feedback_report(report_id)
    if not existing:
        raise ValueError("Feedback report not found")

    updated = await apply_feedback_reply(report_id, message, admin_name)
    if not updated:
        raise ValueError("Could not update feedback report")

    user = await _resolve_report_user(existing)
    if user:
        await _push_user_notification(user, existing, message, admin_name)
        logger.info("Feedback reply notification sent to user_ref=%s report=%s", user.get("_id"), report_id)
    else:
        logger.warning("Feedback reply saved without user notification: report=%s", report_id)

    return await enrich_feedback_row(updated)
