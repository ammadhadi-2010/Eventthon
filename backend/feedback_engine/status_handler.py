"""Admin status transitions for feedback bug reports."""
from __future__ import annotations

import logging

from backend_routes.alerts.alerts_helpers import resolve_user

from .presentation import ALLOWED_STATUSES, normalize_status, present_feedback_row
from .reporter import enrich_feedback_row, resolve_feedback_reporter
from .resolve import _push_resolve_notification
from .store import apply_feedback_status, find_feedback_report

logger = logging.getLogger(__name__)


async def submit_feedback_status(report_id: str, status: str) -> dict:
    normalized = normalize_status(status)
    if normalized not in ALLOWED_STATUSES:
        raise ValueError("Status must be New, In Progress, Resolved, or Closed.")

    existing = await find_feedback_report(report_id)
    if not existing:
        raise ValueError("Feedback report not found")

    previous = normalize_status(existing.get("status"))
    updated_raw = await apply_feedback_status(report_id, normalized)
    if not updated_raw:
        raise ValueError("Could not update feedback status")

    if normalized == "Resolved" and previous != "Resolved":
        user = await resolve_feedback_reporter(existing) or await _resolve_user_fallback(existing)
        if user:
            await _push_resolve_notification(user, existing)
            logger.info("Feedback resolve notification sent report=%s", report_id)
        else:
            logger.warning("Feedback status resolved without user notification report=%s", report_id)

    enriched = await enrich_feedback_row(updated_raw)
    return present_feedback_row(enriched)


async def _resolve_user_fallback(doc: dict):
    for key in ("user_id", "user_email", "user_mobile"):
        ident = str(doc.get(key) or "").strip()
        if not ident:
            continue
        user = await resolve_user(ident)
        if user:
            return user
    return None
