"""Email Outreach — send handler with activity logging."""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from database import lead_hunter_leads_collection
from .email_outreach_activity import log_outreach_activity
from .email_outreach_helpers import format_last_contact
from .email_outreach_mail import send_outreach_email

logger = logging.getLogger("email_outreach.send")

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SendOutreachBody(BaseModel):
    model_config = ConfigDict(extra="ignore")

    lead_id: str = Field(default="", max_length=80)
    to: str = Field(..., min_length=3, max_length=320)
    subject: str = Field(default="", max_length=300)
    body: str = Field(default="", max_length=12000)
    bodyText: str = Field(default="", max_length=12000)
    cc: str = Field(default="", max_length=500)
    bcc: str = Field(default="", max_length=500)

    @field_validator("to", "subject", "body", "bodyText", "cc", "bcc", "lead_id", mode="before")
    @classmethod
    def coerce_text(cls, value: object) -> str:
        if value is None:
            return ""
        return str(value).strip()


class AiGenerateBody(BaseModel):
    model_config = ConfigDict(extra="ignore")

    prompt: str = Field(..., min_length=3, max_length=2000)
    company: str = Field(default="", max_length=200)
    to: str = Field(default="", max_length=200)


def _resolve_subject(subject: str) -> str:
    cleaned = str(subject or "").strip()
    return cleaned if len(cleaned) >= 3 else "EventThon Outreach"


def _validate_recipient(email: str) -> str:
    cleaned = str(email or "").strip()
    if not _EMAIL_RE.match(cleaned):
        raise HTTPException(status_code=400, detail="Invalid recipient email")
    return cleaned


async def perform_outreach_send(body: SendOutreachBody) -> dict[str, Any]:
    recipient = _validate_recipient(body.to)
    subject = _resolve_subject(body.subject)
    content = str(body.body or body.bodyText or "").strip()
    if len(content) < 3:
        raise HTTPException(status_code=400, detail="Email body is required")
    html = content if "<" in content else content.replace("\n", "<br />")
    logger.info("Outreach send requested | to=%s subject=%r", recipient, subject)
    try:
        await send_outreach_email(
            to_email=recipient,
            subject=subject,
            body_html=html,
            cc=body.cc,
            bcc=body.bcc,
        )
    except RuntimeError as exc:
        logger.error("Outreach send failed | to=%s error=%s", recipient, exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Outreach send failed | to=%s error=%s", recipient, exc)
        raise HTTPException(status_code=500, detail=f"Failed to send email: {exc}") from exc
    logger.info("Outreach send completed | to=%s", recipient)

    now = datetime.now(timezone.utc)
    lead_doc = None
    if body.lead_id.strip():
        await lead_hunter_leads_collection.update_one(
            {"id": body.lead_id.strip()},
            {"$set": {"status": "emailed", "last_contacted_at": now, "updated_at": now}},
        )
        lead_doc = await lead_hunter_leads_collection.find_one({"id": body.lead_id.strip()})

    highlight = subject
    if lead_doc:
        highlight = lead_doc.get("company") or highlight

    activity = await log_outreach_activity(
        activity_type="email_sent",
        highlight=highlight,
        detail=f"Email successfully delivered to {recipient} with subject “{subject}”.",
        lead_id=body.lead_id.strip(),
        to_email=recipient,
        subject=subject,
    )

    return {
        "status": "success",
        "sent": True,
        "message": "Email sent successfully",
        "recipient": recipient,
        "lastContact": format_last_contact(now),
        "activity": activity,
    }
