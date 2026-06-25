"""Profile and banner image uploads with ownership checks."""
from __future__ import annotations

import os
import shutil
import time

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from database import user_collection

from .profile_helpers import MAX_IMAGE_BYTES, avatar_set_fields, safe_file_key, user_lookup_query, verify_profile_owner

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.join(BASE_DIR, "static")
ALLOWED_EXT = {"jpg", "jpeg", "png", "gif", "webp"}


def _save_upload(file: UploadFile, sub_dir: str, file_name: str) -> str:
    target_dir = os.path.join(STATIC_DIR, "uploads", sub_dir)
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/static/uploads/{sub_dir}/{file_name}"


@router.post("/upload-profile-image/{identifier}")
async def upload_profile_image(
    identifier: str,
    type: str = Form(...),
    file: UploadFile = File(...),
    _user: dict = Depends(verify_profile_owner),
):
    if type not in ("profile", "banner"):
        raise HTTPException(status_code=400, detail="type must be 'profile' or 'banner'")

    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 2MB or smaller")
    await file.seek(0)

    query = user_lookup_query(identifier)
    user = await user_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    extension = (file.filename or "jpg").split(".")[-1].lower()
    if extension not in ALLOWED_EXT:
        extension = "jpg"
    safe_key = safe_file_key(user, identifier)
    file_name = f"{safe_key}_{type}.{extension}"

    try:
        sub_dir = "profiles" if type == "profile" else "banners"
        image_url = _save_upload(file, sub_dir, file_name)
        if type == "profile":
            await user_collection.update_one(query, {"$set": avatar_set_fields(image_url)})
        else:
            await user_collection.update_one(query, {"$set": {"banner": image_url}})
        return {"status": "success", "url": image_url, "imageurl": image_url}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}") from exc


@router.post("/upload-project-image/{identifier}")
async def upload_project_image(
    identifier: str,
    file: UploadFile = File(...),
    _user: dict = Depends(verify_profile_owner),
):
    query = user_lookup_query(identifier)
    user = await user_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 2MB or smaller")
    await file.seek(0)

    extension = (file.filename or "jpg").split(".")[-1].lower()
    if extension not in ALLOWED_EXT:
        extension = "jpg"
    safe_key = safe_file_key(user, identifier)
    filename = f"{safe_key}_proj_{int(time.time())}.{extension}"

    try:
        image_url = _save_upload(file, "projects", filename)
        return {"status": "success", "url": image_url}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Project image error: {exc}") from exc
