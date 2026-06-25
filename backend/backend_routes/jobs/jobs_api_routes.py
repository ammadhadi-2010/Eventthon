"""Flat jobs marketplace API — search + apply with header auth."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, Query

from database import job_applications_collection
from .hub_apply import ApplyJobPayload, RegisterApplicationPayload, apply_to_job, register_job_application
from .hub_search import search_hub_jobs
from .hub_search_stats import build_search_stats
from .jobs_auth import resolve_jobs_marketplace_user

router = APIRouter(prefix="/jobs", tags=["Jobs Marketplace"])


@router.get("/search")
async def jobs_marketplace_search(
    q: str = Query("", max_length=120),
    category: str = Query("", max_length=80),
    experience_level: str = Query("", max_length=60),
    job_type: str = Query("", max_length=40),
    location: str = Query("", max_length=80),
    work_mode: str = Query("", max_length=40),
    salary_min: Optional[int] = Query(None, ge=0, le=500),
    salary_max: Optional[int] = Query(None, ge=0, le=500),
):
    data = await search_hub_jobs(
        q=q,
        category=category,
        experience_level=experience_level,
        job_type=job_type,
        location=location,
        work_mode=work_mode,
        salary_min=salary_min,
        salary_max=salary_max,
    )
    stats = await build_search_stats()
    return {"status": "success", "data": data, "stats": stats}


@router.post("/apply")
async def jobs_marketplace_apply(
    payload: RegisterApplicationPayload,
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
):
    uid, _user = await resolve_jobs_marketplace_user(
        x_user_id=x_user_id,
        x_user_email=x_user_email,
        x_user_mobile=x_user_mobile,
        body_user_id=payload.user_identifier,
    )
    apply_payload = RegisterApplicationPayload(
        user_identifier=uid,
        job_id=payload.job_id,
        timestamp=payload.timestamp,
        status=payload.status or "applied",
        job_snapshot=payload.job_snapshot,
    )
    card = await register_job_application(apply_payload)
    app_total = await job_applications_collection.count_documents(
        {"$or": [{"user_id": uid}, {"user_identifier": uid}]}
    )
    return {"status": "success", "data": card, "menuCounts": {"applications": app_total}}


@router.post("/apply/resume")
async def jobs_marketplace_apply_resume(
    payload: ApplyJobPayload,
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
):
    uid, _user = await resolve_jobs_marketplace_user(
        x_user_id=x_user_id,
        x_user_email=x_user_email,
        x_user_mobile=x_user_mobile,
        body_user_id=payload.user_id,
    )
    apply_payload = ApplyJobPayload(
        user_id=uid,
        job_id=payload.job_id,
        resume_url=payload.resume_url,
        job_snapshot=payload.job_snapshot,
    )
    card = await apply_to_job(apply_payload)
    return {"status": "success", "data": card}
