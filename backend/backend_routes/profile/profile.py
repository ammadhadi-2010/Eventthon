"""User profile update routes — session-scoped to the signed-in owner."""
from __future__ import annotations

import base64
import os

from fastapi import APIRouter, Depends, HTTPException

from database import user_collection

from .profile_helpers import normalize_user_profile, user_lookup_query, verify_profile_owner
from .profile_schemas import ProfileUpdate, profile_update_payload
from .profile_preferences import router as preferences_router
from .profile_uploads import router as uploads_router
from .account_settings import router as account_settings_router

router = APIRouter(tags=["User Profile"])
router.include_router(uploads_router)
router.include_router(preferences_router)
router.include_router(account_settings_router)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDENTITY_DIR = os.path.join(BASE_DIR, "static", "uploads", "identity")
os.makedirs(IDENTITY_DIR, exist_ok=True)


@router.get("/me/{identifier}")
async def get_profile_me(identifier: str, user: dict = Depends(verify_profile_owner)):
    return normalize_user_profile(user)


@router.post("/update-profile-data/{identifier}")
async def update_profile(identifier: str, data: ProfileUpdate, _user: dict = Depends(verify_profile_owner)):
    update_data = profile_update_payload(data)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data received")
    result = await user_collection.update_one(user_lookup_query(identifier), {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "Profile updated"}


@router.post("/update-projects/{identifier}")
async def update_projects(identifier: str, payload: dict, _user: dict = Depends(verify_profile_owner)):
    projects = payload.get("projects")
    if projects is None:
        raise HTTPException(status_code=400, detail="projects array is required")
    result = await user_collection.update_one(user_lookup_query(identifier), {"$set": {"projects": projects}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "Projects updated"}


@router.post("/update-status/{identifier}")
async def update_identity_status(identifier: str, payload: dict, _user: dict = Depends(verify_profile_owner)):
    front_base64 = payload.get("id_front")
    back_base64 = payload.get("id_back")
    new_status = payload.get("status", "Pending Review")
    if not front_base64 or not back_base64:
        raise HTTPException(status_code=400, detail="Missing ID images")

    file_links = {}
    safe_id = identifier.replace("@", "_").replace(".", "_")
    for side, b64_str in [("front", front_base64), ("back", back_base64)]:
        try:
            if "," in b64_str:
                header, encoded = b64_str.split(",", 1)
                file_ext = header.split("/")[1].split(";")[0]
                filename = f"{safe_id}_{side}_{int(os.path.getmtime(IDENTITY_DIR) or 0)}.{file_ext}"
                filepath = os.path.join(IDENTITY_DIR, filename)
                with open(filepath, "wb") as handle:
                    handle.write(base64.b64decode(encoded))
                file_links[f"id_{side}"] = f"/static/uploads/identity/{filename}"
            else:
                file_links[f"id_{side}"] = b64_str
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Error processing {side} image") from exc

    result = await user_collection.update_one(
        user_lookup_query(identifier),
        {
            "$set": {
                **file_links,
                "identity_status": new_status,
                "admin_status": "pending",
                "verified": False,
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found in database")
    return {"status": "success", "message": "ID documents stored and status updated"}
