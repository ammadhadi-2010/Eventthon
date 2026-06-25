"""Resolve marketplace user identity from headers or body."""
from __future__ import annotations

from bson import ObjectId
from fastapi import Header, HTTPException

from backend_routes.alerts.alerts_helpers import resolve_user, verify_alerts_owner_from_headers
from database import user_collection


async def _lookup_user_by_mongo_id(raw_id: str) -> dict | None:
    value = str(raw_id or "").strip()
    if not value:
        return None
    try:
        doc = await user_collection.find_one({"_id": ObjectId(value)})
        if doc:
            return doc
    except Exception:
        pass
    return await user_collection.find_one({"user_id": value})


def _application_identifier(user: dict) -> str:
    mobile = str(user.get("mobile") or "").strip()
    if mobile:
        return mobile
    email = str(user.get("email") or "").strip().lower()
    if email:
        return email
    user_id = str(user.get("user_id") or "").strip()
    if user_id:
        return user_id
    return str(user.get("_id") or "").strip()


async def resolve_jobs_marketplace_user(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
    body_user_id: str = "",
) -> tuple[str, dict | None]:
    header_id = str(x_user_id or "").strip()
    if header_id:
        user = await _lookup_user_by_mongo_id(header_id)
        if not user:
            raise HTTPException(status_code=404, detail="User id not found")
        ident = _application_identifier(user)
        if not ident:
            raise HTTPException(status_code=400, detail="User identity unavailable")
        return ident, user

    body_value = str(body_user_id or "").strip()
    if body_value:
        user = await resolve_user(body_value)
        return body_value, user

    try:
        user = await verify_alerts_owner_from_headers(x_user_email, x_user_mobile)
        return _application_identifier(user), user
    except HTTPException:
        raise HTTPException(status_code=401, detail="Sign in required to apply")
