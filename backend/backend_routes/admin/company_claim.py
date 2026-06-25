"""Merge employer registration into existing admin-seeded company profiles."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from database import companies_collection

PENDING_REVIEW_MESSAGE = (
    "Your company profile is successfully submitted and is under review by our Admin team. "
    "Features will unlock shortly upon verification."
)


def _clean(value: Optional[str], max_len: int = 240) -> str:
    return str(value or "").strip()[:max_len]


def _normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip().lower())


def _registration_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").strip().lower())


def _website_domain(website: str) -> str:
    raw = (website or "").strip().lower()
    if not raw:
        return ""
    if "://" not in raw:
        raw = f"https://{raw}"
    try:
        host = urlparse(raw).netloc or urlparse(raw).path
    except ValueError:
        return ""
    host = host.split(":")[0].strip().lower()
    return host[4:] if host.startswith("www.") else host


def _is_claimable(doc: dict) -> bool:
    owner = _clean(doc.get("owner_user_id"), 120)
    if doc.get("is_admin_seed") is True:
        return True
    if doc.get("is_claimed") is True:
        return False
    return not owner


async def find_claimable_company(
    company_name: str,
    registration_number: str = "",
    website: str = "",
) -> Optional[dict]:
    norm_name = _normalize_name(company_name)
    reg_key = _registration_key(registration_number)
    domain = _website_domain(website)

    or_filters = []
    if norm_name:
        escaped = re.escape(company_name.strip())
        or_filters.append({"name": {"$regex": f"^{escaped}$", "$options": "i"}})
    if reg_key:
        or_filters.append({"registration_number": {"$regex": f"^{re.escape(registration_number.strip())}$", "$options": "i"}})
        or_filters.append({"tax_id": {"$regex": f"^{re.escape(registration_number.strip())}$", "$options": "i"}})
    if domain:
        or_filters.append({"website": {"$regex": re.escape(domain), "$options": "i"}})

    if not or_filters:
        return None

    cursor = companies_collection.find({"$or": or_filters}).limit(12)
    async for doc in cursor:
        if _is_claimable(doc):
            return doc
    return None


async def claim_or_create_pending_company(
    owner_user_id: str,
    company_name: str,
    contact_email: str,
    country: str,
    registration_number: str,
    tax_id: str,
    imageurl: str,
    website: str = "",
) -> str:
    existing = await find_claimable_company(
        company_name=company_name,
        registration_number=registration_number,
        website=website,
    )
    now = datetime.utcnow().isoformat()
    owner = _clean(owner_user_id, 120)

    if existing:
        patch: Dict[str, Any] = {
            "owner_user_id": owner,
            "is_claimed": True,
            "claimed_at": now,
            "updated_at": now,
            "status": "pending",
            "is_verified": False,
            "is_draft": False,
            "verification_submitted_at": now,
            "verification_message": PENDING_REVIEW_MESSAGE,
        }
        if _clean(company_name, 160):
            patch["name"] = _clean(company_name, 160)
        if _clean(contact_email, 180):
            patch["contact_email"] = _clean(contact_email, 180).lower()
        if _clean(country, 80):
            patch["country"] = _clean(country, 80)
        if _clean(registration_number, 160):
            patch["registration_number"] = _clean(registration_number, 160)
        if _clean(tax_id, 160):
            patch["tax_id"] = _clean(tax_id, 160)
        if _clean(website, 240):
            patch["website"] = _clean(website, 240)
        proof = _clean(imageurl, 500)
        if proof:
            patch["verification_proof_imageurl"] = proof
            if not _clean(str(existing.get("imageurl") or ""), 500):
                patch["imageurl"] = proof
                patch["logo_url"] = proof
        await companies_collection.update_one({"_id": existing["_id"]}, {"$set": patch})
        return str(existing["_id"])

    doc = {
        "name": _clean(company_name, 160) or "My Company",
        "contact_email": _clean(contact_email, 180).lower(),
        "country": _clean(country, 80),
        "registration_number": _clean(registration_number, 160),
        "tax_id": _clean(tax_id, 160),
        "website": _clean(website, 240),
        "imageurl": _clean(imageurl, 500),
        "logo_url": _clean(imageurl, 500),
        "verification_proof_imageurl": _clean(imageurl, 500),
        "owner_user_id": owner,
        "is_claimed": True,
        "claimed_at": now,
        "is_admin_seed": False,
        "status": "pending",
        "is_verified": False,
        "is_draft": False,
        "verification_message": PENDING_REVIEW_MESSAGE,
        "verification_submitted_at": now,
        "created_at": now,
        "updated_at": now,
        "industry": "General",
        "size": "1-10",
        "location": "",
        "description": "",
        "followers": 0,
    }
    result = await companies_collection.insert_one(doc)
    return str(result.inserted_id)
