"""Admin blog broadcast — notify / message all platform users about a post."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import (
    admin_candidate_messages_collection,
    footer_resources_collection,
    user_collection,
)

from backend_routes.alerts.alert_factory import push_alert
from backend_routes.admin.admin_chat_helpers import ADMIN_ACTOR

router = APIRouter(prefix="/blog", tags=["Admin Blog Broadcast"])

MAX_FANOUT = 5000


class BlogBroadcastBody(BaseModel):
    resource_id: Optional[str] = Field(default=None, max_length=64)
    title: str = Field(default="", max_length=200)
    message: str = Field(..., min_length=1, max_length=4000)
    audience: str = Field(default="all", pattern="^(all|members|employers)$")
    send_chat: bool = True
    send_alert: bool = True


def _user_key(user: dict) -> str:
    email = str(user.get("email") or "").strip().lower()
    if email:
        return email
    mobile = str(user.get("mobile") or "").strip()
    if mobile:
        return mobile
    return str(user.get("_id") or user.get("user_id") or "").strip()


def _is_employer(user: dict) -> bool:
    role = str(user.get("role") or user.get("account_type") or "").strip().lower()
    return role in {"employer", "company", "admin-company", "business"}


@router.post("/broadcast")
async def broadcast_blog_message(payload: BlogBroadcastBody):
    title = payload.title.strip()
    message = payload.message.strip()
    action_url = "/resources/blog"
    blog_title = title

    if payload.resource_id and ObjectId.is_valid(payload.resource_id):
        doc = await footer_resources_collection.find_one({"_id": ObjectId(payload.resource_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Blog post not found")
        if str(doc.get("category") or "") != "Blog":
            raise HTTPException(status_code=400, detail="Resource is not a Blog post")
        blog_title = str(doc.get("title") or title or "New blog post").strip()
        if not title:
            title = f"New on EventThon Blog: {blog_title}"
        slug = str(doc.get("slug") or "").strip()
        if slug:
            action_url = f"/resources/blog?post={slug}"
    elif not title:
        title = "Message from EventThon"

    if not payload.send_alert and not payload.send_chat:
        raise HTTPException(status_code=400, detail="Enable alert or chat delivery")

    audience = payload.audience.strip().lower()
    query = {}
    if audience == "members":
        query = {"role": {"$nin": ["employer", "company", "admin", "superadmin"]}}
    elif audience == "employers":
        query = {
            "$or": [
                {"role": {"$in": ["employer", "company", "business"]}},
                {"account_type": {"$in": ["employer", "company", "business"]}},
            ]
        }

    cursor = user_collection.find(query, {"email": 1, "mobile": 1, "_id": 1, "user_id": 1, "role": 1, "account_type": 1}).limit(
        MAX_FANOUT
    )
    alert_count = 0
    chat_count = 0
    skipped = 0
    now = datetime.utcnow()
    seen = set()

    async for user in cursor:
        key = _user_key(user)
        if not key or key in seen:
            skipped += 1
            continue
        seen.add(key)
        role = str(user.get("role") or "").strip().lower()
        if role in {"admin", "superadmin"}:
            skipped += 1
            continue

        if payload.send_alert:
            alert_id = await push_alert(
                recipient_identifier=key,
                category="system",
                title=title,
                message=message[:280],
                details=message,
                actor_name="EventThon Admin",
                priority="medium",
                action_label="Open blog",
                action_url=action_url,
                audience="employer" if _is_employer(user) else "member",
            )
            if alert_id:
                alert_count += 1

        if payload.send_chat:
            await admin_candidate_messages_collection.insert_one(
                {
                    "thread_user_id": key,
                    "from_user_id": ADMIN_ACTOR,
                    "from_role": "admin",
                    "from_user_name": "EventThon Admin",
                    "body": message,
                    "status": "sent",
                    "delivery_status": "sent",
                    "attachments": [],
                    "blog_resource_id": str(payload.resource_id or ""),
                    "blog_title": blog_title,
                    "created_at": now,
                }
            )
            chat_count += 1

    return {
        "status": "success",
        "title": title,
        "audience": audience,
        "recipients": len(seen),
        "alert_count": alert_count,
        "chat_count": chat_count,
        "skipped": skipped,
        "action_url": action_url,
    }
