from __future__ import annotations

import os
import uuid
from typing import Optional

from fastapi import HTTPException, UploadFile

from backend_routes.admin.company_claim import claim_or_create_pending_company

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VERIFY_UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads", "company-verification")
os.makedirs(VERIFY_UPLOAD_DIR, exist_ok=True)


async def save_company_proof_upload(imageurl: Optional[UploadFile]) -> str:
    if not imageurl:
        return ""
    ext = os.path.splitext(imageurl.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"}:
        raise HTTPException(status_code=400, detail="Verification proof must be image or PDF.")
    file_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(VERIFY_UPLOAD_DIR, file_name)
    with open(path, "wb") as out:
        out.write(await imageurl.read())
    return f"/static/uploads/company-verification/{file_name}"


async def create_pending_company_for_employer(
    owner_user_id: str,
    company_name: str,
    contact_email: str,
    country: str,
    registration_number: str,
    tax_id: str,
    imageurl: str,
    website: str = "",
) -> str:
    return await claim_or_create_pending_company(
        owner_user_id=owner_user_id,
        company_name=company_name,
        contact_email=contact_email,
        country=country,
        registration_number=registration_number,
        tax_id=tax_id,
        imageurl=imageurl,
        website=website,
    )
