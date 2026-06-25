"""Screenshot storage for user feedback reports."""
from __future__ import annotations

import os
import uuid

from fastapi import UploadFile

FEEDBACK_UPLOAD_DIR = os.path.join("static", "uploads", "feedback")
FEEDBACK_URL_PREFIX = "/static/uploads/feedback"


async def save_feedback_screenshot(file: UploadFile | None) -> str:
    if not file or not file.filename:
        return ""
    os.makedirs(FEEDBACK_UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename)[1] or ".png"
    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(FEEDBACK_UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return f"{FEEDBACK_URL_PREFIX}/{filename}"
