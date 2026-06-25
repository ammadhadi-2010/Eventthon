"""Employer-only notification feed for company hub."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends

from database import notification_collection

from .alerts_helpers import enrich_alerts_images, verify_alerts_owner

router = APIRouter()

EMPLOYER_CATEGORIES = ("applications", "verification", "hiring", "company", "jobs")


def _employer_query(user_ref: str) -> dict:
    return {
        "user_ref": user_ref,
        "$or": [{"audience": "employer"}, {"category": {"$in": list(EMPLOYER_CATEGORIES)}}],
    }


@router.get("/employer-feed/{identifier}")
async def employer_alert_feed(identifier: str, user: dict = Depends(verify_alerts_owner)):
    user_ref = str(user["_id"])
    query = _employer_query(user_ref)
    cursor = notification_collection.find(query).sort("created_at", -1).limit(80)
    raw = [doc async for doc in cursor]
    data = await enrich_alerts_images(raw)
    return {"status": "success", "data": data}


@router.get("/employer-stats/{identifier}")
async def employer_alert_stats(identifier: str, user: dict = Depends(verify_alerts_owner)):
    user_ref = str(user["_id"])
    query = _employer_query(user_ref)
    total = await notification_collection.count_documents(query)
    unread = await notification_collection.count_documents({**query, "is_read": False})
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today = await notification_collection.count_documents({**query, "created_at": {"$gte": today_start}})
    high_priority = await notification_collection.count_documents(
        {**query, "priority": "high", "is_read": False}
    )
    return {
        "status": "success",
        "data": {"total": total, "unread": unread, "today": today, "high_priority": high_priority},
    }


@router.get("/employer-categories/{identifier}")
async def employer_alert_categories(identifier: str, user: dict = Depends(verify_alerts_owner)):
    user_ref = str(user["_id"])
    base = _employer_query(user_ref)
    defs = [
        ("all", "All employer alerts", {}),
        ("applications", "Applications", {"category": "applications"}),
        ("verification", "Verification", {"category": "verification"}),
        ("hiring", "Hiring", {"category": "hiring"}),
    ]
    data = []
    for key, label, extra in defs:
        if key == "all":
            q = base
        else:
            q = {"user_ref": user_ref, "audience": "employer", "category": extra["category"]}
        count = await notification_collection.count_documents(q)
        data.append({"key": key, "label": label, "count": count, "active": key == "all"})
    return {"status": "success", "data": data}
