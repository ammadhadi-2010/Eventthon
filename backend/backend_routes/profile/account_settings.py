"""Account settings — credential cooldown and password updates."""
from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import HTTPException

from database import user_collection

from backend_routes.auth.auth import hash_password

from .profile_helpers import user_lookup_query

CREDENTIALS_COOLDOWN_DAYS = 60


def _parse_dt(value) -> datetime | None:
    if isinstance(value, datetime):
        return value
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", ""))
    except ValueError:
        return None


def is_admin_approved(user: dict) -> bool:
    status = str(user.get("admin_status") or "").lower()
    identity = str(user.get("identity_status") or "").lower()
    return status == "approved" or user.get("verified") is True or identity == "active"


def credentials_lock_state(user: dict) -> dict:
    approved = is_admin_approved(user)
    full_name = str(user.get("full_name") or "").strip() or " ".join(
        filter(None, [str(user.get("first_name") or "").strip(), str(user.get("last_name") or "").strip()])
    ).strip()
    email = str(user.get("email") or "").strip()

    if not approved:
        return {
            "canChangeCredentials": True,
            "credentialsLocked": False,
            "cooldownDays": CREDENTIALS_COOLDOWN_DAYS,
            "daysUntilChange": 0,
            "nextEligibleAt": None,
            "lockReason": "",
            "fullName": full_name,
            "email": email,
            "adminApproved": False,
        }

    anchor = _parse_dt(user.get("credentials_last_changed_at")) or _parse_dt(user.get("credentials_approved_at"))
    if not anchor:
        return {
            "canChangeCredentials": True,
            "credentialsLocked": False,
            "cooldownDays": CREDENTIALS_COOLDOWN_DAYS,
            "daysUntilChange": 0,
            "nextEligibleAt": None,
            "lockReason": "",
            "fullName": full_name,
            "email": email,
            "adminApproved": True,
        }

    eligible_at = anchor + timedelta(days=CREDENTIALS_COOLDOWN_DAYS)
    now = datetime.utcnow()
    if now >= eligible_at:
        return {
            "canChangeCredentials": True,
            "credentialsLocked": False,
            "cooldownDays": CREDENTIALS_COOLDOWN_DAYS,
            "daysUntilChange": 0,
            "nextEligibleAt": None,
            "lockReason": "",
            "fullName": full_name,
            "email": email,
            "adminApproved": True,
        }

    days_left = max(1, (eligible_at.date() - now.date()).days)
    return {
        "canChangeCredentials": False,
        "credentialsLocked": True,
        "cooldownDays": CREDENTIALS_COOLDOWN_DAYS,
        "daysUntilChange": days_left,
        "nextEligibleAt": eligible_at.isoformat(),
        "lockReason": (
            f"Name and professional email can be changed again after 2 months of admin approval "
            f"({days_left} day(s) remaining)."
        ),
        "fullName": full_name,
        "email": email,
        "adminApproved": True,
    }


def _split_full_name(name: str) -> tuple[str, str]:
    parts = str(name or "").strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


async def apply_account_settings_update(user: dict, payload: dict) -> dict:
    full_name = str(payload.get("full_name") or "").strip()
    email = str(payload.get("email") or "").strip().lower()
    password = str(payload.get("password") or "").strip()
    confirm_password = str(payload.get("confirm_password") or "").strip()

    current_name = str(user.get("full_name") or "").strip() or " ".join(
        filter(None, [str(user.get("first_name") or "").strip(), str(user.get("last_name") or "").strip()])
    ).strip()
    current_email = str(user.get("email") or "").strip().lower()

    name_changed = bool(full_name) and full_name != current_name
    email_changed = bool(email) and email != current_email

    if name_changed or email_changed:
        lock = credentials_lock_state(user)
        if not lock["canChangeCredentials"]:
            raise HTTPException(status_code=403, detail=lock["lockReason"])
        if name_changed and len(full_name) < 2:
            raise HTTPException(status_code=422, detail="Full name must be at least 2 characters.")
        if email_changed:
            if "@" not in email or "." not in email.split("@")[-1]:
                raise HTTPException(status_code=422, detail="Enter a valid professional email.")
            exists = await user_collection.find_one(
                {"email": email, "_id": {"$ne": user["_id"]}},
            )
            if exists:
                raise HTTPException(status_code=409, detail="This email is already registered.")

    patch: dict = {"updated_at": datetime.utcnow()}
    if name_changed:
        first, last = _split_full_name(full_name)
        patch.update(
            {
                "full_name": full_name,
                "display_name": full_name,
                "first_name": first,
                "last_name": last,
            }
        )
    if email_changed:
        patch["email"] = email

    if password:
        if len(password) < 8:
            raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")
        if password != confirm_password:
            raise HTTPException(status_code=422, detail="Passwords do not match.")
        patch["password"] = hash_password(password)

    if not patch or patch.keys() == {"updated_at"}:
        raise HTTPException(status_code=400, detail="No changes to save.")

    if name_changed or email_changed:
        patch["credentials_last_changed_at"] = datetime.utcnow()

    await user_collection.update_one({"_id": user["_id"]}, {"$set": patch})
    fresh = await user_collection.find_one({"_id": user["_id"]}) or user
    state = credentials_lock_state(fresh)
    return {
        "fullName": state["fullName"],
        "email": state["email"],
        "passwordUpdated": bool(password),
        "credentialsChanged": name_changed or email_changed,
        **state,
    }


# --- HTTP routes (same module, keeps profile wiring simple) ---

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional

from .profile_helpers import verify_profile_owner

router = APIRouter(tags=["Account Settings"])


class AccountSettingsBody(BaseModel):
    full_name: Optional[str] = Field(None, max_length=160)
    email: Optional[str] = Field(None, max_length=200)
    password: Optional[str] = Field(None, max_length=128)
    confirm_password: Optional[str] = Field(None, max_length=128)


@router.get("/account-settings/{identifier}")
async def get_account_settings(identifier: str, user: dict = Depends(verify_profile_owner)):
    return {"status": "success", "data": credentials_lock_state(user)}


@router.put("/account-settings/{identifier}")
async def update_account_settings(
    identifier: str,
    body: AccountSettingsBody,
    user: dict = Depends(verify_profile_owner),
):
    payload = body.model_dump(exclude_none=True)
    data = await apply_account_settings_update(user, payload)
    return {"status": "success", "message": "Account settings updated.", "data": data}
