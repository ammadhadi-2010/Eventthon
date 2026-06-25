"""Jobs hub — shared models, status keys, application flow mapping."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from backend_routes.public.public_marketplace_defaults import JOB_BOARD_STATS

APPLICATION_STATUS_KEYS = ("applied", "in-review", "interview", "offered")

FLOW_STEP_DEFS = [
    {"id": "applied", "label": "Applied"},
    {"id": "review", "label": "Under Review"},
    {"id": "interview", "label": "Interview"},
    {"id": "technical", "label": "Technical Task"},
    {"id": "hired", "label": "Hired"},
]

STATUS_FLOW_INDEX = {
    "applied": 0,
    "in-review": 1,
    "interview": 2,
    "offered": 4,
}


class CreateJobAlertPayload(BaseModel):
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
    email_notifications: bool = True
    notification_email: Optional[str] = None
    company_id: Optional[str] = Field(None, max_length=120)


class UpdateJobAlertPayload(BaseModel):
    email_enabled: Optional[bool] = None


class UpdateApplicationFlowPayload(BaseModel):
    status: str = Field(..., min_length=3, max_length=32)
    recruiter_action: Optional[str] = None


def normalize_status(raw: str) -> str:
    key = str(raw or "applied").strip().lower().replace("_", "-")
    if key in APPLICATION_STATUS_KEYS:
        return key
    if key == "inreview":
        return "in-review"
    return "applied"


def application_flow_steps(status: str) -> List[dict]:
    idx = STATUS_FLOW_INDEX.get(normalize_status(status), 0)
    out = []
    for i, step in enumerate(FLOW_STEP_DEFS):
        if i < idx:
            st = "completed"
        elif i == idx:
            st = "active"
        else:
            st = "pending"
        out.append({**step, "status": st})
    return out


def alert_to_card(doc: dict) -> dict:
    smin = int(doc.get("salary_min") or 60)
    smax = int(doc.get("salary_max") or 100)
    exp = doc.get("experience_level") or "1-3 Years"
    return {
        "id": str(doc.get("_id") or doc.get("id") or ""),
        "title": doc.get("title") or "Job Alert",
        "salary": f"${smin}k - ${smax}k",
        "workMode": doc.get("work_mode") or "Remote",
        "experience": exp,
        "logoText": (doc.get("title") or "J")[:1].upper(),
        "logoClass": doc.get("logo_class") or "google",
        "emailEnabled": bool(doc.get("email_enabled", True)),
    }


def application_to_card(doc: dict) -> dict:
    return {
        "id": str(doc.get("_id") or ""),
        "jobId": doc.get("job_id") or "",
        "role": doc.get("role") or "Role",
        "company": doc.get("company") or "Company",
        "appliedOn": doc.get("applied_on") or "",
        "resumeUrl": doc.get("resume_url") or "",
        "status": normalize_status(doc.get("status")),
        "logoText": doc.get("logo_text") or "E",
        "logoClass": doc.get("logo_class") or "google",
        "flowSteps": application_flow_steps(doc.get("status")),
    }


def default_applications_seed() -> List[dict]:
    now = datetime.utcnow().isoformat()
    rows = [
        ("Frontend Developer", "Google", "in-review", "G", "google", "May 30, 2025"),
        ("AI/ML Engineer", "Microsoft", "interview", "M", "microsoft", "May 28, 2025"),
        ("UI/UX Designer", "Figma", "applied", "F", "figma", "May 25, 2025"),
        ("DevOps Engineer", "Amazon", "applied", "a", "amazon", "May 22, 2025"),
    ]
    return [
        {
            "role": r,
            "company": c,
            "status": s,
            "logo_text": lt,
            "logo_class": lc,
            "applied_on": d,
            "created_at": now,
        }
        for r, c, s, lt, lc, d in rows
    ]
