"""Make.com webhook publish for social automation."""
from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from database import automation_posts_collection
from .automation_format import format_automation_post
from .automation_management import _save_upload

router = APIRouter(tags=["Automation Publish"])

MAKE_WEBHOOK_URL = os.getenv(
    "MAKE_COM_WEBHOOK_URL",
    "https://hook.us1.make.com/placeholder_id",
)
WEBHOOK_TIMEOUT = float(os.getenv("MAKE_COM_WEBHOOK_TIMEOUT", "30"))


class PublishBody(BaseModel):
    caption: str = Field(..., min_length=1, max_length=8000)
    image_url: Optional[str] = Field(None, max_length=4000)
    platforms: List[str] = Field(..., min_length=1)

    @field_validator("platforms")
    @classmethod
    def normalize_platforms(cls, value: List[str]) -> List[str]:
        cleaned = [str(item).strip().lower() for item in value if str(item).strip()]
        if not cleaned:
            raise ValueError("Select at least one platform")
        return cleaned


def _absolute_media_url(url: str, request: Request) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    if raw.startswith(("http://", "https://", "data:")):
        return raw
    base = str(request.base_url).rstrip("/")
    return f"{base}{raw if raw.startswith('/') else f'/{raw}'}"


async def _forward_to_make(payload: Dict[str, Any]) -> None:
    async with httpx.AsyncClient(timeout=WEBHOOK_TIMEOUT) as client:
        response = await client.post(MAKE_WEBHOOK_URL, json=payload)
        response.raise_for_status()


async def _persist_published_post(caption: str, image_url: str, platforms: List[str]) -> Dict[str, Any]:
    now = datetime.utcnow()
    title = caption[:48] + ("…" if len(caption) > 48 else "")
    doc = {
        "title": title,
        "caption": caption,
        "post_type": "image" if image_url else "text",
        "imageurl": image_url,
        "platforms": platforms,
        "status": "success",
        "scheduled_at": None,
        "created_at": now,
        "published_at": now,
    }
    result = await automation_posts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return format_automation_post(doc)


async def _parse_publish_request(request: Request) -> tuple[str, List[str], str, Any]:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        caption = str(form.get("caption") or "").strip()
        try:
            platforms = json.loads(form.get("platforms") or "[]")
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail="Invalid platforms payload") from exc
        image_url = str(form.get("image_url") or "").strip()
        upload = form.get("file")
        return caption, platforms, image_url, upload

    body = PublishBody(**await request.json())
    return body.caption.strip(), body.platforms, str(body.image_url or "").strip(), None


@router.post("/publish")
async def publish_automation(request: Request):
    caption, platforms, image_url, upload = await _parse_publish_request(request)
    if not caption:
        raise HTTPException(status_code=400, detail="Caption is required")
    if not isinstance(platforms, list) or not platforms:
        raise HTTPException(status_code=400, detail="Select at least one platform")

    if upload is not None and getattr(upload, "filename", None):
        image_url = await _save_upload(upload) or image_url

    resolved_url = _absolute_media_url(image_url, request)
    payload = {
        "caption": caption,
        "image_url": resolved_url or None,
        "platforms": [str(item) for item in platforms],
    }

    try:
        await _forward_to_make(payload)
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=502,
            detail="Make.com webhook timed out. Please try again shortly.",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Make.com webhook failed with status {exc.response.status_code}.",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not reach Make.com webhook. Check your connection and webhook URL.",
        ) from exc

    saved = await _persist_published_post(caption, resolved_url, payload["platforms"])
    return {
        "status": "success",
        "message": "Post sent to Make.com for publishing.",
        "data": saved,
    }
