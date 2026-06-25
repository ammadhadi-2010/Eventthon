"""Admin system settings API — general platform configuration."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

from database import settings_collection

router = APIRouter(tags=["Admin System Settings"])

SETTINGS_KEY = "general"

DEFAULT_GENERAL: Dict[str, Any] = {
    "siteName": "EventThon",
    "siteDescription": "Find your dream job with EventThon.",
    "timezone": "(UTC+05:00) Asia/Karachi",
    "dateFormat": "May 25, 2025 (MM/DD/YYYY)",
    "timeFormat": "12 Hours (AM/PM)",
    "siteLanguage": "English",
    "registrationEnabled": True,
    "emailVerificationEnabled": True,
    "maintenanceModeEnabled": False,
}


class GeneralSettingsBody(BaseModel):
    siteName: str = Field(..., min_length=1, max_length=120)
    siteDescription: str = Field("", max_length=500)
    timezone: str = Field(..., min_length=1, max_length=120)
    dateFormat: str = Field(..., min_length=1, max_length=120)
    timeFormat: str = Field(..., min_length=1, max_length=120)
    siteLanguage: str = Field(..., min_length=1, max_length=80)
    registrationEnabled: bool = True
    emailVerificationEnabled: bool = True
    maintenanceModeEnabled: bool = False


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "siteName": doc.get("siteName", DEFAULT_GENERAL["siteName"]),
        "siteDescription": doc.get("siteDescription", DEFAULT_GENERAL["siteDescription"]),
        "timezone": doc.get("timezone", DEFAULT_GENERAL["timezone"]),
        "dateFormat": doc.get("dateFormat", DEFAULT_GENERAL["dateFormat"]),
        "timeFormat": doc.get("timeFormat", DEFAULT_GENERAL["timeFormat"]),
        "siteLanguage": doc.get("siteLanguage", DEFAULT_GENERAL["siteLanguage"]),
        "registrationEnabled": bool(doc.get("registrationEnabled", True)),
        "emailVerificationEnabled": bool(doc.get("emailVerificationEnabled", True)),
        "maintenanceModeEnabled": bool(doc.get("maintenanceModeEnabled", False)),
        "updatedAt": doc.get("updatedAt"),
    }


async def _get_or_seed() -> Dict[str, Any]:
    doc = await settings_collection.find_one({"settings_key": SETTINGS_KEY})
    if doc:
        return doc
    seed = {**DEFAULT_GENERAL, "settings_key": SETTINGS_KEY, "updatedAt": datetime.utcnow().isoformat()}
    await settings_collection.insert_one(seed)
    return await settings_collection.find_one({"settings_key": SETTINGS_KEY})


@router.get("/settings/general")
async def get_general_settings():
    doc = await _get_or_seed()
    return {"settings": _serialize(doc)}


@router.put("/settings/general")
async def save_general_settings(body: GeneralSettingsBody):
    payload = body.model_dump()
    payload["settings_key"] = SETTINGS_KEY
    payload["updatedAt"] = datetime.utcnow().isoformat()
    await settings_collection.update_one(
        {"settings_key": SETTINGS_KEY},
        {"$set": payload},
        upsert=True,
    )
    doc = await settings_collection.find_one({"settings_key": SETTINGS_KEY})
    return {"status": "success", "settings": _serialize(doc)}
