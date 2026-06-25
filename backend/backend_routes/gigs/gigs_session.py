"""Session headers and gig ownership checks for gigs APIs."""
from __future__ import annotations

from fastapi import Header, HTTPException

from database import user_collection


async def verify_gigs_session(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict:
    email_h = (x_user_email or "").strip().lower()
    mobile_h = (x_user_mobile or "").strip()
    if not email_h and not mobile_h:
        raise HTTPException(status_code=401, detail="Authenticated session required")
    ident = email_h or mobile_h
    user = await user_collection.find_one(
        {
            "$or": [
                {"email": ident.lower() if "@" in ident else ident},
                {"mobile": ident},
                {"user_id": ident.lower()},
            ]
        }
    )
    if not user and "@" not in ident:
        user = await user_collection.find_one({"email": ident.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def user_session_ids(user: dict) -> set[str]:
    ids: set[str] = set()
    for key in ("_id", "user_id", "email", "mobile"):
        val = user.get(key)
        if val is None:
            continue
        text = str(val).strip()
        if text:
            ids.add(text)
            if key == "email":
                ids.add(text.lower())
    return ids


async def assert_gig_owner(seller_user_id: str, user: dict) -> None:
    allowed = user_session_ids(user)
    if seller_user_id.strip() not in allowed:
        raise HTTPException(status_code=403, detail="You may only modify your own gigs")


async def assert_actor_id(actor_id: str, user: dict) -> None:
    allowed = user_session_ids(user)
    if actor_id.strip() not in allowed:
        raise HTTPException(status_code=403, detail="Action not allowed for this session")
