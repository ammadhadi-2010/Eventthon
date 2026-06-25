"""Resolve jobs.company_id → company name and imageurl."""
from __future__ import annotations

from typing import Any, Dict, Optional

from bson import ObjectId

from database import companies_collection
from .company_format import parse_imageurl
from .job_admin_format import coalesce_job_fields


async def find_company(company_id: str) -> Optional[dict]:
    cid = str(company_id or "").strip()
    if not cid:
        return None
    if ObjectId.is_valid(cid):
        doc = await companies_collection.find_one({"_id": ObjectId(cid)})
        if doc:
            return doc
    return await companies_collection.find_one({"_id": cid})


async def company_snapshot_for_job(company_id: str) -> Optional[Dict[str, str]]:
    doc = await find_company(company_id)
    if not doc:
        return None
    imageurl = parse_imageurl(doc)
    return {
        "company_id": str(doc["_id"]),
        "company_name": str(doc.get("name") or "Company").strip(),
        "company_imageurl": imageurl,
        "imageurl": imageurl,
    }


async def enrich_job_fields(doc: dict, cache: Optional[Dict[str, dict]] = None) -> Dict[str, str]:
    """Merge coalesce_job_fields with linked company record."""
    base = coalesce_job_fields(doc)
    cid = str(doc.get("company_id") or "").strip()
    if not cid:
        return base
    cache = cache if cache is not None else {}
    if cid not in cache:
        cache[cid] = await find_company(cid)
    company = cache.get(cid)
    if not company:
        return base
    return {
        "title": base["title"],
        "company": str(company.get("name") or base["company"]).strip(),
        "category": base["category"],
    }


def job_company_keys_on_write(company_id: str, snapshot: Dict[str, str]) -> Dict[str, Any]:
    """Strict company_id reference plus denormalized fields for listings."""
    return {
        "company_id": company_id,
        "company_name": snapshot.get("company_name") or "Company",
        "company_imageurl": snapshot.get("imageurl") or "",
        "imageurl": snapshot.get("imageurl") or "",
    }
