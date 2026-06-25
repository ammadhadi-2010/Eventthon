"""Publish hub job listings visible on browse search (dev: auto-approved)."""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any, Dict

from database import jobs_collection

from backend_routes.admin.job_company_link import company_snapshot_for_job, job_company_keys_on_write
from backend_routes.dashboard.carousel_intel_pipeline import apply_carousel_intel
from .hub_shared import CreateJobAlertPayload


def slugify_title(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    return slug[:80] or uuid.uuid4().hex[:12]


def public_publish_defaults() -> Dict[str, Any]:
    """New user alerts appear in admin as pending until approved."""
    return {
        "visibility": "public",
        "status": "pending",
        "is_approved": False,
    }


async def publish_job_from_alert(payload: CreateJobAlertPayload, alert_id: str) -> str:
    """Upsert a browse-visible job row linked to a new job alert."""
    now = datetime.utcnow().isoformat()
    title = payload.job_title.strip()
    smin = int(payload.salary_min or 60)
    smax = int(payload.salary_max or 100)
    work_mode = (payload.work_mode or "Remote").strip()
    job_id = f"job-alert-{alert_id}"

    company_name = "EventThon Network"
    doc = {
        "_id": job_id,
        **public_publish_defaults(),
        "public_slug": slugify_title(title),
        "title": title,
        "category": (payload.job_category or "General").strip(),
        "summary": ((payload.job_description or "").strip()[:240] or title),
        "description": (payload.job_description or "").strip(),
        "salary_range": f"${smin}k - ${smax}k",
        "compensation_band": {"min": smin, "max": smax},
        "employment_type": payload.employment_type or "Full-time",
        "experience_level": payload.experience_level or "Mid Level",
        "work_mode": work_mode,
        "remote": work_mode.lower() == "remote",
        "location": work_mode,
        "company_name": company_name,
        "company_id": None,
        "posted_ago": "Just now",
        "skills_tags": list(payload.skills or [])[:12],
        "keywords": list(payload.keywords or [])[:12],
        "alert_id": alert_id,
        "hub_published": True,
        "created_at": now,
        "updated_at": now,
    }
    cid = str(payload.company_id or "").strip()
    if cid:
        snap = await company_snapshot_for_job(cid)
        if snap:
            doc.update(job_company_keys_on_write(cid, snap))
    doc = await apply_carousel_intel(doc, "job")
    await jobs_collection.update_one({"_id": job_id}, {"$set": doc}, upsert=True)
    return job_id
