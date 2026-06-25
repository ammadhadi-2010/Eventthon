"""Resolve or bootstrap a company record for an employer account."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Set

from database import companies_collection, job_alerts_collection, jobs_collection, user_collection
from backend_routes.admin.job_company_link import find_company


async def find_user(identifier: str) -> Optional[dict]:
    raw = str(identifier or "").strip()
    if not raw:
        return None
    queries = [{"mobile": raw}, {"user_id": raw}, {"email": raw.lower()}]
    if "@" not in raw:
        queries.append({"email": raw})
    for query in queries:
        doc = await user_collection.find_one(query)
        if doc:
            return doc
    return None


def owner_identifiers(user: Optional[dict], uid: str) -> List[str]:
    keys: Set[str] = set()
    for value in (uid, str(uid).lower()):
        if value and len(value) >= 2:
            keys.add(value)
    if user:
        for field in ("_id", "user_id", "mobile", "email"):
            val = user.get(field)
            if val is None:
                continue
            text = str(val).strip()
            if not text:
                continue
            keys.add(text)
            if field == "email":
                keys.add(text.lower())
    return list(keys)


def primary_owner_key(user: dict, fallback: str) -> str:
    email = str(user.get("email") or "").strip().lower()
    if email:
        return email
    mobile = str(user.get("mobile") or "").strip()
    if mobile:
        return mobile
    return str(user.get("_id") or fallback).strip()


def default_company_name(user: dict, owner_key: str) -> str:
    first = (user.get("first_name") or "").strip()
    last = (user.get("last_name") or "").strip()
    full = f"{first} {last}".strip()
    if full:
        return full
    if "@" in owner_key:
        return owner_key.split("@")[0].replace(".", " ").replace("_", " ").title()
    return "My Company"


async def resolve_company_for_user(user_id: str) -> Optional[dict]:
    uid = str(user_id or "").strip()
    if not uid:
        return None
    user = await find_user(uid)
    ids = owner_identifiers(user, uid)
    for owner_id in ids:
        doc = await companies_collection.find_one({"owner_user_id": owner_id})
        if doc:
            return doc
    if user:
        email = str(user.get("email") or "").strip().lower()
        if email:
            doc = await companies_collection.find_one(
                {"owner_user_id": {"$regex": f"^{email}$", "$options": "i"}}
            )
            if doc:
                return doc
        cid = str(user.get("company_id") or "").strip()
        if cid:
            found = await find_company(cid)
            if found:
                return found
        company_doc = await _company_from_user_jobs(ids)
        if company_doc:
            return company_doc
    return None


async def _company_from_user_jobs(identifiers: List[str]) -> Optional[dict]:
    if not identifiers:
        return None
    match = {
        "$or": [
            *[{"user_id": i} for i in identifiers],
            *[{"user_identifier": i} for i in identifiers],
        ]
    }
    alert = await job_alerts_collection.find_one(
        {**match, "company_id": {"$exists": True, "$nin": [None, ""]}}
    )
    if alert and alert.get("company_id"):
        return await find_company(str(alert["company_id"]))
    job = await jobs_collection.find_one(
        {**match, "company_id": {"$exists": True, "$nin": [None, ""]}}
    )
    if job and job.get("company_id"):
        return await find_company(str(job["company_id"]))
    return None


async def ensure_company_for_user(user_id: str) -> Optional[dict]:
    existing = await resolve_company_for_user(user_id)
    if existing:
        return existing
    user = await find_user(user_id)
    if not user:
        return None
    owner_key = primary_owner_key(user, user_id)
    now = datetime.utcnow().isoformat()
    doc = {
        "name": default_company_name(user, owner_key),
        "imageurl": str(user.get("profile_image_url") or user.get("avatar") or "").strip(),
        "industry": "General",
        "website": "",
        "size": "1-10",
        "location": str(user.get("location") or user.get("city") or "").strip(),
        "status": "draft",
        "is_verified": False,
        "owner_user_id": owner_key,
        "description": "",
        "followers": 0,
        "is_draft": True,
        "created_at": now,
        "updated_at": now,
    }
    result = await companies_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"company_id": str(result.inserted_id)}},
    )
    return doc
