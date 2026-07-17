"""Email Outreach — public API aliases (/api/outreach/*)."""

from __future__ import annotations

from fastapi import APIRouter

from .email_outreach_ai import generate_outreach_email
from .email_outreach_schedule import ScheduleOutreachBody, create_scheduled_send
from .email_outreach_send import AiGenerateBody, SendOutreachBody, perform_outreach_send
from .email_outreach_templates import TemplateCreateBody, create_template, list_templates
from .email_outreach_replies import ingest_inbox_replies, list_inbox_replies
from .email_outreach_ai_responder import (
    AiResponderSettingsBody,
    get_ai_responder_settings,
    process_pending_ai_replies,
    save_ai_responder_settings,
)

router = APIRouter(tags=["Outreach API"])


@router.get("/health")
async def outreach_health():
    return {"status": "ok", "service": "email-outreach"}


@router.post("/send")
async def outreach_send(body: SendOutreachBody):
    return await perform_outreach_send(body)


@router.post("/schedule")
async def outreach_schedule(body: ScheduleOutreachBody):
    return await create_scheduled_send(body)


@router.post("/ai-generate")
async def outreach_ai_generate(body: AiGenerateBody):
    try:
        result = await generate_outreach_email(
            prompt=body.prompt,
            company=body.company,
            to_email=body.to,
        )
    except ValueError as exc:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "success", **result}


@router.get("/templates")
async def outreach_templates_list():
    rows = await list_templates()
    return {"status": "success", "templates": rows}


@router.post("/templates")
async def outreach_templates_create(body: TemplateCreateBody):
    template = await create_template(body)
    return {"status": "success", "template": template}


@router.get("/replies")
async def outreach_replies_list(lead_id: str = "", limit: int = 50):
    rows = await list_inbox_replies(lead_id=lead_id, limit=limit)
    return {"status": "success", "replies": rows}


@router.post("/replies/sync")
async def outreach_replies_sync():
    count = await ingest_inbox_replies()
    return {"status": "success", "ingested": count, "message": f"Synced {count} new reply(ies)"}


@router.get("/ai-responder/settings")
async def outreach_ai_responder_get():
    settings = await get_ai_responder_settings()
    return {"status": "success", "settings": settings}


@router.put("/ai-responder/settings")
async def outreach_ai_responder_save(body: AiResponderSettingsBody):
    settings = await save_ai_responder_settings(body)
    return {"status": "success", "settings": settings, "message": "AI Responder settings saved"}


@router.post("/ai-responder/process-pending")
async def outreach_ai_responder_process_pending():
    sent = await process_pending_ai_replies(limit=20)
    return {"status": "success", "sent": sent, "message": f"AI Auto-Pilot sent {sent} reply(ies)"}
