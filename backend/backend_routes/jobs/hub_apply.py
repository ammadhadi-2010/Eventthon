"""Job application + resume upload for the Jobs hub."""
from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field

from database import job_applications_collection
from backend_routes.alerts.alert_factory import push_alert
from backend_routes.company_portal.employer_notify import notify_employer_on_application
from .hub_listings import find_job_doc, job_doc_to_listing_card
from .hub_shared import application_flow_steps, application_to_card, normalize_status

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RESUME_DIR = os.path.join(BASE_DIR, "static", "uploads", "jobs", "resumes")
os.makedirs(RESUME_DIR, exist_ok=True)

USER_FIELD = "user_identifier"


async def _notify_applicant_submitted(uid: str, role: str, company: str) -> None:
    await push_alert(
        recipient_identifier=uid,
        category="jobs",
        title="Application submitted",
        message=f"Your application for {role} at {company} was received.",
        actor_name="EventThon Jobs",
        action_label="View applications",
        action_url="/jobs",
        priority="medium",
        audience="member",
    )


class ApplyJobPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field(..., min_length=1, max_length=120)
    resume_url: str = Field(..., min_length=4, max_length=500)
    job_snapshot: Optional[Dict[str, Any]] = None


class RegisterApplicationPayload(BaseModel):
    user_identifier: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field(..., min_length=1, max_length=120)
    timestamp: Optional[str] = None
    status: str = "applied"
    job_snapshot: Optional[Dict[str, Any]] = None


def _uid(raw: str) -> str:
    return str(raw or "").strip()


def _format_applied_on(ts: str) -> str:
    try:
        dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y")
    except (TypeError, ValueError):
        return datetime.utcnow().strftime("%b %d, %Y")


async def save_resume_file(file: UploadFile, user_id: str) -> str:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Resume file required")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".pdf", ".doc", ".docx"}:
        raise HTTPException(status_code=400, detail="Resume must be PDF or Word document")
    safe_uid = "".join(c for c in user_id if c.isalnum())[:24] or "user"
    name = f"{safe_uid}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(RESUME_DIR, name)
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume file too large (max 8MB)")
    with open(path, "wb") as handle:
        handle.write(content)
    return f"/static/uploads/jobs/resumes/{name}"


async def _build_application_doc(
    uid: str,
    job_id: str,
    status: str,
    applied_at: str,
    resume_url: str,
    snap: Optional[Dict[str, Any]],
) -> dict:
    job_doc = await find_job_doc(job_id)
    if job_doc:
        card = job_doc_to_listing_card(job_doc)
        role = card["role"]
        company = card["company"]
        logo_text = card["logoText"]
        logo_class = card["logoClass"]
    elif snap:
        role = snap.get("role") or "Role"
        company = snap.get("company") or "Company"
        logo_text = snap.get("logoText") or "J"
        logo_class = snap.get("logoClass") or "google"
    else:
        role, company, logo_text, logo_class = "Role", "Company", "J", "google"

    applied_label = _format_applied_on(applied_at)
    return {
        USER_FIELD: uid,
        "user_id": uid,
        "job_id": job_id,
        "resume_url": resume_url,
        "applied_date": applied_at,
        "applied_on": applied_label,
        "status": normalize_status(status),
        "role": role,
        "company": company,
        "logo_text": logo_text,
        "logo_class": logo_class,
        "created_at": applied_at,
    }


async def register_job_application(payload: RegisterApplicationPayload) -> dict:
    uid = _uid(payload.user_identifier)
    job_id = str(payload.job_id).strip()
    existing = await job_applications_collection.find_one({USER_FIELD: uid, "job_id": job_id})
    if existing:
        raise HTTPException(status_code=409, detail="You already applied to this job")

    applied_at = str(payload.timestamp or datetime.utcnow().isoformat())
    snap = payload.job_snapshot if isinstance(payload.job_snapshot, dict) else None
    doc = await _build_application_doc(
        uid, job_id, payload.status or "applied", applied_at, "", snap
    )
    result = await job_applications_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    await notify_employer_on_application(job_id, uid)
    await _notify_applicant_submitted(uid, doc.get("role", "Role"), doc.get("company", "Company"))
    card = application_to_card(doc)
    card["jobId"] = job_id
    card["flowSteps"] = application_flow_steps(doc["status"])
    return card


async def apply_to_job(payload: ApplyJobPayload) -> dict:
    uid = _uid(payload.user_id)
    job_id = str(payload.job_id).strip()
    existing = await job_applications_collection.find_one({USER_FIELD: uid, "job_id": job_id})
    if existing:
        raise HTTPException(status_code=409, detail="You already applied to this job")

    now = datetime.utcnow().isoformat()
    snap = payload.job_snapshot if isinstance(payload.job_snapshot, dict) else None
    doc = await _build_application_doc(uid, job_id, "applied", now, payload.resume_url.strip(), snap)
    result = await job_applications_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    await notify_employer_on_application(job_id, uid)
    await _notify_applicant_submitted(uid, doc.get("role", "Role"), doc.get("company", "Company"))
    card = application_to_card(doc)
    card["jobId"] = job_id
    card["resumeUrl"] = doc["resume_url"]
    card["flowSteps"] = application_flow_steps("applied")
    return card
