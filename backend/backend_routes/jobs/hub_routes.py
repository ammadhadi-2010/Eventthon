"""Authenticated Jobs hub — alerts, applications, metrics."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from database import job_alerts_collection, job_applications_collection, jobs_collection
from .hub_apply import (
    ApplyJobPayload,
    RegisterApplicationPayload,
    apply_to_job,
    register_job_application,
    save_resume_file,
)
from .hub_recommended import recommended_jobs
from .hub_saved import (
    SaveJobPayload,
    SavedJobTogglePayload,
    list_saved_jobs,
    save_job,
    saved_count,
    toggle_saved_job,
    unsave_job,
)
from .hub_listings import public_listings_query
from .hub_publish import publish_job_from_alert
from .hub_search import search_hub_jobs
from .hub_sidebar import compute_market_insights, user_application_feed
from backend_routes.company_portal.verification_gate import ensure_company_posting_unlocked
from .hub_shared import (
    CreateJobAlertPayload,
    UpdateApplicationFlowPayload,
    UpdateJobAlertPayload,
    alert_to_card,
    application_to_card,
    application_flow_steps,
    normalize_status,
)
from backend_routes.public.public_marketplace_defaults import JOB_BOARD_STATS

router = APIRouter(prefix="/jobs/hub", tags=["Jobs Hub"])


def _uid(user_id: str) -> str:
    return str(user_id or "").strip()


@router.get("/sidebar-analytics")
async def hub_sidebar_analytics(user_id: str = Query("", max_length=120)):
    """Market insights (public listings) + application activity for signed-in user."""
    market = await compute_market_insights()
    uid = _uid(user_id)
    activity = await user_application_feed(uid) if uid else []
    return {"status": "success", "market": market, "activity": activity}


@router.get("/metrics")
async def hub_metrics(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = _uid(user_id)
    active_jobs = await jobs_collection.count_documents(public_listings_query())
    app_total = await job_applications_collection.count_documents(
        {"$or": [{"user_id": uid}, {"user_identifier": uid}]}
    )
    alerts_total = await job_alerts_collection.count_documents({"user_id": uid})
    saved_total = await saved_count(uid)
    return {
        "status": "success",
        "stats": JOB_BOARD_STATS,
        "activeJobsCount": active_jobs,
        "menuCounts": {
            "applications": app_total,
            "saved": saved_total,
            "alerts": alerts_total,
        },
    }


@router.get("/applications")
async def list_applications(
    user_id: str = Query(..., min_length=2, max_length=120),
    status: Optional[str] = Query(None),
):
    uid = _uid(user_id)
    base = {"$or": [{"user_id": uid}, {"user_identifier": uid}]}
    if status and status != "all":
        query = {"$and": [base, {"status": normalize_status(status)}]}
    else:
        query = base
    rows = []
    async for doc in job_applications_collection.find(query).sort("created_at", -1):
        rows.append(application_to_card(doc))
    return {"status": "success", "data": rows}


@router.patch("/applications/{application_id}/flow")
async def update_application_flow(application_id: str, payload: UpdateApplicationFlowPayload):
    status = normalize_status(payload.status)
    oid = ObjectId(application_id) if ObjectId.is_valid(application_id) else None
    if not oid:
        raise HTTPException(status_code=404, detail="Application not found")
    res = await job_applications_collection.update_one(
        {"_id": oid},
        {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    doc = await job_applications_collection.find_one({"_id": oid})
    return {
        "status": "success",
        "data": {
            **application_to_card(doc),
            "flowSteps": application_flow_steps(status),
        },
    }


@router.get("/alerts")
async def list_alerts(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = _uid(user_id)
    rows = []
    async for doc in job_alerts_collection.find({"user_id": uid}).sort("created_at", -1):
        rows.append(alert_to_card(doc))
    return {"status": "success", "data": rows}


@router.post("/alerts")
async def create_alert(payload: CreateJobAlertPayload):
    uid = _uid(payload.user_id)
    await ensure_company_posting_unlocked(uid, feature="jobs")
    title = payload.job_title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Job title required")
    doc = {
        "user_id": uid,
        "title": title,
        "description": (payload.job_description or "").strip() or None,
        "employment_type": payload.employment_type,
        "experience_level": payload.experience_level,
        "career_level": payload.career_level,
        "job_category": payload.job_category,
        "salary_min": int(payload.salary_min or 60),
        "salary_max": int(payload.salary_max or 100),
        "work_mode": payload.work_mode,
        "skills": payload.skills or [],
        "keywords": payload.keywords or [],
        "email_enabled": payload.email_notifications,
        "notification_email": payload.notification_email,
        "logo_class": "google",
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await job_alerts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    alert_id = str(result.inserted_id)
    await publish_job_from_alert(payload, alert_id)
    return {"status": "success", "data": alert_to_card(doc)}


@router.get("/search")
async def hub_search(
    q: str = Query("", max_length=120),
    category: str = Query("", max_length=80),
    experience_level: str = Query("", max_length=60),
    job_type: str = Query("", max_length=40),
    location: str = Query("", max_length=80),
    work_mode: str = Query("", max_length=40),
    salary_min: Optional[int] = Query(None, ge=0, le=500),
    salary_max: Optional[int] = Query(None, ge=0, le=500),
):
    """Public job browse — no user ownership filter on listings."""
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
    return {"status": "success", "data": data}


@router.get("/recommended")
async def hub_recommended(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = _uid(user_id)
    data = await recommended_jobs(uid)
    return {"status": "success", "data": data}


@router.post("/applications")
async def create_application(payload: RegisterApplicationPayload):
    uid = _uid(payload.user_identifier)
    if not uid:
        raise HTTPException(status_code=400, detail="User identifier required")
    card = await register_job_application(payload)
    app_total = await job_applications_collection.count_documents(
        {"$or": [{"user_id": uid}, {"user_identifier": uid}]}
    )
    return {"status": "success", "data": card, "menuCounts": {"applications": app_total}}


@router.post("/applications/resume")
async def upload_resume(
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    uid = _uid(user_id)
    if not uid:
        raise HTTPException(status_code=400, detail="User identifier required")
    url = await save_resume_file(file, uid)
    return {"status": "success", "resume_url": url}


@router.post("/applications/apply")
async def apply_for_job(payload: ApplyJobPayload):
    uid = _uid(payload.user_id)
    if not uid:
        raise HTTPException(status_code=400, detail="User identifier required")
    card = await apply_to_job(payload)
    return {"status": "success", "data": card}


@router.get("/saved")
async def list_saved(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = _uid(user_id)
    rows = await list_saved_jobs(uid)
    return {"status": "success", "data": rows}


@router.post("/saved")
async def create_saved_job(payload: SaveJobPayload):
    uid = _uid(payload.user_identifier)
    if not uid:
        raise HTTPException(status_code=400, detail="User identifier required")
    result = await save_job(payload)
    return {"status": "success", **result}


@router.delete("/saved/{job_id}")
async def remove_saved_job(
    job_id: str,
    user_identifier: str = Query(..., min_length=2, max_length=120),
):
    uid = _uid(user_identifier)
    if not uid:
        raise HTTPException(status_code=400, detail="User identifier required")
    result = await unsave_job(uid, job_id)
    return {"status": "success", **result}


@router.post("/saved/toggle")
async def toggle_saved(payload: SavedJobTogglePayload):
    uid = _uid(payload.user_id)
    if not uid:
        raise HTTPException(status_code=400, detail="User identifier required")
    result = await toggle_saved_job(payload)
    return {"status": "success", **result}


@router.patch("/alerts/{alert_id}")
async def update_alert(alert_id: str, payload: UpdateJobAlertPayload):
    oid = ObjectId(alert_id) if ObjectId.is_valid(alert_id) else None
    if not oid:
        raise HTTPException(status_code=404, detail="Alert not found")
    updates = {}
    if payload.email_enabled is not None:
        updates["email_enabled"] = payload.email_enabled
    if not updates:
        doc = await job_alerts_collection.find_one({"_id": oid})
        return {"status": "success", "data": alert_to_card(doc)}
    await job_alerts_collection.update_one({"_id": oid}, {"$set": updates})
    doc = await job_alerts_collection.find_one({"_id": oid})
    return {"status": "success", "data": alert_to_card(doc)}
