"""Rank & preferences persistence for profile onboarding step 7."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import user_collection

from .profile_helpers import normalize_user_profile, user_lookup_query, verify_profile_owner

router = APIRouter()


class ProfilePreferencesBody(BaseModel):
    public_visibility: bool = True
    message_notifications: bool = True
    order_alerts: bool = True


def preferences_db_payload(body: ProfilePreferencesBody) -> dict:
    return {
        "public_visibility": body.public_visibility,
        "message_notifications": body.message_notifications,
        "order_alerts": body.order_alerts,
        "pref_public_profile": body.public_visibility,
        "pref_notify_messages": body.message_notifications,
        "pref_notify_gigs": body.order_alerts,
        "profile_onboarding_complete": True,
    }


@router.post("/preferences/{identifier}")
async def save_profile_preferences(
    identifier: str,
    body: ProfilePreferencesBody,
    _user: dict = Depends(verify_profile_owner),
):
    payload = preferences_db_payload(body)
    result = await user_collection.update_one(user_lookup_query(identifier), {"$set": payload})
    if result.matched_count == 0:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="User not found")
    return {
        "status": "success",
        "message": "Preferences saved",
        "completion_pct": 100,
        "preferences": payload,
    }


@router.get("/preferences/{identifier}")
async def get_profile_preferences(identifier: str, user: dict = Depends(verify_profile_owner)):
    doc = normalize_user_profile(user)
    return {
        "status": "success",
        "preferences": {
            "public_visibility": doc.get("public_visibility", doc.get("pref_public_profile", True)),
            "message_notifications": doc.get(
                "message_notifications", doc.get("pref_notify_messages", True)
            ),
            "order_alerts": doc.get("order_alerts", doc.get("pref_notify_gigs", True)),
            "profile_onboarding_complete": bool(doc.get("profile_onboarding_complete")),
        },
        "completion_pct": 100 if doc.get("profile_onboarding_complete") else None,
    }
