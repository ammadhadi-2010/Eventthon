"""Footer CMS media uploads — images and video files."""
from __future__ import annotations

import os
import uuid

from fastapi import HTTPException, UploadFile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads", "footer-resources")
URL_PREFIX = "/static/uploads/footer-resources"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
VIDEO_EXT = {".mp4", ".webm", ".mov", ".m4v"}
MAX_BYTES = 12 * 1024 * 1024


async def save_footer_media(file: UploadFile) -> dict[str, str]:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No media file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Media file too large (max 12MB)")

    if ext in VIDEO_EXT:
        field = "videourl"
    elif ext in IMAGE_EXT:
        field = "imageurl"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as handle:
        handle.write(content)

    url = f"{URL_PREFIX}/{name}"
    return {"field": field, "url": url, field: url}
