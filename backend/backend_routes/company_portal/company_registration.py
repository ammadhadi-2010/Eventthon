"""Company registration and verification submission flow."""
from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, UploadFile

from database import companies_collection, user_collection

from .portal_resolve import ensure_company_for_user, find_user

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VERIFY_UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads", "company-verification")
os.makedirs(VERIFY_UPLOAD_DIR, exist_ok=True)

PENDING_REVIEW_MESSAGE = (
    "Your company profile is successfully submitted and is under review by our Admin team. "
    "Features will unlock shortly upon verification."
)


def _clean(value: Optional[str], max_len: int = 240) -> str:
    return str(value or "").strip()[:max_len]


async def _save_proof_upload(imageurl: Optional[UploadFile]) -> str:
    if not imageurl:
        return ""
    ext = os.path.splitext(imageurl.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"}:
        raise HTTPException(status_code=400, detail="Verification proof must be image or PDF.")
    safe = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(VERIFY_UPLOAD_DIR, safe)
    with open(path, "wb") as out:
        out.write(await imageurl.read())
    return f"/static/uploads/company-verification/{safe}"


async def submit_company_registration(
    user_id: str,
    name: str = "",
    contact_email: str = "",
    country: str = "",
    registration_number: str = "",
    tax_id: str = "",
    website: str = "",
    industry: str = "",
    size: str = "",
    location: str = "",
    description: str = "",
    imageurl: Optional[UploadFile] = None,
) -> dict:
    uid = _clean(user_id, 120)
    if len(uid) < 2:
        raise HTTPException(status_code=400, detail="User identifier is required.")

    user = await find_user(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Sign in again.")

    company = await ensure_company_for_user(uid)
    if not company:
        raise HTTPException(status_code=404, detail="Could not create company profile for this account.")

    uploaded_url = await _save_proof_upload(imageurl)
    now = datetime.utcnow().isoformat()
    patch = {
        "name": _clean(name, 160) or str(company.get("name") or "My Company"),
        "contact_email": _clean(contact_email, 180) or _clean(user.get("email"), 180),
        "country": _clean(country, 80),
        "registration_number": _clean(registration_number, 160),
        "tax_id": _clean(tax_id, 160),
        "website": _clean(website, 240),
        "industry": _clean(industry, 120) or "General",
        "size": _clean(size, 80) or "1-10",
        "location": _clean(location, 160),
        "description": _clean(description, 500),
        "status": "pending",
        "is_verified": False,
        "is_draft": False,
        "verification_submitted_at": now,
        "verification_message": PENDING_REVIEW_MESSAGE,
        "updated_at": now,
    }
    if uploaded_url:
        patch["imageurl"] = uploaded_url
        patch["logo_url"] = uploaded_url
        patch["verification_proof_imageurl"] = uploaded_url
    elif _clean(str(company.get("imageurl") or ""), 500):
        patch["verification_proof_imageurl"] = str(company.get("imageurl"))

    await companies_collection.update_one({"_id": company["_id"]}, {"$set": patch})
    updated = await companies_collection.find_one({"_id": company["_id"]})
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"company_id": str(company["_id"])}},
    )
    return updated or company
