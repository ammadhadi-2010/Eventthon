"""Company employer portal HTTP routes."""
from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from .company_registration import submit_company_registration
from .portal_service import build_company_profile, build_dashboard_payload
from .portal_resolve import ensure_company_for_user, find_user

router = APIRouter(prefix="/company-portal", tags=["Company Portal"])


@router.get("/dashboard")
async def company_dashboard(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = user_id.strip()
    if not await find_user(uid):
        raise HTTPException(status_code=404, detail="User account not found. Sign in again.")
    payload = await build_dashboard_payload(uid)
    if not payload:
        raise HTTPException(status_code=404, detail="Could not load company workspace for this account.")
    return {"status": "success", "data": payload}


@router.post("/register")
async def register_company(
    user_id: str = Form(..., min_length=2, max_length=120),
    name: str = Form("", max_length=160),
    contact_email: str = Form("", max_length=180),
    country: str = Form("", max_length=80),
    registration_number: str = Form("", max_length=160),
    tax_id: str = Form("", max_length=160),
    website: str = Form("", max_length=240),
    industry: str = Form("", max_length=120),
    size: str = Form("", max_length=80),
    location: str = Form("", max_length=160),
    description: str = Form("", max_length=500),
    imageurl: UploadFile | None = File(None),
):
    doc = await submit_company_registration(
        user_id=user_id,
        name=name,
        contact_email=contact_email,
        country=country,
        registration_number=registration_number,
        tax_id=tax_id,
        website=website,
        industry=industry,
        size=size,
        location=location,
        description=description,
        imageurl=imageurl,
    )
    profile = await build_company_profile(doc, open_jobs=0)
    return {"status": "success", "message": profile.get("reviewMessage"), "data": profile}


@router.get("/verification-status")
async def company_verification_status(user_id: str = Query(..., min_length=2, max_length=120)):
    doc = await ensure_company_for_user(user_id.strip())
    if not doc:
        raise HTTPException(status_code=404, detail="Company profile not found.")
    profile = await build_company_profile(doc, open_jobs=0)
    return {"status": "success", "data": profile}
