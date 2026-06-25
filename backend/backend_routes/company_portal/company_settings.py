"""Company profile settings update endpoints."""
from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from database import companies_collection, jobs_collection
from .portal_resolve import ensure_company_for_user
from .portal_service import build_company_profile

router = APIRouter(prefix="/company", tags=["Company Settings"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads", "companies")
VERIFY_DIR = os.path.join(BASE_DIR, "static", "uploads", "company-verification")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VERIFY_DIR, exist_ok=True)

PENDING_MESSAGE = (
    "Your company profile is successfully submitted and is under review by our Admin team. "
    "Features will unlock shortly upon verification."
)

SIZE_OPTIONS = {"1-10", "11-50", "51-200", "201-500", "500+"}


def _clean(value: Optional[str], max_len: int = 500) -> str:
    return str(value or "").strip()[:max_len]


async def _save_branding_file(imageurl: UploadFile) -> str:
    ext = os.path.splitext(imageurl.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        raise HTTPException(status_code=400, detail="Logo and banner support jpg, png, webp, and gif only.")
    file_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(UPLOAD_DIR, file_name)
    with open(full_path, "wb") as out:
        out.write(await imageurl.read())
    return f"/static/uploads/companies/{file_name}"


async def _save_verification_proof(imageurl: UploadFile) -> str:
    ext = os.path.splitext(imageurl.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"}:
        raise HTTPException(status_code=400, detail="Verification proof must be image or PDF.")
    file_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(VERIFY_DIR, file_name)
    with open(full_path, "wb") as out:
        out.write(await imageurl.read())
    return f"/static/uploads/company-verification/{file_name}"


@router.put("/settings")
async def update_company_settings(
    user_id: str = Form(..., min_length=2, max_length=120),
    name: str = Form("", max_length=160),
    tagline: str = Form("", max_length=160),
    description: str = Form("", max_length=800),
    country: str = Form("", max_length=80),
    location: str = Form("", max_length=160),
    website: str = Form("", max_length=240),
    size: str = Form("", max_length=80),
    registration_number: str = Form("", max_length=160),
    tax_id: str = Form("", max_length=160),
    logo_imageurl: UploadFile | None = File(None),
    cover_imageurl: UploadFile | None = File(None),
    verification_imageurl: UploadFile | None = File(None),
):
    company_doc = await ensure_company_for_user(_clean(user_id, 120))
    if not company_doc:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    patch = {
        "name": _clean(name, 160) or str(company_doc.get("name") or "Company"),
        "tagline": _clean(tagline, 160),
        "description": _clean(description, 800),
        "country": _clean(country, 80),
        "location": _clean(location, 160),
        "website": _clean(website, 240),
        "updated_at": datetime.utcnow().isoformat(),
    }
    clean_size = _clean(size, 80)
    if clean_size:
        patch["size"] = clean_size if clean_size in SIZE_OPTIONS else str(company_doc.get("size") or "1-10")

    reg_no = _clean(registration_number, 160)
    tax = _clean(tax_id, 160)
    if reg_no:
        patch["registration_number"] = reg_no
    if tax:
        patch["tax_id"] = tax

    if logo_imageurl:
        logo_url = await _save_branding_file(logo_imageurl)
        patch["imageurl"] = logo_url
        patch["logo_url"] = logo_url
    if cover_imageurl:
        patch["cover_imageurl"] = await _save_branding_file(cover_imageurl)

    if verification_imageurl:
        proof_url = await _save_verification_proof(verification_imageurl)
        patch["verification_proof_imageurl"] = proof_url
        patch["verification_submitted_at"] = datetime.utcnow().isoformat()
        patch["verification_message"] = PENDING_MESSAGE
        patch["status"] = "pending"
        patch["is_verified"] = False
        patch["is_draft"] = False

    await companies_collection.update_one({"_id": company_doc["_id"]}, {"$set": patch})
    updated = await companies_collection.find_one({"_id": company_doc["_id"]})
    open_jobs = await jobs_collection.count_documents({"company_id": str(company_doc["_id"])})
    profile = await build_company_profile(updated or company_doc, open_jobs)
    return {"status": "success", "data": profile}
