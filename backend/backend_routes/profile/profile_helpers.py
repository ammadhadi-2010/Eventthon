"""Profile lookups, avatar field sync, and session ownership checks."""
from __future__ import annotations

from fastapi import Header, HTTPException

from database import user_collection

MAX_IMAGE_BYTES = 2 * 1024 * 1024


def user_lookup_query(identifier: str) -> dict:
    ident = (identifier or "").strip()
    if not ident:
        return {"_id": None}
    return {
        "$or": [
            {"email": ident.lower()},
            {"mobile": ident},
        ]
    }


def safe_file_key(user: dict, fallback: str) -> str:
    raw = str(user.get("email") or user.get("mobile") or fallback or "user")
    return raw.replace("@", "_").replace(".", "_").replace("/", "_").replace("\\", "_")


def avatar_set_fields(image_url: str) -> dict:
    """Keep imageurl, profile_image_url, and avatar in sync for all clients."""
    url = str(image_url or "").strip()
    return {"imageurl": url, "profile_image_url": url, "avatar": url}


def normalize_user_profile(doc: dict) -> dict:
    if not doc:
        return doc
    out = dict(doc)
    out.pop("password", None)
    if "_id" in out:
        out["_id"] = str(out["_id"])
    avatar = str(out.get("imageurl") or out.get("profile_image_url") or out.get("avatar") or "").strip()
    if avatar:
        out["imageurl"] = avatar
        out["profile_image_url"] = avatar
        out["avatar"] = avatar
    return out


async def verify_profile_owner(
    identifier: str,
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict:
    ident = (identifier or "").strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Profile identifier required")
    email_h = (x_user_email or "").strip().lower()
    mobile_h = (x_user_mobile or "").strip()
    if not email_h and not mobile_h:
        raise HTTPException(status_code=401, detail="Authenticated session required")

    user = await user_collection.find_one(user_lookup_query(ident))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    owner_email = str(user.get("email") or "").strip().lower()
    owner_mobile = str(user.get("mobile") or "").strip()
    if email_h and owner_email and email_h == owner_email:
        return user
    if mobile_h and owner_mobile and mobile_h == owner_mobile:
        return user
    raise HTTPException(status_code=403, detail="You may only edit your own profile")
