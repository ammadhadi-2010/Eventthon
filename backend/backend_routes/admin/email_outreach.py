"""Email Outreach — admin CRUD, stats, activity, AI."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field

from database import lead_hunter_leads_collection
from .email_outreach_activity import (
    list_recent_activity,
    log_outreach_activity,
    outreach_performance_stats,
)
from .email_outreach_ai import generate_outreach_email
from .email_outreach_helpers import (
    db_status,
    lead_favicon_url,
    normalize_website,
    serialize_lead,
    tab_filter,
)
from .email_outreach_send import AiGenerateBody, SendOutreachBody, perform_outreach_send
from .email_outreach_schedule import ScheduleOutreachBody, create_scheduled_send
from .email_outreach_templates import TemplateCreateBody, create_template, list_templates
from .email_outreach_replies import ingest_inbox_replies, list_inbox_replies
from .email_outreach_ai_responder import (
    AiResponderSettingsBody,
    get_ai_responder_settings,
    process_pending_ai_replies,
    save_ai_responder_settings,
)

router = APIRouter(tags=["Admin Email Outreach"])


class CreateLeadBody(BaseModel):
    company: str = Field(..., min_length=1, max_length=200)
    website: str = Field(..., min_length=1, max_length=500)
    contact_email: EmailStr
    contact_name: str = Field("", max_length=120)
    status: str = Field("not_contacted", max_length=32)


class UpdateLeadBody(BaseModel):
    company: str | None = Field(None, max_length=200)
    website: str | None = Field(None, max_length=500)
    contact_email: EmailStr | None = None
    contact_name: str | None = Field(None, max_length=120)
    status: str | None = Field(None, max_length=32)


@router.get("/email-outreach/stats")
async def email_outreach_stats():
    payload = await outreach_performance_stats()
    return {"status": "success", **payload}


@router.get("/email-outreach/activity")
async def email_outreach_activity(limit: int = Query(20, ge=1, le=100)):
    rows = await list_recent_activity(limit)
    return {"status": "success", "rows": rows}


@router.get("/email-outreach/leads")
async def list_email_outreach_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    tab: str = Query("all"),
    q: str = Query(""),
):
    filt: dict[str, Any] = tab_filter(tab)
    query = str(q or "").strip()
    if query:
        filt["$or"] = [
            {"company": {"$regex": query, "$options": "i"}},
            {"website": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}},
        ]
    perf = await outreach_performance_stats()
    counts = perf["counts"]
    total_items = await lead_hunter_leads_collection.count_documents(filt)
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    safe_page = min(max(page, 1), total_pages)
    skip = (safe_page - 1) * page_size
    cursor = lead_hunter_leads_collection.find(filt).sort("created_at", -1).skip(skip).limit(page_size)
    docs = await cursor.to_list(length=page_size)
    return {
        "status": "success",
        "rows": [serialize_lead(doc) for doc in docs],
        "page": safe_page,
        "pageSize": page_size,
        "totalItems": total_items,
        "totalPages": total_pages,
        "tabCounts": counts,
    }


@router.get("/email-outreach/leads/{lead_id}")
async def get_email_outreach_lead(lead_id: str):
    doc = await lead_hunter_leads_collection.find_one({"id": lead_id})
    if not doc:
        doc = await lead_hunter_leads_collection.find_one({"_id": lead_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "success", "lead": serialize_lead(doc)}


@router.post("/email-outreach/leads")
async def create_email_outreach_lead(body: CreateLeadBody):
    now = datetime.now(timezone.utc)
    lead_id = f"lead-{uuid.uuid4().hex[:10]}"
    website = normalize_website(body.website)
    doc = {
        "_id": lead_id,
        "id": lead_id,
        "company": body.company.strip(),
        "website": website,
        "email": str(body.contact_email).lower().strip(),
        "contact_name": body.contact_name.strip() or f"{body.company.strip()} Team",
        "status": db_status(body.status),
        "imageurl": lead_favicon_url(website),
        "created_at": now,
        "last_contacted_at": None,
        "category": "Manual",
        "country": "",
        "city": "",
    }
    await lead_hunter_leads_collection.insert_one(doc)
    await log_outreach_activity(
        activity_type="lead_added",
        highlight=doc["company"],
        detail=f"{doc['company']} was added to your outreach pipeline.",
        lead_id=lead_id,
        to_email=doc["email"],
    )
    return {"status": "success", "lead": serialize_lead(doc)}


@router.patch("/email-outreach/leads/{lead_id}")
async def update_email_outreach_lead(lead_id: str, body: UpdateLeadBody):
    doc = await lead_hunter_leads_collection.find_one({"id": lead_id})
    if not doc:
        doc = await lead_hunter_leads_collection.find_one({"_id": lead_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Lead not found")
    patch: dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    if body.company is not None:
        patch["company"] = body.company.strip()
    if body.website is not None:
        website = normalize_website(body.website)
        patch["website"] = website
        patch["imageurl"] = lead_favicon_url(website)
    if body.contact_email is not None:
        patch["email"] = str(body.contact_email).lower().strip()
    if body.contact_name is not None:
        patch["contact_name"] = body.contact_name.strip()
    if body.status is not None:
        patch["status"] = db_status(body.status)
        if db_status(body.status) == "replied":
            await log_outreach_activity(
                activity_type="reply_received",
                highlight=patch.get("company") or doc.get("company") or "Lead",
                detail="Lead status updated to replied.",
                lead_id=lead_id,
            )
    await lead_hunter_leads_collection.update_one({"id": lead_id}, {"$set": patch})
    fresh = await lead_hunter_leads_collection.find_one({"id": lead_id})
    return {"status": "success", "lead": serialize_lead(fresh or doc)}


@router.delete("/email-outreach/leads/{lead_id}")
async def delete_email_outreach_lead(lead_id: str):
    result = await lead_hunter_leads_collection.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        result = await lead_hunter_leads_collection.delete_one({"_id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "success", "deleted": True}


@router.post("/email-outreach/send")
async def send_email_outreach(body: SendOutreachBody):
    return await perform_outreach_send(body)


@router.post("/email-outreach/schedule")
async def schedule_email_outreach(body: ScheduleOutreachBody):
    return await create_scheduled_send(body)


@router.post("/email-outreach/ai-generate")
async def email_outreach_ai_generate(body: AiGenerateBody):
    try:
        result = await generate_outreach_email(
            prompt=body.prompt,
            company=body.company,
            to_email=body.to,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "success", **result}


@router.get("/email-outreach/templates")
async def email_outreach_templates_list():
    rows = await list_templates()
    return {"status": "success", "templates": rows}


@router.post("/email-outreach/templates")
async def email_outreach_templates_create(body: TemplateCreateBody):
    template = await create_template(body)
    return {"status": "success", "template": template}


@router.get("/email-outreach/replies")
async def email_outreach_replies_list(lead_id: str = "", limit: int = 50):
    rows = await list_inbox_replies(lead_id=lead_id, limit=limit)
    return {"status": "success", "replies": rows}


@router.post("/email-outreach/replies/sync")
async def email_outreach_replies_sync():
    count = await ingest_inbox_replies()
    return {"status": "success", "ingested": count, "message": f"Synced {count} new reply(ies)"}


@router.get("/email-outreach/ai-responder/settings")
async def email_outreach_ai_responder_get():
    settings = await get_ai_responder_settings()
    return {"status": "success", "settings": settings}


@router.put("/email-outreach/ai-responder/settings")
async def email_outreach_ai_responder_save(body: AiResponderSettingsBody):
    settings = await save_ai_responder_settings(body)
    return {"status": "success", "settings": settings, "message": "AI Responder settings saved"}


@router.post("/email-outreach/ai-responder/process-pending")
async def email_outreach_ai_responder_process_pending():
    sent = await process_pending_ai_replies(limit=20)
    return {"status": "success", "sent": sent, "message": f"AI Auto-Pilot sent {sent} reply(ies)"}
