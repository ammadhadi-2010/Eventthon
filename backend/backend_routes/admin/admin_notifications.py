"""Admin notification bundle — enterprise alert center APIs."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException

from database import admin_alert_reads_collection

from .admin_notifications_helpers import build_admin_alert_feed, build_category_filters, build_stats

router = APIRouter(prefix="/notifications", tags=["Admin Notifications"])

ADMIN_READ_SCOPE = "platform-admin"


async def _read_id_set() -> set[str]:
    ids: set[str] = set()
    cursor = admin_alert_reads_collection.find({"scope": ADMIN_READ_SCOPE})
    async for doc in cursor:
        aid = str(doc.get("alert_id") or "").strip()
        if aid:
            ids.add(aid)
    return ids


@router.get("/stats")
async def admin_notification_stats():
    read_ids = await _read_id_set()
    feed = await build_admin_alert_feed(read_ids)
    return {"status": "success", "data": build_stats(feed)}


@router.get("/feed")
async def admin_notification_feed():
    read_ids = await _read_id_set()
    feed = await build_admin_alert_feed(read_ids)
    return {"status": "success", "data": feed}


@router.get("/categories")
async def admin_notification_categories():
    read_ids = await _read_id_set()
    feed = await build_admin_alert_feed(read_ids)
    return {"status": "success", "data": build_category_filters(feed)}


@router.get("/bundle")
async def admin_notification_bundle():
    read_ids = await _read_id_set()
    feed = await build_admin_alert_feed(read_ids)
    return {
        "status": "success",
        "stats": build_stats(feed),
        "feed": feed,
        "categories": build_category_filters(feed),
    }


@router.post("/mark-read/{alert_id}")
async def admin_mark_alert_read(alert_id: str):
    key = alert_id.strip()
    if not key:
        raise HTTPException(status_code=400, detail="alert_id is required")
    await admin_alert_reads_collection.update_one(
        {"scope": ADMIN_READ_SCOPE, "alert_id": key},
        {"$set": {"scope": ADMIN_READ_SCOPE, "alert_id": key, "read_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"status": "success"}


@router.post("/mark-all-read")
async def admin_mark_all_read():
    read_ids = await _read_id_set()
    feed = await build_admin_alert_feed(read_ids)
    now = datetime.utcnow()
    for row in feed:
        if row.get("is_read"):
            continue
        await admin_alert_reads_collection.update_one(
            {"scope": ADMIN_READ_SCOPE, "alert_id": row["_id"]},
            {"$set": {"scope": ADMIN_READ_SCOPE, "alert_id": row["_id"], "read_at": now}},
            upsert=True,
        )
    return {"status": "success"}
