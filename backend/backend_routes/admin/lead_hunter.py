"""Lead Hunter — extract and outreach pitch for EventThon Network."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .lead_hunter_categories import list_platform_categories
from .lead_hunter_extract import (
    EVENTTHON_FROM_EMAIL,
    EVENTTHON_FROM_NAME,
    EVENTTHON_REPLY_TO,
    run_lead_extract,
)
from .lead_hunter_google_search import run_google_lead_search

router = APIRouter(tags=["Admin Lead Hunter"])


class GoogleSearchBody(BaseModel):
    country: str = Field(..., min_length=1, max_length=120)
    category: str = Field(..., min_length=1, max_length=200)
    country_code: str = Field("", max_length=8)


class ExtractBody(BaseModel):
    country: str = Field("", max_length=120)
    city: str = Field("", max_length=120)
    category: str = Field("", max_length=200)
    website_url: str = Field("", max_length=500)


class SendPitchBody(BaseModel):
    lead_id: str = Field(..., min_length=1, max_length=80)
    email: str = Field(..., min_length=3, max_length=200)
    subject: str = Field(..., min_length=3, max_length=300)
    body: str = Field(..., min_length=10, max_length=12000)
    country: str = Field("", max_length=120)
    city: str = Field("", max_length=120)
    category: str = Field("", max_length=200)


@router.get("/automation/categories")
async def automation_lead_hunter_categories():
    categories = await list_platform_categories()
    return {"status": "success", "categories": categories}


@router.post("/automation/google-search")
async def automation_google_lead_search(body: GoogleSearchBody):
    result = await run_google_lead_search(
        country=body.country,
        category=body.category,
        country_code=body.country_code,
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/automation/extract")
async def automation_extract_leads(body: ExtractBody):
    result = await run_lead_extract(
        country=body.country,
        city=body.city,
        category=body.category,
        website_url=body.website_url,
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/automation/send-pitch")
async def automation_send_pitch(body: SendPitchBody):
    email = str(body.email or "").strip()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Valid recipient email is required")
    from .email_outreach_mail import send_outreach_email
    from .email_outreach_helpers import format_last_contact

    html = body.body if "<" in body.body else body.body.replace("\n", "<br />")
    try:
        await send_outreach_email(to_email=email, subject=body.subject.strip(), body_html=html)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {exc}") from exc

    from datetime import datetime, timezone
    from database import lead_hunter_leads_collection

    now = datetime.now(timezone.utc)
    await lead_hunter_leads_collection.update_one(
        {"id": body.lead_id},
        {"$set": {"status": "emailed", "last_contacted_at": now, "updated_at": now}},
    )
    return {
        "status": "success",
        "sent": True,
        "lead_id": body.lead_id,
        "provider": EVENTTHON_FROM_NAME,
        "from_name": EVENTTHON_FROM_NAME,
        "from_email": EVENTTHON_FROM_EMAIL,
        "reply_to": EVENTTHON_REPLY_TO,
        "message": f"Pitch sent via {EVENTTHON_FROM_NAME} outreach to {email}",
        "lastContact": format_last_contact(now),
    }


@router.get("/email-outreach/lead-hunter/categories")
async def outreach_lead_hunter_categories():
    return await automation_lead_hunter_categories()


@router.post("/email-outreach/lead-hunter/google-search")
async def outreach_lead_hunter_google_search(body: GoogleSearchBody):
    return await automation_google_lead_search(body)


@router.post("/email-outreach/lead-hunter/extract")
async def outreach_lead_hunter_extract(body: ExtractBody):
    return await automation_extract_leads(body)


@router.post("/email-outreach/lead-hunter/send-pitch")
async def outreach_lead_hunter_send_pitch(body: SendPitchBody):
    return await automation_send_pitch(body)
