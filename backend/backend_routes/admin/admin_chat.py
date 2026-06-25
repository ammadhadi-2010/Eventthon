"""Super Admin dual-channel chat — company support and user/candidate inbox."""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import (
    admin_candidate_messages_collection,
    company_support_messages_collection,
    gig_contact_messages_collection,
    job_contact_messages_collection,
    project_contact_messages_collection,
)

from .admin_chat_helpers import (
    ADMIN_ACTOR,
    is_candidate_message,
    resolve_company_thread,
    resolve_user_thread,
    serialize_chat_message,
    sort_messages,
)

router = APIRouter(prefix="/chat", tags=["Admin Chat"])

CANDIDATE_SOURCES = (
    job_contact_messages_collection,
    gig_contact_messages_collection,
    project_contact_messages_collection,
)


class AdminChatSendBody(BaseModel):
    channel: str = Field(..., pattern="^(company_support|user_candidate)$")
    thread_key: str = Field(..., min_length=2, max_length=120)
    body: str = Field(..., min_length=1, max_length=4000)


async def _company_thread_heads() -> List[dict]:
    cursor = company_support_messages_collection.find({}).sort("created_at", -1).limit(800)
    buckets: Dict[str, dict] = {}
    async for doc in cursor:
        key = str(doc.get("employer_user_id") or "").strip()
        if not key or key in buckets:
            continue
        meta = await resolve_company_thread(key)
        preview_doc = doc
        unread = await company_support_messages_collection.count_documents(
            {
                "employer_user_id": key,
                "status": "new",
                "from_user_id": {"$nin": [ADMIN_ACTOR, "eventthon-admin-support"]},
            }
        )
        buckets[key] = {
            **meta,
            "preview": str(preview_doc.get("body") or "")[:120],
            "last_at": preview_doc.get("created_at"),
            "unread_count": unread,
        }
    rows = list(buckets.values())
    rows.sort(key=lambda r: r.get("last_at") or datetime.min, reverse=True)
    return rows


async def _candidate_thread_heads() -> List[dict]:
    buckets: Dict[str, dict] = {}
    for collection in CANDIDATE_SOURCES:
        cursor = collection.find({}).sort("created_at", -1).limit(400)
        async for doc in cursor:
            key = str(doc.get("from_user_id") or "").strip()
            if not key or not is_candidate_message(doc) or key in buckets:
                continue
            meta = await resolve_user_thread(key)
            unread = 0
            for col in CANDIDATE_SOURCES:
                unread += await col.count_documents({"from_user_id": key, "status": "new"})
            buckets[key] = {
                **meta,
                "preview": str(doc.get("body") or doc.get("message") or "")[:120],
                "last_at": doc.get("created_at"),
                "unread_count": unread,
            }
    cursor = admin_candidate_messages_collection.find({}).sort("created_at", -1).limit(200)
    async for doc in cursor:
        key = str(doc.get("thread_user_id") or "").strip()
        if not key or key in buckets:
            continue
        meta = await resolve_user_thread(key)
        buckets[key] = {
            **meta,
            "preview": str(doc.get("body") or "")[:120],
            "last_at": doc.get("created_at"),
            "unread_count": 0,
        }
    rows = list(buckets.values())
    rows.sort(key=lambda r: r.get("last_at") or datetime.min, reverse=True)
    return rows


@router.get("/threads")
async def list_admin_chat_threads(channel: str = Query(...)):
    channel_key = (channel or "").strip().lower()
    if channel_key == "company_support":
        data = await _company_thread_heads()
    elif channel_key == "user_candidate":
        data = await _candidate_thread_heads()
    else:
        raise HTTPException(status_code=400, detail="channel must be company_support or user_candidate")
    return {"status": "success", "threads": data}


@router.get("/messages")
async def list_admin_chat_messages(
    channel: str = Query(...),
    thread_key: str = Query(..., min_length=2, max_length=120),
):
    channel_key = (channel or "").strip().lower()
    key = thread_key.strip()
    rows: List[dict] = []

    if channel_key == "company_support":
        cursor = company_support_messages_collection.find({"employer_user_id": key}).sort("created_at", 1)
        async for doc in cursor:
            rows.append(serialize_chat_message(doc, channel_key, key))
        await company_support_messages_collection.update_many(
            {
                "employer_user_id": key,
                "status": "new",
                "from_user_id": {"$nin": [ADMIN_ACTOR, "eventthon-admin-support"]},
            },
            {"$set": {"status": "read"}},
        )
    elif channel_key == "user_candidate":
        for collection in CANDIDATE_SOURCES:
            cursor = collection.find({"from_user_id": key}).sort("created_at", 1)
            async for doc in cursor:
                rows.append(serialize_chat_message(doc, channel_key, key))
        cursor = admin_candidate_messages_collection.find({"thread_user_id": key}).sort("created_at", 1)
        async for doc in cursor:
            rows.append(serialize_chat_message(doc, channel_key, key))
        for collection in CANDIDATE_SOURCES:
            await collection.update_many(
                {"from_user_id": key, "status": "new"},
                {"$set": {"status": "read"}},
            )
    else:
        raise HTTPException(status_code=400, detail="Invalid channel")

    return {"status": "success", "messages": sort_messages(rows)}


@router.post("/send")
async def send_admin_chat_message(payload: AdminChatSendBody):
    channel_key = payload.channel.strip().lower()
    key = payload.thread_key.strip()
    body = payload.body.strip()
    now = datetime.utcnow()

    if channel_key == "company_support":
        await company_support_messages_collection.insert_one(
            {
                "employer_user_id": key,
                "thread_kind": "admin_support",
                "thread_id": f"support-{key}",
                "from_user_id": ADMIN_ACTOR,
                "from_user_name": "EventThon Admin",
                "body": body,
                "status": "sent",
                "created_at": now,
            }
        )
    elif channel_key == "user_candidate":
        await admin_candidate_messages_collection.insert_one(
            {
                "thread_user_id": key,
                "from_user_id": ADMIN_ACTOR,
                "from_role": "admin",
                "body": body,
                "status": "sent",
                "created_at": now,
            }
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid channel")

    return {"status": "success", "created_at": now.isoformat()}
