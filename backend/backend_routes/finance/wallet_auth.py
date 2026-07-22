"""Session auth helpers for wallet routes."""

from __future__ import annotations

import base64
import json
from typing import Any, Optional

from fastapi import Header, HTTPException

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


def canonical_wallet_user_id(user: dict[str, Any]) -> str:
    """Mongo _id is the canonical wallet key used by the frontend."""
    return str(user.get("_id") or user.get("user_id") or user.get("mobile") or user.get("sub") or "").strip()


def _actor_user_id(user: dict[str, Any]) -> str:
    return canonical_wallet_user_id(user)


def _wallet_owner_ids(user: dict[str, Any]) -> set[str]:
    ids: set[str] = set()
    for key in ("_id", "user_id", "mobile", "sub"):
        val = str(user.get(key) or "").strip()
        if val:
            ids.add(val)
    email = str(user.get("email") or "").strip().lower()
    if email:
        ids.add(email)
    return ids


def is_admin_actor(user: dict[str, Any]) -> bool:
    if user.get("is_admin") is True:
        return True
    return str(user.get("role") or "").lower() == "admin"


async def resolve_authenticated_user(
    authorization: Optional[str] = None,
    x_user_email: Optional[str] = None,
    x_user_mobile: Optional[str] = None,
) -> dict[str, Any]:
    claims = _decode_bearer_claims(authorization)
    if claims and _actor_user_id(claims):
        return claims

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
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    if "_id" in user:
        user["_id"] = str(user["_id"])
    return user


async def require_wallet_owner(
    user_id: str,
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    x_user_email: Optional[str] = Header(default=None, alias="X-User-Email"),
    x_user_mobile: Optional[str] = Header(default=None, alias="X-User-Mobile"),
) -> dict[str, Any]:
    actor = await resolve_authenticated_user(authorization, x_user_email, x_user_mobile)
    target = str(user_id or "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="user_id required")
    owner_ids = _wallet_owner_ids(actor)
    if target not in owner_ids and target.lower() not in owner_ids and not is_admin_actor(actor):
        raise HTTPException(status_code=403, detail="Wallet access denied")
    return actor


async def resolve_recipient_user_id(identifier: str) -> str:
    clean = str(identifier or "").strip()
    if not clean:
        raise HTTPException(status_code=400, detail="Recipient required")
    query: dict[str, Any]
    if "@" in clean:
        query = {"email": clean.lower()}
    else:
        query = {"$or": [{"user_id": clean}, {"mobile": clean}, {"email": clean.lower()}]}
    user = await user_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="Recipient wallet not found")
    return canonical_wallet_user_id(user)
