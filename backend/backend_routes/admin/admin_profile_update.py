"""Secure admin profile update handler."""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime

from fastapi import HTTPException, UploadFile

from backend_routes.auth.auth import hash_password
from database import user_collection

logger = logging.getLogger(__name__)

AVATAR_UPLOAD_DIR = os.path.join("static", "uploads", "admin-profiles")
AVATAR_URL_PREFIX = "/static/uploads/admin-profiles"


async def save_admin_avatar(file: UploadFile | None) -> str:
    if not file or not file.filename:
        return ""
    os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename)[1] or ".png"
    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(AVATAR_UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return f"{AVATAR_URL_PREFIX}/{filename}"


def _split_full_name(full_name: str) -> tuple[str, str]:
    parts = [part for part in str(full_name or "").strip().split(" ") if part]
    if not parts:
        return "Super", "Administrator"
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def _validate_email(email: str) -> str:
    cleaned = str(email or "").strip().lower()
    if "@" not in cleaned or len(cleaned) < 5:
        raise HTTPException(status_code=422, detail="A valid email address is required.")
    return cleaned


def _validate_password_pair(password: str, confirm_password: str) -> str | None:
    pwd = str(password or "").strip()
    confirm = str(confirm_password or "").strip()
    if not pwd and not confirm:
        return None
    if len(pwd) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters.")
    if pwd != confirm:
        raise HTTPException(status_code=422, detail="Password confirmation does not match.")
    return hash_password(pwd)


async def apply_admin_profile_update(
    user: dict,
    *,
    full_name: str,
    email: str,
    imageurl_link: str = "",
    image_file: UploadFile | None = None,
    password: str = "",
    confirm_password: str = "",
) -> dict:
    if str(user.get("role") or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Only administrator accounts can update this profile.")

    name = str(full_name or "").strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Full name must be at least 2 characters.")

    normalized_email = _validate_email(email)
    password_hash = _validate_password_pair(password, confirm_password)
    uploaded_image = await save_admin_avatar(image_file)
    imageurl = uploaded_image or str(imageurl_link or user.get("imageurl") or "").strip()

    first_name, last_name = _split_full_name(name)
    patch = {
        "first_name": first_name,
        "last_name": last_name,
        "full_name": name,
        "display_name": name,
        "email": normalized_email,
        "updated_at": datetime.utcnow(),
    }
    if imageurl:
        patch.update({"imageurl": imageurl, "profile_image_url": imageurl, "avatar": imageurl})
    if password_hash:
        patch["password"] = password_hash

    await user_collection.update_one({"_id": user["_id"]}, {"$set": patch})
    logger.info("Admin profile updated for user_id=%s", user.get("_id"))
    return {
        "full_name": name,
        "email": normalized_email,
        "imageurl": imageurl or str(user.get("imageurl") or ""),
    }
