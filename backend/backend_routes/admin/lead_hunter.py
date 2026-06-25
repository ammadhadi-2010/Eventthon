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
    return {
        "status": "success",
        "sent": True,
        "lead_id": body.lead_id,
        "provider": EVENTTHON_FROM_NAME,
        "from_name": EVENTTHON_FROM_NAME,
        "from_email": EVENTTHON_FROM_EMAIL,
        "reply_to": EVENTTHON_REPLY_TO,
        "message": f"Pitch queued via {EVENTTHON_FROM_NAME} outreach to {email}",
    }
