"""Email Outreach — AI auto-responder settings and autopilot replies."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from database import outreach_ai_responder_settings_collection, outreach_replies_collection
from backend_routes.email_sender import sender_from_env
from .email_outreach_activity import log_outreach_activity
from .email_outreach_automated_filter import log_ignored_automated_email, should_ignore_automated_email
from .email_outreach_helpers import format_last_contact
from .email_outreach_mail import send_outreach_email
from .email_outreach_ollama import generate_ollama_reply

logger = logging.getLogger("email_outreach.ai_responder")
SETTINGS_ID = "default"

DEFAULT_SYSTEM_PROMPT = """You are the official AI assistant for EventThon Network.

Core objectives:
1. STRICTLY FOCUS ON EVENTTHON NETWORK
- Your primary and only task is to inform, assist, and guide users about EventThon Network services.
- Always steer the conversation back to bringing users onto the EventThon Network platform.
- Do NOT answer general tech, external platform queries, or off-topic questions unless they directly relate to joining or using EventThon Network.

2. REPLY STYLE
- Write concise, professional email replies (under 180 words).
- Sign off as EventThon Network.
- Highlight EventThon services when relevant: events, gigs, squads, verified hiring, wallet, and partner onboarding.

If the message is off-topic, politely redirect the sender to EventThon Network and invite them to explore or join the platform."""


class AiResponderSettingsBody(BaseModel):
    auto_pilot_enabled: bool = False
    system_prompt: str = Field(..., min_length=10, max_length=8000)


def _serialize_settings(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "autoPilotEnabled": bool(doc.get("auto_pilot_enabled")),
        "systemPrompt": str(doc.get("system_prompt") or DEFAULT_SYSTEM_PROMPT),
        "updatedAt": format_last_contact(doc.get("updated_at")) if doc.get("updated_at") else "",
    }


async def get_ai_responder_settings() -> dict[str, Any]:
    doc = await outreach_ai_responder_settings_collection.find_one({"_id": SETTINGS_ID})
    if not doc:
        return _serialize_settings({"auto_pilot_enabled": False, "system_prompt": DEFAULT_SYSTEM_PROMPT})
    return _serialize_settings(doc)


async def save_ai_responder_settings(body: AiResponderSettingsBody) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    doc = {
        "_id": SETTINGS_ID,
        "auto_pilot_enabled": bool(body.auto_pilot_enabled),
        "system_prompt": body.system_prompt.strip() or DEFAULT_SYSTEM_PROMPT,
        "updated_at": now,
    }
    await outreach_ai_responder_settings_collection.update_one({"_id": SETTINGS_ID}, {"$set": doc}, upsert=True)
    logger.info("AI Auto-Pilot settings saved | enabled=%s", doc["auto_pilot_enabled"])
    return _serialize_settings(doc)


async def _settings_enabled() -> dict[str, Any] | None:
    doc = await outreach_ai_responder_settings_collection.find_one({"_id": SETTINGS_ID})
    if not doc or not doc.get("auto_pilot_enabled"):
        logger.info("AI Auto-Pilot is OFF — skipping auto-reply")
        return None
    return doc


async def _mark_skipped_automated(reply_id: str, reason: str) -> None:
    await outreach_replies_collection.update_one(
        {"id": reply_id},
        {
            "$set": {
                "ai_reply_status": "skipped",
                "status": "ignored_automated",
                "ai_skip_reason": reason[:500],
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )


def _reply_subject(subject: str) -> str:
    clean = str(subject or "").strip() or "Your message"
    return clean if clean.lower().startswith("re:") else f"Re: {clean}"


def _to_html(text: str) -> str:
    return str(text or "").strip().replace("\n", "<br />")


async def _claim_reply(reply_id: str) -> dict[str, Any] | None:
    return await outreach_replies_collection.find_one_and_update(
        {
            "id": reply_id,
            "status": {"$ne": "ai_replied"},
            "ai_reply_status": {"$nin": ["processing", "sent", "skipped"]},
        },
        {"$set": {"ai_reply_status": "processing", "updated_at": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.BEFORE,
    )


async def _mark_failed(reply_id: str, error: str) -> None:
    await outreach_replies_collection.update_one(
        {"id": reply_id},
        {"$set": {"ai_reply_status": "failed", "ai_reply_error": error[:500]}},
    )


async def try_auto_reply_to_inbound(reply_doc: dict[str, Any]) -> bool:
    settings_doc = await _settings_enabled()
    if not settings_doc:
        return False

    reply_id = str(reply_doc.get("id") or reply_doc.get("_id") or "")
    if not reply_id:
        return False
    if reply_doc.get("status") == "ai_replied" or reply_doc.get("ai_reply_body"):
        return False

    message_id = str(reply_doc.get("message_id") or "").strip()
    if message_id:
        sent = await outreach_replies_collection.find_one(
            {"ai_reply_for_message_id": message_id, "status": "ai_replied"}
        )
        if sent:
            logger.info("AI already replied to message_id=%s — skip", message_id)
            return False

    ignore, reason = should_ignore_automated_email(reply_doc)
    if ignore:
        log_ignored_automated_email(logger, reply_doc, reason)
        await _mark_skipped_automated(reply_id, reason)
        return False

    sender = str(reply_doc.get("sender_email") or "").strip().lower()
    if not sender or "@" not in sender:
        return False

    _, our_email, _ = sender_from_env()
    if sender == our_email.lower():
        return False

    claimed = await _claim_reply(reply_id)
    if not claimed:
        return False
    reply_doc = claimed

    system_prompt = str(settings_doc.get("system_prompt") or DEFAULT_SYSTEM_PROMPT)
    incoming = str(reply_doc.get("body_content") or "").strip()
    subject = _reply_subject(str(reply_doc.get("subject") or ""))
    user_prompt = (
        f"From: {sender}\nSubject: {reply_doc.get('subject') or ''}\n\n"
        f"{incoming or '(empty body)'}\n\n"
        "Write the reply body only. Stay strictly on EventThon Network — "
        "if the message is off-topic, redirect them to EventThon services and onboarding."
    )

    logger.info("AI Auto-Pilot generating reply | reply_id=%s to=%s", reply_id, sender)
    try:
        ai_body = await asyncio.to_thread(
            generate_ollama_reply,
            system_prompt=system_prompt,
            user_message=user_prompt,
        )
    except RuntimeError as exc:
        logger.error("AI auto-reply generation failed | reply_id=%s error=%s", reply_id, exc)
        await _mark_failed(reply_id, str(exc))
        return False

    try:
        await send_outreach_email(to_email=sender, subject=subject, body_html=_to_html(ai_body))
    except RuntimeError as exc:
        logger.error("AI auto-reply SMTP failed | reply_id=%s error=%s", reply_id, exc)
        await _mark_failed(reply_id, str(exc))
        return False

    now = datetime.now(timezone.utc)
    await outreach_replies_collection.update_one(
        {"id": reply_id},
        {
            "$set": {
                "status": "ai_replied",
                "ai_reply_status": "sent",
                "ai_reply_body": ai_body,
                "ai_replied_at": now,
                "ai_reply_for_message_id": message_id,
                "updated_at": now,
            }
        },
    )

    highlight = str(reply_doc.get("company") or reply_doc.get("sender_name") or sender)
    await log_outreach_activity(
        activity_type="ai_replied",
        highlight=highlight,
        detail=f"AI Auto-Pilot replied to {sender}: {ai_body[:180]}",
        lead_id=str(reply_doc.get("lead_id") or ""),
        to_email=sender,
        subject=subject,
    )
    logger.info("AI auto-reply sent | reply_id=%s to=%s", reply_id, sender)
    return True


async def process_pending_ai_replies(limit: int = 10) -> int:
    if not await _settings_enabled():
        return 0
    cursor = outreach_replies_collection.find(
        {
            "status": {"$nin": ["ai_replied", "ignored_automated"]},
            "ai_reply_status": {"$nin": ["processing", "sent", "skipped"]},
        }
    ).sort("received_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    sent = 0
    for doc in docs:
        try:
            if await try_auto_reply_to_inbound(doc):
                sent += 1
        except Exception as exc:
            logger.error("Pending AI auto-reply failed | id=%s error=%s", doc.get("id"), exc)
    if sent:
        logger.info("AI Auto-Pilot processed %s pending reply(ies)", sent)
    return sent
