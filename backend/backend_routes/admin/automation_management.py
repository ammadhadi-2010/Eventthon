"""Admin social automation — metrics, posts, settings, AI caption."""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from controllers.post_ai_controller import enhance_social_post
from database import automation_posts_collection, automation_settings_collection
from .automation_format import build_metrics, format_automation_post

router = APIRouter(tags=["Admin Automation"])

UPLOAD_DIR = os.path.join("static", "uploads", "automation")
URL_PREFIX = "/static/uploads/automation"
DEFAULT_PLATFORMS = ["facebook", "instagram", "x", "linkedin", "telegram", "whatsapp", "youtube"]
SETTINGS_ID = "automation_platforms"


class SettingsBody(BaseModel):
    platforms: Dict[str, bool] = Field(default_factory=dict)


class GenerateBody(BaseModel):
    text: str = Field("", max_length=8000)
    prompt: str = Field("", max_length=2000)


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(str(value))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid post id") from exc


async def _connected_count() -> int:
    doc = await automation_settings_collection.find_one({"_id": SETTINGS_ID})
    platforms = (doc or {}).get("platforms") or {}
    if not platforms:
        return len(DEFAULT_PLATFORMS)
    return sum(1 for key in DEFAULT_PLATFORMS if platforms.get(key, True))


async def _save_upload(file: UploadFile | None) -> str:
    if not file or not file.filename:
        return ""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm"):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit")
    with open(path, "wb") as handle:
        handle.write(content)
    return f"{URL_PREFIX}/{name}"


async def _ensure_seed_posts() -> None:
    count = await automation_posts_collection.count_documents({})
    if count:
        return
    now = datetime.utcnow()
    samples = [
        {
            "title": "EventThon 2025 is Here!",
            "caption": "Join the biggest verified network for events, gigs, and squads.",
            "post_type": "image",
            "imageurl": "",
            "platforms": ["facebook", "instagram", "x", "linkedin"],
            "status": "success",
            "created_at": now,
            "published_at": now,
        },
        {
            "title": "New Gig Hub Features",
            "caption": "Browse categories, submit proposals, and track orders in one place.",
            "post_type": "image",
            "imageurl": "",
            "platforms": ["instagram", "linkedin"],
            "status": "pending",
            "created_at": now,
            "published_at": None,
        },
    ]
    await automation_posts_collection.insert_many(samples)


@router.get("/automation/metrics")
async def automation_metrics():
    await _ensure_seed_posts()
    cursor = automation_posts_collection.find({})
    docs = await cursor.to_list(length=5000)
    connected = await _connected_count()
    return {"status": "success", "metrics": build_metrics(docs, connected)}


@router.get("/automation/posts")
async def automation_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    await _ensure_seed_posts()
    skip = (page - 1) * limit
    total = await automation_posts_collection.count_documents({})
    cursor = (
        automation_posts_collection.find({})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    rows = [format_automation_post(doc) for doc in await cursor.to_list(length=limit)]
    return {"status": "success", "data": rows, "total": total, "page": page, "limit": limit}


@router.post("/automation/posts")
async def create_automation_post(
    caption: str = Form(""),
    post_type: str = Form("image"),
    platforms: str = Form("[]"),
    scheduled_at: Optional[str] = Form(None),
    publish_mode: str = Form("now"),
    imageurl: Optional[str] = Form(None),
    file: UploadFile | None = File(None),
):
    try:
        platform_list = json.loads(platforms or "[]")
        if not isinstance(platform_list, list):
            platform_list = []
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid platforms payload") from exc
    if not platform_list:
        raise HTTPException(status_code=400, detail="Select at least one platform")
    caption = str(caption or "").strip()
    if not caption:
        raise HTTPException(status_code=400, detail="Caption is required")

    media_url = str(imageurl or "").strip() or await _save_upload(file)
    now = datetime.utcnow()
    status = "pending"
    published_at = None
    if publish_mode == "draft":
        status = "pending"
    elif publish_mode == "schedule" and scheduled_at:
        status = "pending"
    else:
        status = "success"
        published_at = now

    title = caption[:48] + ("…" if len(caption) > 48 else "")
    doc = {
        "title": title,
        "caption": caption,
        "post_type": post_type if post_type in ("image", "video") else "image",
        "imageurl": media_url,
        "platforms": [str(p) for p in platform_list],
        "status": status,
        "scheduled_at": scheduled_at,
        "created_at": now,
        "published_at": published_at,
    }
    result = await automation_posts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"status": "success", "data": format_automation_post(doc)}


@router.post("/automation/posts/{post_id}/publish")
async def publish_automation_post(post_id: str):
    oid = _oid(post_id)
    doc = await automation_posts_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    now = datetime.utcnow()
    await automation_posts_collection.update_one(
        {"_id": oid},
        {"$set": {"status": "success", "published_at": now}},
    )
    doc["status"] = "success"
    doc["published_at"] = now
    return {"status": "success", "data": format_automation_post(doc)}


@router.patch("/automation/posts/{post_id}/status")
async def patch_automation_status(post_id: str, status: str = Query(...)):
    key = str(status or "").lower()
    if key not in ("success", "pending", "failed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    oid = _oid(post_id)
    patch: Dict[str, Any] = {"status": key}
    if key == "success":
        patch["published_at"] = datetime.utcnow()
    result = await automation_posts_collection.update_one({"_id": oid}, {"$set": patch})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Post not found")
    doc = await automation_posts_collection.find_one({"_id": oid})
    return {"status": "success", "data": format_automation_post(doc or {})}


@router.delete("/automation/posts/{post_id}")
async def delete_automation_post(post_id: str):
    oid = _oid(post_id)
    result = await automation_posts_collection.delete_one({"_id": oid})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": "success", "deleted": True}


@router.get("/automation/settings")
async def get_automation_settings():
    doc = await automation_settings_collection.find_one({"_id": SETTINGS_ID})
    platforms = (doc or {}).get("platforms") or {key: True for key in DEFAULT_PLATFORMS}
    return {"status": "success", "platforms": platforms, "available": DEFAULT_PLATFORMS}


@router.put("/automation/settings")
async def update_automation_settings(body: SettingsBody):
    await automation_settings_collection.update_one(
        {"_id": SETTINGS_ID},
        {"$set": {"platforms": body.platforms, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"status": "success", "platforms": body.platforms}


@router.post("/automation/generate-caption")
async def generate_automation_caption(body: GenerateBody):
    seed = str(body.text or body.prompt or "").strip()
    if not seed:
        raise HTTPException(status_code=400, detail="Provide text or prompt")
    enhanced = await enhance_social_post(seed, "POST")
    if not enhanced:
        enhanced = f"{seed}\n\n#EventThon #Automation #VerifiedNetwork"
    return {"status": "success", "caption": enhanced}
