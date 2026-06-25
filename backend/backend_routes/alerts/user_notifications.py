"""REST aliases: GET /api/notifications and PUT .../read (session headers)."""
from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends

from database import notification_collection

from .alerts import feed_for_user
from .alerts_helpers import (
    serialize_alert,
    verify_alert_belongs_to_user,
    verify_alerts_owner_from_headers,
    enrich_alerts_images,
)
from .member_alerts_query import member_query

router = APIRouter(tags=["Notifications"])


@router.get("")
async def list_notifications(user: dict = Depends(verify_alerts_owner_from_headers)):
    return {"status": "success", "data": await feed_for_user(user)}


@router.put("/{alert_id}/read")
async def mark_notification_read_put(
    alert_id: str,
    user: dict = Depends(verify_alerts_owner_from_headers),
):
    await verify_alert_belongs_to_user(alert_id, user)
    await notification_collection.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}},
    )
    updated = await notification_collection.find_one({"_id": ObjectId(alert_id)})
    rows = await enrich_alerts_images([updated])
    return {"status": "success", "data": rows[0] if rows else serialize_alert(updated)}


@router.post("/read-all")
async def mark_all_notifications_read(user: dict = Depends(verify_alerts_owner_from_headers)):
    user_ref = str(user["_id"])
    result = await notification_collection.update_many(
        {**member_query(user_ref), "is_read": False},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}},
    )
    return {
        "status": "success",
        "message": "Notifications marked as read",
        "modified_count": result.modified_count,
    }
