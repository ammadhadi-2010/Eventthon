"""Referral invite link API."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException

from backend_routes.profile.profile_helpers import verify_profile_owner
from database import user_collection

from .referral_service import referral_summary

router = APIRouter(prefix="/referrals", tags=["Referrals"])


async def _user_from_session_headers(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict:
    email_h = (x_user_email or "").strip().lower()
    mobile_h = (x_user_mobile or "").strip()
    if not email_h and not mobile_h:
        raise HTTPException(status_code=401, detail="Authenticated session required")

    clauses = []
    if email_h:
        clauses.append({"email": email_h})
    if mobile_h:
        clauses.append({"mobile": mobile_h})
    user = await user_collection.find_one({"$or": clauses})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/summary/me")
async def get_my_referral_summary(user: dict = Depends(_user_from_session_headers)):
    return {"status": "success", "data": await referral_summary(user)}


@router.get("/summary/{identifier}")
async def get_referral_summary(identifier: str, user: dict = Depends(verify_profile_owner)):
    _ = identifier
    return {"status": "success", "data": await referral_summary(user)}
