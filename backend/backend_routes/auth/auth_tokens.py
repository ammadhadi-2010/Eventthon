"""JWT helpers for OAuth and API session tokens."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

ALGORITHM = "HS256"


def _jwt_secret() -> str:
    secret = (
        os.getenv("JWT_SECRET")
        or os.getenv("GOOGLE_CLIENT_SECRET")
        or "eventthon-dev-insecure-jwt-secret"
    ).strip()
    return secret


def create_access_token(payload: dict[str, Any], *, hours: int | None = None) -> str:
    expire_hours = hours if hours is not None else int(os.getenv("JWT_EXPIRE_HOURS", "168"))
    now = datetime.now(timezone.utc)
    data = dict(payload)
    data["iat"] = now
    data["exp"] = now + timedelta(hours=max(1, expire_hours))
    return jwt.encode(data, _jwt_secret(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, _jwt_secret(), algorithms=[ALGORITHM])


def create_oauth_state() -> str:
    return create_access_token({"purpose": "google_oauth_state"}, hours=1)


def verify_oauth_state(state: str) -> None:
    payload = decode_access_token(state)
    if payload.get("purpose") != "google_oauth_state":
        raise ValueError("Invalid OAuth state")
