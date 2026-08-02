"""Company portal — employer applications inbox + saved candidates."""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from bson import ObjectId
from fastapi import HTTPException
from pydantic import BaseModel, Field

from database import companies_collection, job_applications_collection, jobs_collection
from backend_routes.jobs.hub_shared import normalize_status

from .portal_jobs import assert_company_job, resolve_employer_company
from .portal_resolve import find_user
from .portal_shared import BUCKET_LABELS, PORTAL_BUCKETS, portal_bucket, relative_time

BUCKET_TO_HUB_STATUS = {
    "pending": "applied",
    "reviewing": "in-review",
    "interview": "interview",
    "shortlisted": "shortlisted",
    "rejected": "rejected",
    "hired": "hired",
    # Talent pipeline stage keys (dashboard drag-drop)
    "applied": "applied",
    "screening": "in-review",
    "technical": "technical",
    "final": "final",
    "offer": "offered",
}

# Stored as-is so pipeline_stage() can read fine-grained company stages
PIPELINE_STORE_STATUS = {
    "applied",
    "in-review",
    "interview",
    "technical",
    "final",
    "offered",
    "hired",
    "rejected",
    "shortlisted",
}


class CompanyApplicationStatusPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    status: str = Field(..., min_length=3, max_length=32)


class CompanySavedCandidatePayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    candidate_user_id: str = Field(..., min_length=2, max_length=120)
    role: Optional[str] = Field(default="", max_length=120)
    note: Optional[str] = Field(default="", max_length=400)
    skills: Optional[List[str]] = None
    match: Optional[int] = Field(default=0, ge=0, le=100)


def _applicant_name(user: Optional[dict], fallback: str) -> str:
    if not user:
        return fallback or "Applicant"
    fn = str(user.get("first_name") or "").strip()
    ln = str(user.get("last_name") or "").strip()
    full = f"{fn} {ln}".strip()
    if full:
        return full
    return str(user.get("email") or user.get("mobile") or fallback or "Applicant")


def _applicant_image(user: Optional[dict]) -> str:
    if not user:
        return ""
    for key in ("profile_image_url", "avatar", "imageurl", "photo"):
        val = str(user.get(key) or "").strip()
        if val:
            return val
    return ""


async def list_company_applications(
    user_id: str,
    *,
    status: str = "all",
    job_id: str = "",
    skip: int = 0,
    limit: int = 80,
) -> dict:
    _, cid = await resolve_employer_company(user_id)
    job_ids: List[str] = []
    title_map: Dict[str, str] = {}
    async for job in jobs_collection.find({"company_id": cid}, {"title": 1}):
        jid = str(job.get("_id") or "")
        if not jid:
            continue
        job_ids.append(jid)
        title_map[jid] = str(job.get("title") or "Role")

    empty_counts = {**{b: 0 for b in PORTAL_BUCKETS}, "all": 0, "interview": 0}
    if not job_ids:
        return {"applications": [], "total": 0, "counts": empty_counts}

    query: dict = {"job_id": {"$in": job_ids}}
    if job_id and job_id in title_map:
        query["job_id"] = job_id

    docs: List[dict] = []
    async for doc in job_applications_collection.find(query).sort("created_at", -1):
        docs.append(doc)

    status_key = (status or "all").strip().lower()
    enriched = []
    counts = {**empty_counts}

    for doc in docs:
        uid = str(doc.get("user_identifier") or doc.get("user_id") or "").strip()
        user = await find_user(uid) if uid else None
        hub = normalize_status(doc.get("status"))
        bucket = "interview" if hub == "interview" else portal_bucket(doc.get("status"))
        counts["all"] += 1
        counts[bucket] = counts.get(bucket, 0) + 1
        if status_key != "all" and bucket != status_key:
            continue
        jid = str(doc.get("job_id") or "")
        enriched.append(
            {
                "id": str(doc.get("_id") or ""),
                "name": _applicant_name(user, uid),
                "role": str(doc.get("role") or doc.get("headline") or "Candidate"),
                "appliedFor": title_map.get(jid, "Role"),
                "jobId": jid,
                "status": "Interview" if bucket == "interview" else BUCKET_LABELS.get(bucket, bucket.title()),
                "statusKey": bucket,
                "hubStatus": hub,
                "time": relative_time(doc.get("created_at")),
                "imageurl": _applicant_image(user),
                "candidateUserId": uid,
                "resumeUrl": str(doc.get("resume_url") or doc.get("resumeUrl") or ""),
            }
        )

    return {"applications": enriched[skip : skip + limit], "total": len(enriched), "counts": counts}


async def update_company_application_status(app_id: str, payload: CompanyApplicationStatusPayload) -> dict:
    _, cid = await resolve_employer_company(payload.user_id)
    if not ObjectId.is_valid(app_id):
        raise HTTPException(status_code=400, detail="Invalid application id")
    doc = await job_applications_collection.find_one({"_id": ObjectId(app_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    await assert_company_job(cid, str(doc.get("job_id") or ""))

    raw = str(payload.status or "").strip().lower().replace("_", "-")
    store_status = BUCKET_TO_HUB_STATUS.get(raw) or (
        raw if raw in PIPELINE_STORE_STATUS else normalize_status(raw)
    )
    await job_applications_collection.update_one(
        {"_id": ObjectId(app_id)},
        {
            "$set": {
                "status": store_status,
                "pipeline_stage": raw if raw in BUCKET_TO_HUB_STATUS else store_status,
                "updated_at": datetime.utcnow().isoformat(),
                "recruiter_updated": True,
            }
        },
    )
    updated = await job_applications_collection.find_one({"_id": ObjectId(app_id)})
    stored = str((updated or {}).get("status") or store_status)
    hub = stored if stored in PIPELINE_STORE_STATUS else normalize_status(stored)
    bucket = "interview" if hub == "interview" else portal_bucket(hub)
    return {
        "id": app_id,
        "status": "Interview" if bucket == "interview" else BUCKET_LABELS.get(bucket, bucket.title()),
        "statusKey": bucket,
        "hubStatus": hub,
        "pipelineStage": (updated or {}).get("pipeline_stage") or raw,
    }


async def list_saved_candidates(user_id: str) -> dict:
    company, cid = await resolve_employer_company(user_id)
    saved = list(company.get("saved_candidates") or [])
    rows = []
    for item in saved:
        if not isinstance(item, dict):
            continue
        uid = str(item.get("candidate_user_id") or item.get("user_id") or "").strip()
        user = await find_user(uid) if uid else None
        rows.append(
            {
                "id": str(item.get("id") or uid),
                "name": _applicant_name(user, uid),
                "role": str(item.get("role") or "Candidate"),
                "skills": ", ".join(item.get("skills") or [])
                if isinstance(item.get("skills"), list)
                else str(item.get("skills") or ""),
                "note": str(item.get("note") or ""),
                "match": int(item.get("match") or 0),
                "saved": relative_time(item.get("saved_at")),
                "imageurl": _applicant_image(user),
                "candidateUserId": uid,
            }
        )
    return {"candidates": rows, "total": len(rows), "companyId": cid}


async def save_candidate(payload: CompanySavedCandidatePayload) -> dict:
    company, cid = await resolve_employer_company(payload.user_id)
    uid = payload.candidate_user_id.strip()
    saved = [x for x in (company.get("saved_candidates") or []) if isinstance(x, dict)]
    saved = [x for x in saved if str(x.get("candidate_user_id") or "").strip().lower() != uid.lower()]
    entry = {
        "id": f"saved-{uid}",
        "candidate_user_id": uid,
        "role": str(payload.role or "Candidate").strip(),
        "note": str(payload.note or "").strip(),
        "skills": list(payload.skills or [])[:12],
        "match": int(payload.match or 0),
        "saved_at": datetime.utcnow().isoformat(),
    }
    saved.insert(0, entry)
    await companies_collection.update_one(
        {"_id": company.get("_id")},
        {"$set": {"saved_candidates": saved[:100]}},
    )
    return {"status": "success", "candidate": entry, "companyId": cid}


async def unsave_candidate(user_id: str, candidate_user_id: str) -> dict:
    company, cid = await resolve_employer_company(user_id)
    uid = candidate_user_id.strip().lower()
    saved = [
        x
        for x in (company.get("saved_candidates") or [])
        if isinstance(x, dict) and str(x.get("candidate_user_id") or "").strip().lower() != uid
    ]
    await companies_collection.update_one({"_id": company.get("_id")}, {"$set": {"saved_candidates": saved}})
    return {"status": "success", "companyId": cid, "total": len(saved)}
