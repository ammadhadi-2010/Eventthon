"""Company portal — employer jobs list / drafts / status."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from pydantic import BaseModel, Field

from database import job_applications_collection, jobs_collection
from backend_routes.admin.job_company_link import company_snapshot_for_job, job_company_keys_on_write
from backend_routes.jobs.hub_listings import _parse_band
from backend_routes.jobs.hub_shared import CreateJobListingPayload

from .portal_resolve import ensure_company_for_user, find_user
from .portal_shared import relative_time
from .verification_gate import ensure_company_posting_unlocked


class CompanyJobUpsertPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    job_title: str = Field(..., min_length=1, max_length=140)
    job_description: Optional[str] = None
    employment_type: Optional[str] = "Full-time"
    experience_level: Optional[str] = "1-3 Years"
    career_level: Optional[str] = "Mid Level"
    job_category: Optional[str] = "Software Development"
    salary_min: Optional[int] = 60
    salary_max: Optional[int] = 100
    work_mode: Optional[str] = "Remote"
    skills: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    as_draft: bool = True


class CompanyJobStatusPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    status: str = Field(..., min_length=3, max_length=32)


def _job_lifecycle(doc: dict) -> str:
    status = str(doc.get("status") or "").strip().lower()
    if status in {"draft"} or doc.get("is_draft") is True:
        return "draft"
    if status in {"closed", "archived", "inactive"}:
        return "closed"
    if bool(doc.get("is_approved")) and status in {"active", "open", "approved", "live", "published"}:
        return "active"
    if bool(doc.get("is_approved")):
        return "active"
    if status in {"pending", "review", "under_review"}:
        return "pending"
    return "pending"


def _draft_progress(doc: dict) -> int:
    score = 0
    if str(doc.get("title") or "").strip():
        score += 25
    if str(doc.get("description") or "").strip():
        score += 30
    if doc.get("skills_tags") or doc.get("keywords"):
        score += 20
    if doc.get("employment_type"):
        score += 10
    if doc.get("work_mode") or doc.get("location"):
        score += 10
    if doc.get("salary_range") or doc.get("compensation_band"):
        score += 5
    return min(100, score)


def _draft_status_label(progress: int) -> str:
    if progress >= 80:
        return "Almost ready"
    if progress >= 50:
        return "In progress"
    if progress >= 30:
        return "Needs review"
    return "Just started"


async def _app_counts(job_ids: List[str]) -> Dict[str, int]:
    if not job_ids:
        return {}
    out: Dict[str, int] = {}
    pipeline = [
        {"$match": {"job_id": {"$in": job_ids}}},
        {"$group": {"_id": "$job_id", "count": {"$sum": 1}}},
    ]
    async for row in job_applications_collection.aggregate(pipeline):
        out[str(row["_id"])] = int(row["count"])
    return out


def serialize_company_job(doc: dict, applicants: int = 0) -> dict:
    jid = str(doc.get("_id") or "")
    smin, smax = _parse_band(doc)
    lifecycle = _job_lifecycle(doc)
    progress = _draft_progress(doc)
    tags = [str(doc.get("employment_type") or "Full-time")]
    if doc.get("work_mode"):
        tags.append(str(doc["work_mode"]))
    return {
        "id": jid,
        "title": doc.get("title") or "Role",
        "tags": tags[:3],
        "employmentType": str(doc.get("employment_type") or "Full-time"),
        "experienceLevel": str(doc.get("experience_level") or ""),
        "category": str(doc.get("category") or ""),
        "location": str(doc.get("location") or doc.get("work_mode") or "Remote"),
        "workMode": str(doc.get("work_mode") or ""),
        "salaryRange": doc.get("salary_range") or f"${int(smin)}k - ${int(smax)}k",
        "description": str(doc.get("description") or ""),
        "summary": str(doc.get("summary") or ""),
        "skills": list(doc.get("skills_tags") or doc.get("keywords") or [])[:12],
        "applicants": applicants,
        "posted": relative_time(doc.get("created_at")),
        "updated": relative_time(doc.get("updated_at") or doc.get("created_at")),
        "status": lifecycle,
        "statusLabel": {
            "draft": _draft_status_label(progress),
            "pending": "Pending review",
            "active": "Live",
            "closed": "Closed",
        }.get(lifecycle, lifecycle.title()),
        "progress": progress,
        "isApproved": bool(doc.get("is_approved")),
        "listingKind": str(doc.get("listing_kind") or "company"),
        "createdAt": str(doc.get("created_at") or ""),
        "updatedAt": str(doc.get("updated_at") or ""),
    }


async def resolve_employer_company(user_id: str) -> Tuple[dict, str]:
    uid = str(user_id or "").strip()
    if not await find_user(uid):
        raise HTTPException(status_code=404, detail="User account not found. Sign in again.")
    company = await ensure_company_for_user(uid)
    if not company:
        raise HTTPException(status_code=404, detail="Company workspace not found.")
    return company, str(company.get("_id") or "")


async def assert_company_job(company_id: str, job_id: str) -> dict:
    doc = await jobs_collection.find_one({"_id": job_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found.")
    if str(doc.get("company_id") or "") != str(company_id):
        raise HTTPException(status_code=403, detail="This job does not belong to your company.")
    return doc


async def list_company_jobs(
    user_id: str,
    *,
    status: str = "all",
    q: str = "",
    skip: int = 0,
    limit: int = 50,
) -> dict:
    _, cid = await resolve_employer_company(user_id)
    cursor = jobs_collection.find({"company_id": cid}).sort("updated_at", -1)
    rows: List[dict] = []
    async for doc in cursor:
        rows.append(doc)

    status_key = (status or "all").strip().lower()
    query = (q or "").strip().lower()
    filtered = []
    for doc in rows:
        life = _job_lifecycle(doc)
        if status_key != "all" and life != status_key:
            continue
        if query:
            hay = f"{doc.get('title') or ''} {doc.get('location') or ''} {doc.get('employment_type') or ''}".lower()
            if query not in hay:
                continue
        filtered.append(doc)

    page = filtered[skip : skip + limit]
    ids = [str(d.get("_id") or "") for d in page]
    counts = await _app_counts(ids)
    jobs = [serialize_company_job(d, counts.get(str(d.get("_id") or ""), 0)) for d in page]
    tallies = {"all": len(filtered), "draft": 0, "pending": 0, "active": 0, "closed": 0}
    for doc in filtered:
        tallies[_job_lifecycle(doc)] = tallies.get(_job_lifecycle(doc), 0) + 1
    return {"jobs": jobs, "total": len(filtered), "counts": tallies}


async def get_company_job(user_id: str, job_id: str) -> dict:
    _, cid = await resolve_employer_company(user_id)
    doc = await assert_company_job(cid, job_id)
    counts = await _app_counts([job_id])
    return serialize_company_job(doc, counts.get(job_id, 0))


def _listing_payload_from_upsert(payload: CompanyJobUpsertPayload) -> CreateJobListingPayload:
    return CreateJobListingPayload(
        user_id=payload.user_id,
        job_title=payload.job_title,
        job_description=payload.job_description,
        employment_type=payload.employment_type,
        experience_level=payload.experience_level,
        career_level=payload.career_level,
        job_category=payload.job_category,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        work_mode=payload.work_mode,
        skills=payload.skills,
        keywords=payload.keywords,
        listing_kind="company",
        company_id=None,
    )


async def upsert_company_job(payload: CompanyJobUpsertPayload, job_id: Optional[str] = None) -> dict:
    company = await ensure_company_posting_unlocked(payload.user_id, "post jobs", require_company=True)
    cid = str(company.get("_id") or "")
    now = datetime.utcnow().isoformat()
    listing = _listing_payload_from_upsert(payload)
    title = listing.job_title.strip()
    smin = int(listing.salary_min or 60)
    smax = int(listing.salary_max or 100)
    work_mode = (listing.work_mode or "Remote").strip()
    as_draft = bool(payload.as_draft)

    base: Dict[str, Any] = {
        "title": title,
        "category": (listing.job_category or "General").strip(),
        "summary": ((listing.job_description or "").strip()[:240] or title),
        "description": (listing.job_description or "").strip(),
        "salary_range": f"${smin}k - ${smax}k",
        "compensation_band": {"min": smin, "max": smax},
        "employment_type": listing.employment_type or "Full-time",
        "experience_level": listing.experience_level or "Any",
        "work_mode": work_mode,
        "remote": work_mode.lower() == "remote",
        "location": work_mode,
        "listing_kind": "company",
        "skills_tags": list(listing.skills or [])[:12],
        "keywords": list(listing.keywords or [])[:12],
        "posted_by": str(payload.user_id or "").strip(),
        "updated_at": now,
        "is_draft": as_draft,
        "hub_published": not as_draft,
    }
    if as_draft:
        base.update({"status": "draft", "is_approved": False, "visibility": "private"})
    else:
        base.update({"status": "pending", "is_approved": False, "visibility": "public"})

    snap = await company_snapshot_for_job(cid)
    if snap:
        base.update(job_company_keys_on_write(cid, snap))
    else:
        base["company_id"] = cid

    if job_id:
        existing = await assert_company_job(cid, job_id)
        life = _job_lifecycle(existing)
        if life == "closed":
            raise HTTPException(status_code=400, detail="Closed jobs cannot be edited. Reopen first.")
        # Keep approval if already live and not switching to draft
        if not as_draft and bool(existing.get("is_approved")) and life == "active":
            base["status"] = str(existing.get("status") or "active")
            base["is_approved"] = True
            base["visibility"] = "public"
            base["hub_published"] = True
            base["is_draft"] = False
        await jobs_collection.update_one({"_id": job_id}, {"$set": base})
        doc = await jobs_collection.find_one({"_id": job_id})
    else:
        new_id = f"job-company-{uuid.uuid4().hex[:12]}"
        base.update({"_id": new_id, "created_at": now, "posted_ago": "Just now"})
        await jobs_collection.insert_one(base)
        doc = await jobs_collection.find_one({"_id": new_id})

    return serialize_company_job(doc or base, 0)


async def set_company_job_status(user_id: str, job_id: str, status: str) -> dict:
    _, cid = await resolve_employer_company(user_id)
    doc = await assert_company_job(cid, job_id)
    key = str(status or "").strip().lower()
    now = datetime.utcnow().isoformat()
    patch: Dict[str, Any] = {"updated_at": now}

    if key in {"close", "closed"}:
        patch.update({"status": "closed", "is_draft": False, "hub_published": False})
    elif key in {"reopen", "open", "active"}:
        if bool(doc.get("is_approved")):
            patch.update({"status": "active", "is_draft": False, "hub_published": True, "visibility": "public"})
        else:
            patch.update({"status": "pending", "is_draft": False, "hub_published": True, "visibility": "public"})
    elif key in {"submit", "pending", "publish"}:
        await ensure_company_posting_unlocked(user_id, "post jobs", require_company=True)
        patch.update({
            "status": "pending",
            "is_draft": False,
            "is_approved": False,
            "hub_published": True,
            "visibility": "public",
        })
    elif key in {"draft"}:
        patch.update({"status": "draft", "is_draft": True, "hub_published": False, "visibility": "private"})
    elif key in {"archive", "archived"}:
        patch.update({"status": "archived", "is_draft": False, "hub_published": False})
    else:
        raise HTTPException(status_code=400, detail="status must be close, reopen, submit, draft, or archive")

    await jobs_collection.update_one({"_id": job_id}, {"$set": patch})
    updated = await jobs_collection.find_one({"_id": job_id})
    counts = await _app_counts([job_id])
    return serialize_company_job(updated or doc, counts.get(job_id, 0))
