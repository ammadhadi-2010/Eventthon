"""Email Outreach — scheduled send queue."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, EmailStr, Field

from database import outreach_scheduled_collection
from .email_outreach_send import SendOutreachBody, perform_outreach_send


class ScheduleOutreachBody(SendOutreachBody):
    send_at: str = Field(..., min_length=10, max_length=40)


def _parse_send_at(raw: str) -> datetime:
    text = str(raw or "").strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid send_at datetime") from exc
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


async def create_scheduled_send(body: ScheduleOutreachBody) -> dict[str, Any]:
    send_at = _parse_send_at(body.send_at)
    if send_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Scheduled time must be in the future")
    content = str(body.body or body.bodyText or "").strip()
    if len(content) < 3:
        raise HTTPException(status_code=400, detail="Email body is required")
    job_id = f"sched-{uuid.uuid4().hex[:10]}"
    doc = {
        "_id": job_id,
        "id": job_id,
        "status": "pending",
        "lead_id": body.lead_id.strip(),
        "to": str(body.to),
        "subject": body.subject.strip(),
        "body": content,
        "cc": body.cc,
        "bcc": body.bcc,
        "send_at": send_at,
        "created_at": datetime.now(timezone.utc),
    }
    await outreach_scheduled_collection.insert_one(doc)
    return {
        "status": "success",
        "scheduled": True,
        "jobId": job_id,
        "sendAt": send_at.isoformat(),
        "message": f"Email scheduled for {send_at.strftime('%Y-%m-%d %H:%M UTC')}",
    }


async def process_due_scheduled_emails() -> int:
    now = datetime.now(timezone.utc)
    cursor = outreach_scheduled_collection.find(
        {"status": "pending", "send_at": {"$lte": now}},
    ).limit(20)
    docs = await cursor.to_list(length=20)
    sent = 0
    for doc in docs:
        job_id = str(doc.get("id") or doc.get("_id"))
        claimed = await outreach_scheduled_collection.update_one(
            {"id": job_id, "status": "pending"},
            {"$set": {"status": "processing", "updated_at": now}},
        )
        if claimed.modified_count == 0:
            continue
        try:
            payload = SendOutreachBody(
                lead_id=str(doc.get("lead_id") or ""),
                to=doc["to"],
                subject=doc["subject"],
                body=doc["body"],
                bodyText=doc["body"],
                cc=str(doc.get("cc") or ""),
                bcc=str(doc.get("bcc") or ""),
            )
            await perform_outreach_send(payload)
            await outreach_scheduled_collection.update_one(
                {"id": job_id},
                {"$set": {"status": "sent", "sent_at": datetime.now(timezone.utc)}},
            )
            sent += 1
        except Exception as exc:
            await outreach_scheduled_collection.update_one(
                {"id": job_id},
                {"$set": {"status": "failed", "error": str(exc)[:500]}},
            )
    return sent
