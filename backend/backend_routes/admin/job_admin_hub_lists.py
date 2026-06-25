"""Admin listings: job applications (with lookups) and job alerts."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import job_alerts_collection, job_applications_collection, user_collection
from .job_admin_merge import resolve_admin_job
from .job_company_link import enrich_job_fields

router = APIRouter(tags=["Admin Job Management"])

ADMIN_APP_STATUSES = frozenset({"shortlisted", "rejected"})


class ApplicationStatusBody(BaseModel):
    status: str = Field(..., min_length=4, max_length=32)


def _format_date(ts: Any) -> str:
    if not ts:
        return "—"
    if isinstance(ts, str):
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return dt.strftime("%b %d, %Y")
        except (TypeError, ValueError):
            return ts[:10] if len(ts) >= 10 else str(ts)
    if isinstance(ts, datetime):
        return ts.strftime("%b %d, %Y")
    return "—"


def _normalize_app_status(raw: str) -> str:
    key = str(raw or "applied").strip().lower().replace("_", "-")
    if key in ("shortlisted", "in-review", "inreview"):
        return "shortlisted"
    if key in ("rejected", "reject", "declined"):
        return "rejected"
    if key == "applied":
        return "applied"
    return key or "applied"


async def _find_user(identifier: str) -> Optional[dict]:
    raw = str(identifier or "").strip()
    if not raw:
        return None
    for query in ({"mobile": raw}, {"user_id": raw}, {"email": raw.lower()}):
        user = await user_collection.find_one(query)
        if user:
            return user
    return None


async def _applicant_name(uid: str, cache: Dict[str, str]) -> str:
    if not uid:
        return "Unknown Applicant"
    if uid in cache:
        return cache[uid]
    user = await _find_user(uid)
    if user:
        fn = (user.get("first_name") or "").strip()
        ln = (user.get("last_name") or "").strip()
        name = f"{fn} {ln}".strip()
        if not name:
            name = (user.get("full_name") or user.get("name") or user.get("email") or uid).strip()
    else:
        name = uid
    cache[uid] = name
    return name


async def _job_title_company(job_id: str, app_doc: dict, cache: Dict[str, Tuple[str, str]]) -> Tuple[str, str]:
    jid = str(job_id or "").strip()
    if jid and jid in cache:
        return cache[jid]
    title, company = app_doc.get("role") or "Role", app_doc.get("company") or "Company"
    if jid:
        job = await resolve_admin_job(jid)
        if job:
            fields = await enrich_job_fields(job, {})
            title, company = fields["title"], fields["company"]
    if jid:
        cache[jid] = (title, company)
    return title, company


def _resume_public_url(path: str) -> str:
    raw = str(path or "").strip()
    if not raw:
        return ""
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    return raw if raw.startswith("/") else f"/{raw}"


@router.get("/jobs/applications")
async def list_job_applications():
    name_cache: Dict[str, str] = {}
    job_cache: Dict[str, Tuple[str, str]] = {}
    rows: List[dict] = []
    async for doc in job_applications_collection.find({}).sort("created_at", -1):
        uid = str(doc.get("user_identifier") or doc.get("user_id") or "")
        jid = str(doc.get("job_id") or "")
        applicant = await _applicant_name(uid, name_cache)
        position, company = await _job_title_company(jid, doc, job_cache)
        status = _normalize_app_status(doc.get("status"))
        rows.append(
            {
                "id": str(doc.get("_id") or ""),
                "jobId": jid,
                "applicantName": applicant,
                "applicantId": uid,
                "position": position,
                "company": company,
                "appliedDate": doc.get("applied_on") or _format_date(doc.get("created_at")),
                "status": status,
                "resumeUrl": _resume_public_url(doc.get("resume_url") or ""),
            }
        )
    return {"status": "success", "data": rows, "total": len(rows)}


@router.patch("/jobs/applications/{application_id}")
async def patch_job_application(application_id: str, body: ApplicationStatusBody):
    key = str(body.status or "").strip().lower()
    if key not in ADMIN_APP_STATUSES:
        raise HTTPException(status_code=400, detail="Status must be shortlisted or rejected")
    oid = ObjectId(application_id) if ObjectId.is_valid(application_id) else None
    if not oid:
        raise HTTPException(status_code=404, detail="Application not found")
    res = await job_applications_collection.update_one(
        {"_id": oid},
        {"$set": {"status": key, "updated_at": datetime.utcnow().isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    doc = await job_applications_collection.find_one({"_id": oid})
    uid = str(doc.get("user_identifier") or doc.get("user_id") or "")
    jid = str(doc.get("job_id") or "")
    applicant = await _applicant_name(uid, {})
    position, company = await _job_title_company(jid, doc, {})
    return {
        "status": "success",
        "data": {
            "id": str(doc["_id"]),
            "jobId": jid,
            "applicantName": applicant,
            "applicantId": uid,
            "position": position,
            "company": company,
            "appliedDate": doc.get("applied_on") or _format_date(doc.get("created_at")),
            "status": _normalize_app_status(doc.get("status")),
            "resumeUrl": _resume_public_url(doc.get("resume_url") or ""),
        },
    }


@router.get("/jobs/alerts")
async def list_job_alerts():
    rows: List[dict] = []
    async for doc in job_alerts_collection.find({}).sort("created_at", -1):
        category = str(doc.get("job_category") or doc.get("category") or "General").strip()
        skills = [str(s).strip() for s in (doc.get("skills") or []) if str(s).strip()]
        keywords = [str(k).strip() for k in (doc.get("keywords") or []) if str(k).strip()]
        tokens = skills or keywords
        skill_part = ", ".join(tokens[:4]) if tokens else ""
        category_skill = f"{category} · {skill_part}" if skill_part else category
        rows.append(
            {
                "id": str(doc.get("_id") or ""),
                "userIdentifier": str(doc.get("user_id") or "—"),
                "categorySkill": category_skill,
                "locationConstraint": str(doc.get("work_mode") or doc.get("location") or "Any"),
                "createdAt": _format_date(doc.get("created_at")),
            }
        )
    return {"status": "success", "data": rows, "total": len(rows)}
