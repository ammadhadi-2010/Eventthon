"""Notify employer accounts when company-hub events occur."""
from __future__ import annotations

from bson import ObjectId

from database import companies_collection
from backend_routes.alerts.alert_factory import push_alert
from backend_routes.jobs.hub_listings import find_job_doc


async def _resolve_company_owner(job_id: str) -> tuple[str, str, str]:
    job = await find_job_doc(job_id)
    if not job:
        return "", "", ""
    role = str(job.get("title") or "Role")
    company_name = str(job.get("company_name") or "your company")
    company_id = str(job.get("company_id") or "").strip()
    if not company_id:
        return "", role, company_name
    try:
        company = await companies_collection.find_one({"_id": ObjectId(company_id)})
    except Exception:
        company = await companies_collection.find_one({"_id": company_id})
    if not company:
        return "", role, company_name
    owner = str(company.get("owner_user_id") or "").strip()
    return owner, role, company_name or str(company.get("name") or "your company")


async def notify_employer_verification_status(
    owner_user_id: str,
    *,
    approved: bool,
    company_name: str,
) -> None:
    owner = str(owner_user_id or "").strip()
    if not owner:
        return
    name = str(company_name or "your company").strip() or "your company"
    if approved:
        await push_alert(
            recipient_identifier=owner,
            category="verification",
            audience="employer",
            title="Company verified",
            message=f"{name} is verified. You can now publish jobs and gigs.",
            action_label="Open company hub",
            action_url="/company/dashboard",
            priority="high",
        )
        return
    await push_alert(
        recipient_identifier=owner,
        category="verification",
        audience="employer",
        title="Verification needs attention",
        message=f"Your verification request for {name} was not approved. Update your documents and resubmit.",
        action_label="Company settings",
        action_url="/company/dashboard/settings",
        priority="high",
    )


async def notify_employer_on_application(job_id: str, applicant_identifier: str = "") -> None:
    owner, role, company_name = await _resolve_company_owner(job_id)
    if not owner:
        return
    applicant = str(applicant_identifier or "A candidate").strip() or "A candidate"
    await push_alert(
        recipient_identifier=owner,
        category="applications",
        audience="employer",
        title="New job application received",
        message=f"{applicant} applied for {role} at {company_name}.",
        actor_name=applicant,
        action_label="Review application",
        action_url="/company/dashboard/applications",
        priority="medium",
    )
