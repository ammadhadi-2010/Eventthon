"""Email Outreach — incoming reply storage and ingestion."""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from database import lead_hunter_leads_collection, outreach_replies_collection
from .email_outreach_activity import log_outreach_activity
from .email_outreach_helpers import format_last_contact
from .email_outreach_imap import fetch_unread_reply_messages, mark_message_seen
from .email_outreach_automated_filter import log_ignored_automated_email, should_ignore_automated_email
from .email_outreach_ai_responder import process_pending_ai_replies, try_auto_reply_to_inbound

logger = logging.getLogger("email_outreach.replies")


def serialize_reply(doc: dict[str, Any]) -> dict[str, Any]:
    received = doc.get("received_at")
    return {
        "id": str(doc.get("id") or doc.get("_id") or ""),
        "senderEmail": doc.get("sender_email") or "",
        "senderName": doc.get("sender_name") or doc.get("sender_email") or "Unknown",
        "recipientEmail": doc.get("recipient_email") or "",
        "subject": doc.get("subject") or "(No subject)",
        "bodyContent": doc.get("body_content") or "",
        "receivedAt": format_last_contact(received) if received else "Just now",
        "leadId": doc.get("lead_id") or "",
        "company": doc.get("company") or "",
        "status": doc.get("status") or "received",
        "aiReplyBody": doc.get("ai_reply_body") or "",
        "aiRepliedAt": format_last_contact(doc.get("ai_replied_at")) if doc.get("ai_replied_at") else "",
    }


async def _find_lead_for_sender(sender_email: str) -> dict[str, Any] | None:
    email_key = sender_email.lower().strip()
    doc = await lead_hunter_leads_collection.find_one({"email": email_key})
    if doc:
        return doc
    return await lead_hunter_leads_collection.find_one({"contact_email": email_key})


async def _trigger_autopilot(doc: dict[str, Any]) -> None:
    try:
        await try_auto_reply_to_inbound(doc)
    except Exception as exc:
        logger.error("AI auto-reply hook failed for %s — %s", doc.get("sender_email"), exc)


async def save_incoming_reply(payload: dict[str, Any]) -> bool:
    message_id = str(payload.get("message_id") or "").strip()
    gmail_uid = str(payload.get("gmail_uid") or "").strip()
    if message_id:
        existing = await outreach_replies_collection.find_one({"message_id": message_id})
        if existing:
            await _trigger_autopilot(existing)
            return False
    if gmail_uid:
        existing = await outreach_replies_collection.find_one({"gmail_uid": gmail_uid})
        if existing:
            await _trigger_autopilot(existing)
            return False

    sender_email = str(payload.get("sender_email") or "").lower().strip()
    ignore, reason = should_ignore_automated_email(payload)
    if ignore:
        log_ignored_automated_email(logger, payload, reason)
        if gmail_uid:
            await mark_message_seen(gmail_uid)
        return False

    subject = str(payload.get("subject") or "").strip()
    body_content = str(payload.get("body_content") or "").strip()

    lead_doc = await _find_lead_for_sender(sender_email)
    lead_id = str(lead_doc.get("id") or lead_doc.get("_id") or "") if lead_doc else ""
    company = str(lead_doc.get("company") or "") if lead_doc else ""
    sender_name = str(payload.get("sender_name") or sender_email)
    received_at = payload.get("received_at")
    if received_at and getattr(received_at, "tzinfo", None) is None:
        received_at = received_at.replace(tzinfo=timezone.utc)
    if not received_at:
        received_at = datetime.now(timezone.utc)

    reply_id = f"reply-{uuid.uuid4().hex[:10]}"
    doc = {
        "_id": reply_id,
        "id": reply_id,
        "sender_email": sender_email,
        "sender_name": sender_name,
        "recipient_email": str(payload.get("recipient_email") or "").lower().strip(),
        "subject": subject,
        "body_content": body_content,
        "received_at": received_at,
        "lead_id": lead_id,
        "company": company,
        "message_id": message_id,
        "gmail_uid": gmail_uid,
        "in_reply_to": str(payload.get("in_reply_to") or "").strip(),
        "from_header": str(payload.get("from_header") or "").strip(),
        "reply_to": str(payload.get("reply_to") or "").strip(),
        "return_path": str(payload.get("return_path") or "").strip(),
        "status": "received",
        "ai_reply_status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    await outreach_replies_collection.insert_one(doc)

    if lead_id:
        await lead_hunter_leads_collection.update_one(
            {"id": lead_id},
            {"$set": {"status": "replied", "updated_at": datetime.now(timezone.utc)}},
        )

    highlight = company or sender_name or sender_email
    preview = doc["body_content"][:180] + ("…" if len(doc["body_content"]) > 180 else "")
    await log_outreach_activity(
        activity_type="reply_received",
        highlight=highlight,
        detail=preview or f"New reply received from {sender_email}.",
        lead_id=lead_id,
        to_email=sender_email,
        subject=doc["subject"],
    )
    logger.info("Saved inbox reply from %s linked_lead=%s", sender_email, lead_id or "none")
    await _trigger_autopilot(doc)
    return True


async def ingest_inbox_replies() -> int:
    messages = await asyncio.to_thread(fetch_unread_reply_messages)
    saved = 0
    for payload in messages:
        try:
            if await save_incoming_reply(payload):
                await asyncio.to_thread(mark_message_seen, payload.get("gmail_uid", ""))
                saved += 1
        except Exception as exc:
            logger.error("Failed to ingest reply uid=%s — %s", payload.get("gmail_uid"), exc)
    await process_pending_ai_replies()
    return saved


async def list_inbox_replies(*, lead_id: str = "", limit: int = 50) -> list[dict[str, Any]]:
    filt: dict[str, Any] = {}
    if lead_id.strip():
        filt["lead_id"] = lead_id.strip()
    safe_limit = min(max(limit, 1), 100)
    cursor = outreach_replies_collection.find(filt).sort("received_at", -1).limit(safe_limit)
    docs = await cursor.to_list(length=safe_limit)
    return [serialize_reply(doc) for doc in docs]
