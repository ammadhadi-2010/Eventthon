"""Admin Jobs hub settings — company jobs + community opportunities."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from database import settings_collection

router = APIRouter(tags=["Admin Jobs Hub Settings"])

JOBS_KEY = "jobs_hub"
OPP_KEY = "opportunity_hub"

DEFAULT_JOB_SETTINGS: Dict[str, Any] = {
    "jobsEnabled": True,
    "requireAdminApproval": True,
    "companyVerificationRequired": True,
    "resumeRequiredToApply": True,
    "emailAlertsDefaultOn": True,
    "maxAlertsPerUser": 20,
    "autoExpireDays": 60,
    "showAssessmentSection": False,
    "showInterviewSection": False,
    "showSalarySection": False,
}

DEFAULT_OPPORTUNITY_SETTINGS: Dict[str, Any] = {
    "opportunitiesEnabled": True,
    "requireAdminApproval": True,
    "membersCanPost": True,
    "opportunityAlertsEnabled": True,
    "showBrowseOpportunities": True,
    "maxOpportunityAlertsPerUser": 20,
    "opportunityTypes": (
        "Freelance Work, One-time Task, Short-term Project, Need Team Member, "
        "Need Co-Founder, Need Investor, Collaboration Request"
    ),
}


class JobSettingsBody(BaseModel):
    jobsEnabled: bool = True
    requireAdminApproval: bool = True
    companyVerificationRequired: bool = True
    resumeRequiredToApply: bool = True
    emailAlertsDefaultOn: bool = True
    maxAlertsPerUser: int = Field(20, ge=1, le=100)
    autoExpireDays: int = Field(60, ge=1, le=365)
    showAssessmentSection: bool = False
    showInterviewSection: bool = False
    showSalarySection: bool = False


class OpportunitySettingsBody(BaseModel):
    opportunitiesEnabled: bool = True
    requireAdminApproval: bool = True
    membersCanPost: bool = True
    opportunityAlertsEnabled: bool = True
    showBrowseOpportunities: bool = True
    maxOpportunityAlertsPerUser: int = Field(20, ge=1, le=100)
    opportunityTypes: str = Field(..., min_length=3, max_length=800)


def _job_serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    d = DEFAULT_JOB_SETTINGS
    return {
        "jobsEnabled": bool(doc.get("jobsEnabled", d["jobsEnabled"])),
        "requireAdminApproval": bool(doc.get("requireAdminApproval", d["requireAdminApproval"])),
        "companyVerificationRequired": bool(
            doc.get("companyVerificationRequired", d["companyVerificationRequired"])
        ),
        "resumeRequiredToApply": bool(doc.get("resumeRequiredToApply", d["resumeRequiredToApply"])),
        "emailAlertsDefaultOn": bool(doc.get("emailAlertsDefaultOn", d["emailAlertsDefaultOn"])),
        "maxAlertsPerUser": int(doc.get("maxAlertsPerUser", d["maxAlertsPerUser"])),
        "autoExpireDays": int(doc.get("autoExpireDays", d["autoExpireDays"])),
        "showAssessmentSection": bool(doc.get("showAssessmentSection", d["showAssessmentSection"])),
        "showInterviewSection": bool(doc.get("showInterviewSection", d["showInterviewSection"])),
        "showSalarySection": bool(doc.get("showSalarySection", d["showSalarySection"])),
        "updatedAt": doc.get("updatedAt"),
    }


def _opp_serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    d = DEFAULT_OPPORTUNITY_SETTINGS
    return {
        "opportunitiesEnabled": bool(doc.get("opportunitiesEnabled", d["opportunitiesEnabled"])),
        "requireAdminApproval": bool(doc.get("requireAdminApproval", d["requireAdminApproval"])),
        "membersCanPost": bool(doc.get("membersCanPost", d["membersCanPost"])),
        "opportunityAlertsEnabled": bool(
            doc.get("opportunityAlertsEnabled", d["opportunityAlertsEnabled"])
        ),
        "showBrowseOpportunities": bool(
            doc.get("showBrowseOpportunities", d["showBrowseOpportunities"])
        ),
        "maxOpportunityAlertsPerUser": int(
            doc.get("maxOpportunityAlertsPerUser", d["maxOpportunityAlertsPerUser"])
        ),
        "opportunityTypes": str(doc.get("opportunityTypes") or d["opportunityTypes"]),
        "updatedAt": doc.get("updatedAt"),
    }


async def _get_or_seed(key: str, defaults: Dict[str, Any]) -> Dict[str, Any]:
    doc = await settings_collection.find_one({"settings_key": key})
    if doc:
        return doc
    seed = {**defaults, "settings_key": key, "updatedAt": datetime.utcnow().isoformat()}
    await settings_collection.insert_one(seed)
    return await settings_collection.find_one({"settings_key": key})


async def get_job_hub_settings() -> Dict[str, Any]:
    return _job_serialize(await _get_or_seed(JOBS_KEY, DEFAULT_JOB_SETTINGS))


async def get_opportunity_hub_settings() -> Dict[str, Any]:
    return _opp_serialize(await _get_or_seed(OPP_KEY, DEFAULT_OPPORTUNITY_SETTINGS))


def parse_opportunity_types(raw: str) -> List[str]:
    return [p.strip() for p in str(raw or "").split(",") if p.strip()]


@router.get("/settings/jobs")
async def admin_get_job_settings():
    return {"settings": await get_job_hub_settings()}


@router.put("/settings/jobs")
async def admin_save_job_settings(body: JobSettingsBody):
    payload = body.model_dump()
    payload["settings_key"] = JOBS_KEY
    payload["updatedAt"] = datetime.utcnow().isoformat()
    await settings_collection.update_one({"settings_key": JOBS_KEY}, {"$set": payload}, upsert=True)
    return {"status": "success", "settings": await get_job_hub_settings()}


@router.get("/settings/opportunities")
async def admin_get_opportunity_settings():
    return {"settings": await get_opportunity_hub_settings()}


@router.put("/settings/opportunities")
async def admin_save_opportunity_settings(body: OpportunitySettingsBody):
    payload = body.model_dump()
    payload["settings_key"] = OPP_KEY
    payload["updatedAt"] = datetime.utcnow().isoformat()
    await settings_collection.update_one({"settings_key": OPP_KEY}, {"$set": payload}, upsert=True)
    return {"status": "success", "settings": await get_opportunity_hub_settings()}
