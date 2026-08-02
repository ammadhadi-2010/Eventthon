"""Donation hub — admin image uploads."""
from __future__ import annotations

import os
import re
import uuid

from fastapi import HTTPException, UploadFile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads", "donation")
URL_PREFIX = "/static/uploads/donation"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_BYTES = 8 * 1024 * 1024

SLOT_FIELDS = {
    "hero": "heroImageUrl",
    "reward": "rewardImageUrl",
    "learnmore": "learnMoreImageUrl",
}


def _safe_org_slug(org_id: str) -> str:
    slug = re.sub(r"[^a-z0-9-]", "", str(org_id or "").strip().lower())[:40]
    return slug or "org"


async def save_donation_image(file: UploadFile, *, slot: str = "hero") -> str:
    if slot not in SLOT_FIELDS:
        raise HTTPException(status_code=400, detail="Invalid image slot (use hero or reward)")

    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Unsupported image type (JPG, PNG, WebP, GIF only)")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty image upload")
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 8MB)")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{slot}-{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as handle:
        handle.write(content)

    if not os.path.isfile(path) or os.path.getsize(path) == 0:
        raise HTTPException(status_code=500, detail="Image upload failed to save")

    return f"{URL_PREFIX}/{name}"


async def save_donation_org_logo(file: UploadFile, *, org_id: str = "") -> str:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No logo file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Unsupported image type (JPG, PNG, WebP, GIF only)")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty logo upload")
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Logo too large (max 8MB)")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    slug = _safe_org_slug(org_id)
    name = f"org-{slug}-{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as handle:
        handle.write(content)

    if not os.path.isfile(path) or os.path.getsize(path) == 0:
        raise HTTPException(status_code=500, detail="Logo upload failed to save")

    return f"{URL_PREFIX}/{name}"


def donation_image_field_for_slot(slot: str) -> str:
    field = SLOT_FIELDS.get(slot)
    if not field:
        raise HTTPException(status_code=400, detail="Invalid image slot (use hero or reward)")
    return field
