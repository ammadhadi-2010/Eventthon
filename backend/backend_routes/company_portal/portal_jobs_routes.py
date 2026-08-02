"""HTTP routes — company jobs + applications + saved candidates."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .portal_applications import (
    CompanyApplicationStatusPayload,
    CompanySavedCandidatePayload,
    list_company_applications,
    list_saved_candidates,
    save_candidate,
    unsave_candidate,
    update_company_application_status,
)
from .portal_jobs import (
    CompanyJobStatusPayload,
    CompanyJobUpsertPayload,
    get_company_job,
    list_company_jobs,
    set_company_job_status,
    upsert_company_job,
)

router = APIRouter(prefix="/company-portal", tags=["Company Portal Jobs"])


@router.get("/jobs")
async def company_jobs_list(
    user_id: str = Query(..., min_length=2, max_length=120),
    status: str = Query("all"),
    q: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    data = await list_company_jobs(user_id, status=status, q=q, skip=skip, limit=limit)
    return {"status": "success", "data": data}


@router.get("/jobs/{job_id}")
async def company_job_detail(job_id: str, user_id: str = Query(..., min_length=2, max_length=120)):
    job = await get_company_job(user_id, job_id)
    return {"status": "success", "data": job}


@router.post("/jobs")
async def company_job_create(payload: CompanyJobUpsertPayload):
    job = await upsert_company_job(payload, job_id=None)
    return {"status": "success", "data": job}


@router.put("/jobs/{job_id}")
async def company_job_update(job_id: str, payload: CompanyJobUpsertPayload):
    job = await upsert_company_job(payload, job_id=job_id)
    return {"status": "success", "data": job}


@router.patch("/jobs/{job_id}/status")
async def company_job_set_status(job_id: str, payload: CompanyJobStatusPayload):
    job = await set_company_job_status(payload.user_id, job_id, payload.status)
    return {"status": "success", "data": job}


@router.get("/applications")
async def company_applications_list(
    user_id: str = Query(..., min_length=2, max_length=120),
    status: str = Query("all"),
    job_id: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(80, ge=1, le=150),
):
    data = await list_company_applications(user_id, status=status, job_id=job_id, skip=skip, limit=limit)
    return {"status": "success", "data": data}


@router.patch("/applications/{app_id}/status")
async def company_application_set_status(app_id: str, payload: CompanyApplicationStatusPayload):
    data = await update_company_application_status(app_id, payload)
    return {"status": "success", "data": data}


@router.get("/saved-candidates")
async def company_saved_candidates(user_id: str = Query(..., min_length=2, max_length=120)):
    data = await list_saved_candidates(user_id)
    return {"status": "success", "data": data}


@router.post("/saved-candidates")
async def company_save_candidate(payload: CompanySavedCandidatePayload):
    data = await save_candidate(payload)
    return data


@router.delete("/saved-candidates/{candidate_user_id}")
async def company_unsave_candidate(
    candidate_user_id: str,
    user_id: str = Query(..., min_length=2, max_length=120),
):
    if len(candidate_user_id.strip()) < 2:
        raise HTTPException(status_code=400, detail="candidate_user_id required")
    data = await unsave_candidate(user_id, candidate_user_id)
    return data
