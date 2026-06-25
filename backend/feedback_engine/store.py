"""MongoDB persistence for beta feedback reports."""
from __future__ import annotations

import logging
from datetime import datetime

from database import feedbacks_collection

logger = logging.getLogger(__name__)

_INDEX_READY = False


async def ensure_feedback_indexes() -> None:
    global _INDEX_READY
    if _INDEX_READY:
        return
    await feedbacks_collection.create_index([("created_at", -1)], name="feedback_created_at")
    await feedbacks_collection.create_index([("type", 1), ("created_at", -1)], name="feedback_type_created")
    await feedbacks_collection.create_index([("user_id", 1), ("created_at", -1)], name="feedback_user_created")
    _INDEX_READY = True
    logger.info("Feedback report indexes are ready.")


def build_feedback_document(payload: dict) -> dict:
    now = datetime.utcnow()
    client_device = payload.get("client_device") if isinstance(payload.get("client_device"), dict) else {}
    return {
        "type": payload["type"],
        "description": payload["description"],
        "page_url": payload["page_url"],
        "imageurl": str(payload.get("imageurl") or "").strip() or None,
        "client_device": client_device,
        "user_id": str(payload.get("user_id") or "").strip() or None,
        "user_email": str(payload.get("user_email") or "").strip().lower() or None,
        "user_mobile": str(payload.get("user_mobile") or "").strip() or None,
        "status": "New",
        "source": "enterprise_feedback",
        "created_at": now,
        "updated_at": now,
    }


async def insert_feedback_report(document: dict) -> str:
    result = await feedbacks_collection.insert_one(document)
    return str(result.inserted_id)


def serialize_feedback_row(doc: dict) -> dict:
    created = doc.get("created_at")
    updated = doc.get("updated_at")
    replied = doc.get("replied_at")
    return {
        "id": str(doc.get("_id") or ""),
        "type": doc.get("type") or "bug",
        "description": doc.get("description") or "",
        "page_url": doc.get("page_url") or "",
        "imageurl": doc.get("imageurl"),
        "screenshot_imageurl": doc.get("imageurl"),
        "client_device": doc.get("client_device") or {},
        "status": doc.get("status") or "New",
        "user_id": doc.get("user_id"),
        "user_email": doc.get("user_email"),
        "user_mobile": doc.get("user_mobile"),
        "admin_reply": doc.get("admin_reply"),
        "replied_at": replied.isoformat() if hasattr(replied, "isoformat") else replied,
        "created_at": created.isoformat() if hasattr(created, "isoformat") else created,
        "updated_at": updated.isoformat() if hasattr(updated, "isoformat") else updated,
    }


async def list_feedback_reports(limit: int = 100, *, enrich: bool = False) -> list[dict]:
    from .reporter import enrich_feedback_row

    rows: list[dict] = []
    cursor = feedbacks_collection.find({}).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        row = serialize_feedback_row(doc)
        rows.append(await enrich_feedback_row(row) if enrich else row)
    return rows


async def find_feedback_report(report_id: str) -> dict | None:
    from bson import ObjectId

    oid = ObjectId(report_id) if ObjectId.is_valid(report_id) else None
    if not oid:
        return None
    doc = await feedbacks_collection.find_one({"_id": oid})
    return doc if doc else None


async def apply_feedback_reply(report_id: str, reply_message: str, admin_name: str) -> dict | None:
    from bson import ObjectId

    oid = ObjectId(report_id) if ObjectId.is_valid(report_id) else None
    if not oid:
        return None
    now = datetime.utcnow()
    await feedbacks_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "Resolved",
                "admin_reply": reply_message,
                "admin_name": admin_name,
                "replied_at": now,
                "updated_at": now,
            }
        },
    )
    doc = await feedbacks_collection.find_one({"_id": oid})
    return serialize_feedback_row(doc) if doc else None


async def apply_feedback_resolve(report_id: str) -> dict | None:
    from bson import ObjectId

    oid = ObjectId(report_id) if ObjectId.is_valid(report_id) else None
    if not oid:
        return None
    now = datetime.utcnow()
    await feedbacks_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "Resolved",
                "resolved_at": now,
                "updated_at": now,
                "resolution_source": "admin_solve",
            }
        },
    )
    doc = await feedbacks_collection.find_one({"_id": oid})
    return serialize_feedback_row(doc) if doc else None


async def apply_feedback_status(report_id: str, status: str) -> dict | None:
    from bson import ObjectId

    oid = ObjectId(report_id) if ObjectId.is_valid(report_id) else None
    if not oid:
        return None
    now = datetime.utcnow()
    patch = {"status": status, "updated_at": now}
    if status == "Resolved":
        patch["resolved_at"] = now
        patch["resolution_source"] = "admin_status"
    await feedbacks_collection.update_one({"_id": oid}, {"$set": patch})
    doc = await feedbacks_collection.find_one({"_id": oid})
    return serialize_feedback_row(doc) if doc else None
