"""Admin job management — metrics, listing, status updates."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import companies_collection, job_applications_collection
from .job_admin_format import coalesce_job_fields, job_detail, update_payload_to_set
from .job_company_link import company_snapshot_for_job, enrich_job_fields, job_company_keys_on_write
from .job_admin_merge import (
    delete_admin_job_records,
    fetch_all_admin_job_docs,
    persist_admin_job,
    resolve_admin_job,
)

router = APIRouter(tags=["Admin Job Management"])


class JobStatusUpdateBody(BaseModel):
    job_id: str = Field(..., min_length=1, max_length=120)
    status: str = Field(..., min_length=4, max_length=32)


class JobUpdateBody(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    work_mode: Optional[str] = None
    status: Optional[str] = None
    company_id: Optional[str] = None


def _relative_time(ts: Any) -> str:
    if not ts:
        return "—"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return ts[:16] if len(ts) > 16 else str(ts)
    if not isinstance(ts, datetime):
        return "—"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(delta.total_seconds())
    if sec < 3600:
        return f"{max(1, sec // 60)} min ago"
    if sec < 86400:
        return f"{sec // 3600} hours ago"
    return f"{sec // 86400} days ago"


def normalize_admin_status(doc: dict) -> str:
    raw = str(doc.get("status") or "").lower()
    if raw == "draft":
        return "pending"
    if doc.get("is_approved") is False or raw in ("pending", "submitted", "review"):
        return "pending"
    if raw in ("closed", "archived", "expired", "inactive"):
        return "expired"
    if raw in ("open", "active", "published") or doc.get("is_approved") is True:
        return "active"
    if raw:
        return "pending"
    return "pending"


def status_to_db_patch(status: str) -> dict:
    key = str(status or "").strip().lower()
    if key == "active":
        return {"status": "active", "is_approved": True, "visibility": "public"}
    if key in ("reject", "rejected"):
        return {"status": "pending", "is_approved": False}
    if key == "expired":
        return {"status": "expired", "is_approved": False}
    return {"status": "pending", "is_approved": False}


async def _job_with_applicants(doc: dict) -> dict:
    jid = str(doc.get("_id") or "")
    app_map = await _applicant_count_map([jid])
    return job_detail(
        doc,
        app_map.get(jid, 0),
        _relative_time(doc.get("created_at")),
        normalize_admin_status(doc),
    )


async def _find_job(job_id: str) -> Optional[dict]:
    return await resolve_admin_job(job_id)


async def _applicant_count_map(job_ids: List[str]) -> Dict[str, int]:
    if not job_ids:
        return {}
    counts: Dict[str, int] = {}
    async for row in job_applications_collection.aggregate(
        [{"$match": {"job_id": {"$in": job_ids}}}, {"$group": {"_id": "$job_id", "count": {"$sum": 1}}}]
    ):
        counts[str(row["_id"])] = int(row["count"])
    return counts


async def _job_row(doc: dict, applicants: int, company_cache: dict) -> dict:
    fields = await enrich_job_fields(doc, company_cache)
    company = fields["company"]
    imageurl = str(doc.get("company_imageurl") or doc.get("imageurl") or "").strip()
    jid = str(doc.get("_id") or "")
    admin_status = normalize_admin_status(doc)
    smin = int((doc.get("compensation_band") or {}).get("min") or doc.get("salary_min") or 0)
    smax = int((doc.get("compensation_band") or {}).get("max") or doc.get("salary_max") or 0)
    salary = doc.get("salary_range") or (f"${smin}k - ${smax}k" if smin and smax else "Competitive")
    return {
        "id": jid,
        "title": fields["title"],
        "company": company,
        "companyId": str(doc.get("company_id") or ""),
        "imageurl": imageurl,
        "category": fields["category"],
        "location": doc.get("location") or doc.get("work_mode") or "Remote",
        "salary": salary,
        "posted": _relative_time(doc.get("created_at")),
        "status": admin_status,
        "applicants": applicants,
        "logoText": (company[:1] or "J").upper(),
    }


@router.get("/jobs/metrics")
async def job_metrics():
    all_docs = await fetch_all_admin_job_docs()
    total = len(all_docs)
    active = pending = expired = 0
    for doc in all_docs:
        st = normalize_admin_status(doc)
        if st == "active":
            active += 1
        elif st == "expired":
            expired += 1
        else:
            pending += 1
    companies_count = await companies_collection.count_documents({})
    return {
        "status": "success",
        "metrics": {
            "total": total,
            "active": active,
            "pending": pending,
            "expired": expired,
            "companies": companies_count,
        },
    }


@router.get("/jobs")
async def list_jobs(
    q: str = Query("", max_length=120),
    status: str = Query("", max_length=20),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    needle = q.strip().lower()
    status_filter = status.strip().lower()
    rows: List[dict] = []
    for doc in await fetch_all_admin_job_docs():
        if status_filter and status_filter != "all" and normalize_admin_status(doc) != status_filter:
            continue
        if needle:
            fields = coalesce_job_fields(doc)
            blob = " ".join([fields["title"], fields["company"], fields["category"]]).lower()
            if needle not in blob:
                continue
        rows.append(doc)
    total = len(rows)
    start = (page - 1) * limit
    page_docs = rows[start : start + limit]
    ids = [str(d.get("_id") or "") for d in page_docs]
    app_map = await _applicant_count_map(ids)
    company_cache: dict = {}
    data = [
        await _job_row(d, app_map.get(str(d.get("_id") or ""), 0), company_cache) for d in page_docs
    ]
    return {"status": "success", "data": data, "total": total, "page": page, "limit": limit}


@router.patch("/jobs/status")
async def update_job_status(body: JobStatusUpdateBody):
    doc = await _find_job(body.job_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    patch = status_to_db_patch(body.status)
    patch["updated_at"] = datetime.utcnow().isoformat()
    await persist_admin_job(doc, patch)
    updated = await _find_job(body.job_id)
    app_map = await _applicant_count_map([str(updated.get("_id") or "")])
    return {
        "status": "success",
        "data": await _job_with_applicants(updated),
    }


@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    doc = await _find_job(job_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "success", "data": await _job_with_applicants(doc)}


@router.put("/jobs/{job_id}")
async def update_job(job_id: str, body: JobUpdateBody):
    doc = await _find_job(job_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    patch = update_payload_to_set(body.model_dump(exclude_unset=True))
    if body.status:
        patch.update(status_to_db_patch(body.status))
    cid = str(body.company_id or "").strip() if body.company_id else ""
    if cid:
        snap = await company_snapshot_for_job(cid)
        if snap:
            patch.update(job_company_keys_on_write(cid, snap))
    if patch:
        patch["updated_at"] = datetime.utcnow().isoformat()
        await persist_admin_job(doc, patch)
    updated = await _find_job(job_id)
    return {"status": "success", "data": await _job_with_applicants(updated)}


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    doc = await _find_job(job_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    await delete_admin_job_records(doc)
    return {"status": "success", "deleted": True, "job_id": job_id}
