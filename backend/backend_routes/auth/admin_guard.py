"""Admin authorization dependency for protected finance and admin routes."""

from __future__ import annotations

import base64
import json
from typing import Any, Optional

from fastapi import Depends, Header, HTTPException

from database import user_collection


def _decode_bearer_claims(authorization: Optional[str]) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return {}
    token = authorization.split(" ", 1)[1].strip()
    if not token or token.count(".") < 2:
        return {}
    try:
        payload_segment = token.split(".")[1]
        padding = "=" * (-len(payload_segment) % 4)
        decoded = base64.urlsafe_b64decode(payload_segment + padding)
        return json.loads(decoded.decode("utf-8"))
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        return {}


def _is_admin_user(user: Optional[dict]) -> bool:
    if not user:
        return False
    if user.get("is_admin") is True:
        return True
    return str(user.get("role") or "").lower() == "admin"


async def admin_guard(
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    x_user_email: Optional[str] = Header(default=None, alias="X-User-Email"),
    x_user_mobile: Optional[str] = Header(default=None, alias="X-User-Mobile"),
) -> dict[str, Any]:
    """
    Require an authenticated administrator.
    Supports JWT Bearer claims (role/is_admin) and session headers (X-User-Email/Mobile).
    """
    claims = _decode_bearer_claims(authorization)
    if claims and (_is_admin_user(claims) or str(claims.get("role") or "").lower() == "admin"):
        return {"source": "jwt", **claims}

    email = str(x_user_email or "").strip().lower()
    mobile = str(x_user_mobile or "").strip()
    clauses: list[dict[str, Any]] = []
    if email:
        clauses.append({"email": email})
    if mobile:
        clauses.append({"mobile": mobile})
    if not clauses:
        raise HTTPException(status_code=401, detail="Authentication required")

    user = await user_collection.find_one({"$or": clauses})
    if not _is_admin_user(user):
        raise HTTPException(status_code=403, detail="Administrator access required")
    if "_id" in user:
        user["_id"] = str(user["_id"])
    return user
