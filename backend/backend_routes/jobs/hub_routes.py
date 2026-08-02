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
from .hub_publish import publish_job_listing
from .hub_search import search_hub_jobs
from .hub_sidebar import compute_market_insights, user_application_feed
from backend_routes.company_portal.verification_gate import ensure_company_posting_unlocked
from .hub_shared import (
    CreateJobAlertPayload,
    CreateJobListingPayload,
    UpdateApplicationFlowPayload,
    UpdateJobAlertPayload,
    alert_to_card,
    application_to_card,
    application_flow_steps,
    normalize_status,
)

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
    from .hub_search_stats import build_search_stats

    uid = _uid(user_id)
    active_jobs = await jobs_collection.count_documents(public_listings_query())
    app_total = await job_applications_collection.count_documents(
        {"$or": [{"user_id": uid}, {"user_identifier": uid}]}
    )
    alerts_total = await job_alerts_collection.count_documents({"user_id": uid})
    saved_total = await saved_count(uid)
    stats = await build_search_stats()
    return {
        "status": "success",
        "stats": stats,
        "activeJobsCount": active_jobs,
        "menuCounts": {
            "applications": app_total,
            "saved": saved_total,
            "alerts": alerts_total,
        },
    }


@router.get("/platform-settings")
async def hub_platform_settings():
    """Public Jobs hub flags controlled from Admin Job / Opportunity Settings."""
    from backend_routes.admin.job_hub_settings import (
        get_job_hub_settings,
        get_opportunity_hub_settings,
        parse_opportunity_types,
    )

    jobs = await get_job_hub_settings()
    opportunities = await get_opportunity_hub_settings()
    return {
        "status": "success",
        "jobs": jobs,
        "opportunities": {
            **opportunities,
            "opportunityTypeList": parse_opportunity_types(opportunities.get("opportunityTypes") or ""),
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


@router.get("/alert-matches")
async def list_alert_matches(user_id: str = Query(..., min_length=2, max_length=120)):
    """Listings that matched this user's job/opportunity alerts (Apply / Join)."""
    from .hub_alert_match import list_alert_matches_for_user

    uid = _uid(user_id)
    data = await list_alert_matches_for_user(uid)
    return {"status": "success", "data": data}


@router.post("/alerts")
async def create_alert(payload: CreateJobAlertPayload):
    """Seeker alert only — does not publish a public job listing."""
    uid = _uid(payload.user_id)
    title = payload.job_title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Job title required")
    kind = str(payload.alert_kind or "job").strip().lower()
    if kind not in {"job", "opportunity"}:
        kind = "job"
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
        "alert_kind": kind,
        "logo_class": "grid" if kind == "opportunity" else "google",
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await job_alerts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"status": "success", "data": alert_to_card(doc)}


@router.post("/listings")
async def create_job_listing(payload: CreateJobListingPayload):
    """Post a company hiring job or a community opportunity (pending until approved)."""
    uid = _uid(payload.user_id)
    title = payload.job_title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Job title required")

    kind = str(payload.listing_kind or "opportunity").strip().lower()
    if kind not in {"company", "opportunity"}:
        raise HTTPException(status_code=400, detail="listing_kind must be company or opportunity")

    company_id = None
    if kind == "company":
        company = await ensure_company_posting_unlocked(
            uid, feature="jobs", require_company=True
        )
        company_id = str(company.get("_id") or company.get("id") or "").strip()
        if not company_id:
            raise HTTPException(status_code=403, detail="Company account required to post hiring jobs.")
    else:
        # Opportunities are for members; pending company owners stay unblocked.
        if len(uid) < 2:
            raise HTTPException(status_code=400, detail="Sign in required.")

    job_id = await publish_job_listing(
        payload,
        listing_kind=kind,
        company_id=company_id,
        posted_by=uid,
    )
    doc = await jobs_collection.find_one({"_id": job_id})
    from .hub_listings import job_doc_to_listing_card

    return {
        "status": "success",
        "data": job_doc_to_listing_card(doc) if doc else {"id": job_id, "jobId": job_id},
        "message": (
            "Job submitted for review."
            if kind == "company"
            else "Opportunity submitted for review."
        ),
    }


@router.get("/search")
async def hub_search(
    q: str = Query("", max_length=120),
    category: str = Query("", max_length=80),
    experience_level: str = Query("", max_length=60),
    job_type: str = Query("", max_length=48),
    listing_kind: str = Query("", max_length=32),
    company: str = Query("", max_length=120),
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
        listing_kind=listing_kind,
        company=company,
        location=location,
        work_mode=work_mode,
        salary_min=salary_min,
        salary_max=salary_max,
    )
    return {"status": "success", "data": data}


@router.get("/top-companies")
async def hub_top_companies(limit: int = Query(24, ge=1, le=40)):
    from .hub_top_companies import list_top_companies

    data = await list_top_companies(limit=limit)
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
