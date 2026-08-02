"""Publish hub job listings (company hiring or community opportunities)."""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from database import jobs_collection

from backend_routes.admin.job_company_link import company_snapshot_for_job, job_company_keys_on_write
from backend_routes.dashboard.carousel_intel_pipeline import apply_carousel_intel
from .hub_shared import CreateJobListingPayload


def slugify_title(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    return slug[:80] or uuid.uuid4().hex[:12]


def public_publish_defaults() -> Dict[str, Any]:
    """New listings appear in admin as pending until approved."""
    return {
        "visibility": "public",
        "status": "pending",
        "is_approved": False,
    }


async def publish_job_listing(
    payload: CreateJobListingPayload,
    *,
    listing_kind: str,
    company_id: Optional[str] = None,
    posted_by: str = "",
) -> str:
    """Create a browse-visible job row (company or community opportunity)."""
    now = datetime.utcnow().isoformat()
    title = payload.job_title.strip()
    smin = int(payload.salary_min or 60)
    smax = int(payload.salary_max or 100)
    work_mode = (payload.work_mode or "Remote").strip()
    kind = "company" if listing_kind == "company" else "opportunity"
    job_id = f"job-{kind}-{uuid.uuid4().hex[:12]}"

    if kind == "company":
        company_name = "Company"
        employment = payload.employment_type or "Full-time"
        salary_range = f"${smin}k - ${smax}k"
    else:
        company_name = "Community Opportunity"
        employment = (payload.opportunity_type or payload.employment_type or "Short Task").strip()
        budget_model = (payload.budget_model or "Negotiable").strip()
        if budget_model in {"Fixed", "Hourly"} and payload.budget_amount:
            salary_range = f"{budget_model}: {str(payload.budget_amount).strip()}"
        elif budget_model == "Equity" and payload.equity_share:
            salary_range = f"Equity: {str(payload.equity_share).strip()}"
        else:
            salary_range = budget_model

    doc = {
        "_id": job_id,
        **public_publish_defaults(),
        "public_slug": slugify_title(title),
        "title": title,
        "category": (payload.job_category or "General").strip(),
        "summary": ((payload.job_description or "").strip()[:240] or title),
        "description": (payload.job_description or "").strip(),
        "salary_range": salary_range,
        "compensation_band": {"min": smin, "max": smax},
        "employment_type": employment,
        "experience_level": payload.experience_level or "Any",
        "work_mode": work_mode,
        "remote": work_mode.lower() == "remote",
        "location": work_mode,
        "company_name": company_name,
        "company_id": None,
        "listing_kind": kind,
        "opportunity_type": (payload.opportunity_type or employment) if kind == "opportunity" else None,
        "budget_model": getattr(payload, "budget_model", None),
        "budget_amount": getattr(payload, "budget_amount", None),
        "equity_share": getattr(payload, "equity_share", None),
        "duration": getattr(payload, "duration", None),
        "deadline": getattr(payload, "deadline", None),
        "people_needed": int(payload.people_needed or 1),
        "attachment_names": list(payload.attachment_names or [])[:5],
        "posted_by": str(posted_by or "").strip(),
        "posted_ago": "Just now",
        "skills_tags": list(payload.skills or [])[:12],
        "keywords": list(payload.keywords or [])[:12],
        "hub_published": True,
        "created_at": now,
        "updated_at": now,
    }
    cid = str(company_id or payload.company_id or "").strip()
    if kind == "company" and cid:
        snap = await company_snapshot_for_job(cid)
        if snap:
            doc.update(job_company_keys_on_write(cid, snap))
    doc = await apply_carousel_intel(doc, "job")
    await jobs_collection.update_one({"_id": job_id}, {"$set": doc}, upsert=True)
    try:
        from .hub_alert_match import notify_matching_alerts_for_job

        await notify_matching_alerts_for_job(job_id)
    except Exception:
        # Matching/notify must never block publish.
        pass
    return job_id


async def publish_job_from_alert(payload, alert_id: str) -> str:
    """Legacy shim — prefer publish_job_listing."""
    listing = CreateJobListingPayload(
        user_id=payload.user_id,
        job_title=payload.job_title,
        job_description=payload.job_description,
        employment_type=payload.employment_type,
        experience_level=payload.experience_level,
        career_level=payload.career_level,
        job_category=payload.job_category,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        work_mode=payload.work_mode,
        skills=payload.skills,
        keywords=payload.keywords,
        company_id=getattr(payload, "company_id", None),
        listing_kind="opportunity",
    )
    return await publish_job_listing(
        listing,
        listing_kind="opportunity",
        company_id=getattr(payload, "company_id", None),
        posted_by=payload.user_id,
    )
