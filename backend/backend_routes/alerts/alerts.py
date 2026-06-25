"""Member alerts API — session-scoped feed, stats, read state."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends

from database import comment_collection, notification_collection, post_collection

from .alerts_helpers import (
    enrich_alerts_images,
    serialize_alert,
    verify_alert_belongs_to_user,
    verify_alerts_owner,
    verify_alerts_owner_from_headers,
)
from .member_alerts_query import MEMBER_CATEGORY_DEFS, member_query

router = APIRouter(tags=["Alerts"])

__all__ = ["router", "feed_for_user", "get_related_posts_for_alert"]


def serialize_post(post: dict, comments: list[dict]) -> dict:
    post["_id"] = str(post["_id"])
    if isinstance(post.get("created_at"), datetime):
        post["created_at"] = post["created_at"].isoformat()
    for comment in comments:
        comment["_id"] = str(comment["_id"])
        if isinstance(comment.get("created_at"), datetime):
            comment["created_at"] = comment["created_at"].isoformat()
    post["comments"] = comments
    post["comments_count"] = post.get("comments_count", len(comments))
    return post


async def get_related_posts_for_alert(doc: dict) -> list[dict]:
    actor_name = doc.get("actor_name")
    query = {"author_name": actor_name} if actor_name else {"user_id": doc.get("user_ref")}
    if not actor_name and not doc.get("user_ref"):
        return []
    posts = await post_collection.find(query).sort("created_at", -1).limit(10).to_list(length=10)
    out = []
    for post in posts:
        post_id = str(post["_id"])
        comments = await comment_collection.find({"post_id": post_id}).sort("created_at", 1).to_list(length=20)
        out.append(serialize_post(post, comments))
    return out


async def feed_for_user(user: dict) -> list[dict]:
    user_ref = str(user["_id"])
    cursor = notification_collection.find(member_query(user_ref)).sort("created_at", -1).limit(80)
    raw = [doc async for doc in cursor]
    return await enrich_alerts_images(raw)


async def _member_stats(user_ref: str) -> dict:
    base = member_query(user_ref)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return {
        "total": await notification_collection.count_documents(base),
        "unread": await notification_collection.count_documents({**base, "is_read": False}),
        "today": await notification_collection.count_documents({**base, "created_at": {"$gte": today_start}}),
        "high_priority": await notification_collection.count_documents({**base, "priority": "high"}),
    }


async def _member_categories(user_ref: str) -> list[dict]:
    rows = []
    for key, label, extra in MEMBER_CATEGORY_DEFS:
        count = await notification_collection.count_documents(member_query(user_ref, extra))
        rows.append({"key": key, "label": label, "count": count, "active": key == "all"})
    return rows


@router.get("/bundle/{identifier}")
async def get_alerts_bundle(identifier: str, user: dict = Depends(verify_alerts_owner)):
    """Single round-trip for navbar badge + alert center (stats, feed, categories)."""
    user_ref = str(user["_id"])
    return {
        "status": "success",
        "data": {
            "stats": await _member_stats(user_ref),
            "feed": await feed_for_user(user),
            "categories": await _member_categories(user_ref),
        },
    }


@router.get("/feed/{identifier}")
async def get_alert_feed(identifier: str, user: dict = Depends(verify_alerts_owner)):
    return {"status": "success", "data": await feed_for_user(user)}


@router.get("/stats/{identifier}")
async def get_alert_stats(identifier: str, user: dict = Depends(verify_alerts_owner)):
    return {"status": "success", "data": await _member_stats(str(user["_id"]))}


@router.get("/categories/{identifier}")
async def get_alert_categories(identifier: str, user: dict = Depends(verify_alerts_owner)):
    return {"status": "success", "data": await _member_categories(str(user["_id"]))}


@router.get("/item/{alert_id}")
async def get_alert_item(
    alert_id: str,
    user: dict = Depends(verify_alerts_owner_from_headers),
):
    doc = await verify_alert_belongs_to_user(alert_id, user)
    rows = await enrich_alerts_images([doc])
    serialized = rows[0] if rows else serialize_alert(doc)
    serialized["related_posts"] = await get_related_posts_for_alert(doc)
    return {"status": "success", "data": serialized}


async def _mark_one_read(alert_id: str, user: dict) -> dict:
    doc = await verify_alert_belongs_to_user(alert_id, user)
    await notification_collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}},
    )
    updated = await notification_collection.find_one({"_id": doc["_id"]})
    rows = await enrich_alerts_images([updated])
    return rows[0] if rows else serialize_alert(updated)


@router.post("/mark-read/{alert_id}")
async def mark_alert_read_post(
    alert_id: str,
    user: dict = Depends(verify_alerts_owner_from_headers),
):
    return {"status": "success", "data": await _mark_one_read(alert_id, user)}


@router.put("/mark-read/{alert_id}")
async def mark_alert_read_put(
    alert_id: str,
    user: dict = Depends(verify_alerts_owner_from_headers),
):
    return {"status": "success", "data": await _mark_one_read(alert_id, user)}


@router.post("/mark-all-read/{identifier}")
async def mark_all_alerts_read(identifier: str, user: dict = Depends(verify_alerts_owner)):
    user_ref = str(user["_id"])
    result = await notification_collection.update_many(
        {**member_query(user_ref), "is_read": False},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}},
    )
    return {
        "status": "success",
        "message": "Alerts marked as read",
        "modified_count": result.modified_count,
    }
