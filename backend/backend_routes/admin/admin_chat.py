"""Super Admin dual-channel chat — company support and user/candidate inbox."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from database import (
    admin_candidate_messages_collection,
    company_support_messages_collection,
    gig_contact_messages_collection,
    job_contact_messages_collection,
    project_contact_messages_collection,
)

from backend_routes.messages.helpers import MESSAGE_UPLOAD_DIR
from backend_routes.messages.routes_upload import ALLOWED_EXT, MAX_BYTES, classify_attachment

from .admin_chat_helpers import (
    ADMIN_ACTOR,
    employer_match_query,
    identity_match_query,
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

QUICK_REPLIES = [
    "Thanks for reaching out — we're looking into this now.",
    "Your verification is under review. We'll update you shortly.",
    "Please share your company email and registration details.",
    "This is resolved on our side. Let us know if you need anything else.",
]


class AdminChatSendBody(BaseModel):
    channel: str = Field(..., pattern="^(company_support|user_candidate)$")
    thread_key: str = Field(..., min_length=2, max_length=120)
    body: str = Field(default="", max_length=4000)
    attachments: List[Dict[str, Any]] = Field(default_factory=list)


def _newer(a, b) -> bool:
    left = a or datetime.min
    right = b or datetime.min
    if not isinstance(left, datetime):
        try:
            left = datetime.fromisoformat(str(left).replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            left = datetime.min
    if not isinstance(right, datetime):
        try:
            right = datetime.fromisoformat(str(right).replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            right = datetime.min
    return left >= right


async def _company_thread_heads() -> List[dict]:
    cursor = company_support_messages_collection.find({}).sort("created_at", -1).limit(1200)
    buckets: Dict[str, dict] = {}
    resolve_cache: Dict[str, dict] = {}

    async def meta_for(raw_key: str) -> dict:
        low = raw_key.lower()
        if low in resolve_cache:
            return resolve_cache[low]
        meta = await resolve_company_thread(raw_key)
        resolve_cache[low] = meta
        for alias in meta.get("identity_keys") or []:
            resolve_cache[str(alias).strip().lower()] = meta
        canon = str(meta.get("canonical_key") or "").strip().lower()
        if canon:
            resolve_cache[canon] = meta
        return meta

    async for doc in cursor:
        key = str(doc.get("employer_user_id") or "").strip()
        if not key:
            continue
        meta = await meta_for(key)
        canonical = str(meta.get("canonical_key") or key).strip().lower()
        identities = list(meta.get("identity_keys") or [key])

        if canonical in buckets:
            current = buckets[canonical]
            merged_ids = list({*(current.get("identity_keys") or []), *identities, key})
            current["identity_keys"] = merged_ids
            if _newer(doc.get("created_at"), current.get("last_at")):
                current["preview"] = str(doc.get("body") or "")[:140]
                current["last_at"] = doc.get("created_at")
            continue

        buckets[canonical] = {
            **meta,
            "thread_key": meta.get("thread_key") or key,
            "identity_keys": list({*identities, key}),
            "preview": str(doc.get("body") or "")[:140],
            "last_at": doc.get("created_at"),
            "unread_count": 0,
            "message_count": 0,
        }

    for row in buckets.values():
        match_q = employer_match_query(row.get("thread_key"), row.get("identity_keys") or [])
        row["message_count"] = await company_support_messages_collection.count_documents(match_q)
        row["unread_count"] = await company_support_messages_collection.count_documents(
            {
                **match_q,
                "status": "new",
                "from_user_id": {"$nin": [ADMIN_ACTOR, "eventthon-admin-support"]},
            }
        )

    rows = list(buckets.values())
    rows.sort(key=lambda r: r.get("last_at") or datetime.min, reverse=True)
    return rows


async def _candidate_thread_heads() -> List[dict]:
    buckets: Dict[str, dict] = {}
    resolve_cache: Dict[str, dict] = {}

    async def meta_for(raw_key: str) -> dict:
        low = raw_key.lower()
        if low in resolve_cache:
            return resolve_cache[low]
        meta = await resolve_user_thread(raw_key)
        resolve_cache[low] = meta
        for alias in meta.get("identity_keys") or []:
            resolve_cache[str(alias).strip().lower()] = meta
        canon = str(meta.get("canonical_key") or "").strip().lower()
        if canon:
            resolve_cache[canon] = meta
        return meta

    async def upsert_candidate(key: str, preview: str, last_at) -> None:
        meta = await meta_for(key)
        canonical = str(meta.get("canonical_key") or key).strip().lower()
        identities = list(meta.get("identity_keys") or [key])
        if canonical in buckets:
            current = buckets[canonical]
            current["identity_keys"] = list({*(current.get("identity_keys") or []), *identities, key})
            if _newer(last_at, current.get("last_at")):
                current["preview"] = preview[:140]
                current["last_at"] = last_at
            return
        buckets[canonical] = {
            **meta,
            "thread_key": meta.get("thread_key") or key,
            "identity_keys": list({*identities, key}),
            "preview": preview[:140],
            "last_at": last_at,
            "unread_count": 0,
            "message_count": 0,
        }

    for collection in CANDIDATE_SOURCES:
        cursor = collection.find({}).sort("created_at", -1).limit(500)
        async for doc in cursor:
            key = str(doc.get("from_user_id") or "").strip()
            if not key or not is_candidate_message(doc):
                continue
            await upsert_candidate(key, str(doc.get("body") or doc.get("message") or ""), doc.get("created_at"))

    cursor = admin_candidate_messages_collection.find({}).sort("created_at", -1).limit(300)
    async for doc in cursor:
        key = str(doc.get("thread_user_id") or "").strip()
        if not key:
            continue
        await upsert_candidate(key, str(doc.get("body") or ""), doc.get("created_at"))

    for row in buckets.values():
        ids = row.get("identity_keys") or [row.get("thread_key")]
        user_q = identity_match_query(ids, "from_user_id")
        unread = 0
        total = 0
        for col in CANDIDATE_SOURCES:
            unread += await col.count_documents({**user_q, "status": "new"})
            total += await col.count_documents(user_q)
        admin_q = identity_match_query(ids, "thread_user_id")
        total += await admin_candidate_messages_collection.count_documents(admin_q)
        row["unread_count"] = unread
        row["message_count"] = total

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
    return {"status": "success", "threads": data, "quick_replies": QUICK_REPLIES}


@router.get("/messages")
async def list_admin_chat_messages(
    channel: str = Query(...),
    thread_key: str = Query(..., min_length=2, max_length=120),
):
    channel_key = (channel or "").strip().lower()
    key = thread_key.strip()
    rows: List[dict] = []

    if channel_key == "company_support":
        meta = await resolve_company_thread(key)
        peer_name = meta.get("entity_name") or meta.get("profile_name") or key
        peer_image = meta.get("imageurl") or ""
        identities = meta.get("identity_keys") or [key]
        match_q = employer_match_query(meta.get("thread_key") or key, identities)
        cursor = company_support_messages_collection.find(match_q).sort("created_at", 1)
        async for doc in cursor:
            rows.append(
                serialize_chat_message(
                    doc, channel_key, meta.get("thread_key") or key,
                    peer_name=peer_name, peer_imageurl=peer_image,
                )
            )
        await company_support_messages_collection.update_many(
            {
                **match_q,
                "status": "new",
                "from_user_id": {"$nin": [ADMIN_ACTOR, "eventthon-admin-support"]},
            },
            {"$set": {"status": "read", "delivery_status": "read"}},
        )
        await company_support_messages_collection.update_many(
            {
                **match_q,
                "from_user_id": {"$in": [ADMIN_ACTOR, "eventthon-admin-support"]},
                "$or": [
                    {"delivery_status": "sent"},
                    {"delivery_status": {"$exists": False}},
                    {"delivery_status": ""},
                ],
            },
            {"$set": {"delivery_status": "delivered"}},
        )
    elif channel_key == "user_candidate":
        meta = await resolve_user_thread(key)
        peer_name = meta.get("entity_name") or meta.get("profile_name") or key
        peer_image = meta.get("imageurl") or ""
        identities = meta.get("identity_keys") or [key]
        user_q = identity_match_query(identities, "from_user_id")
        for collection in CANDIDATE_SOURCES:
            cursor = collection.find(user_q).sort("created_at", 1).limit(500)
            async for doc in cursor:
                rows.append(
                    serialize_chat_message(
                        doc, channel_key, meta.get("thread_key") or key,
                        peer_name=peer_name, peer_imageurl=peer_image,
                    )
                )
        admin_q = identity_match_query(identities, "thread_user_id")
        cursor = admin_candidate_messages_collection.find(admin_q).sort("created_at", 1)
        async for doc in cursor:
            rows.append(
                serialize_chat_message(
                    doc, channel_key, meta.get("thread_key") or key,
                    peer_name=peer_name, peer_imageurl=peer_image,
                )
            )
        for collection in CANDIDATE_SOURCES:
            await collection.update_many(
                {**user_q, "status": "new"},
                {"$set": {"status": "read", "delivery_status": "read"}},
            )
    else:
        raise HTTPException(status_code=400, detail="Invalid channel")

    return {
        "status": "success",
        "messages": sort_messages(rows),
        "thread": meta,
        "quick_replies": QUICK_REPLIES,
    }


@router.post("/upload")
async def upload_admin_chat_attachment(
    file: UploadFile = File(...),
    kind: str = Form("file"),
):
    MESSAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    original_name = (file.filename or "upload.bin").strip()
    safe_name = original_name.replace("\\", "_").replace("/", "_")
    suffix = Path(safe_name).suffix.lower()
    if suffix and suffix not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use images, video, PDF, Word, Excel, or ZIP.",
        )
    stored_name = f"{uuid4().hex}{suffix}"
    target = MESSAGE_UPLOAD_DIR / stored_name
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 40MB).")
    target.write_bytes(content)
    public_url = f"/static/uploads/messages/{stored_name}"
    category = classify_attachment(safe_name, kind)
    return {
        "status": "success",
        "attachment": {
            "name": safe_name,
            "url": public_url,
            "imageurl": public_url,
            "type": category,
            "kind": category,
            "size": len(content),
            "mime": str(file.content_type or ""),
        },
    }


@router.post("/send")
async def send_admin_chat_message(payload: AdminChatSendBody):
    channel_key = payload.channel.strip().lower()
    key = payload.thread_key.strip()
    body = payload.body.strip()
    attachments = [a for a in (payload.attachments or []) if isinstance(a, dict)]
    if not body and not attachments:
        raise HTTPException(status_code=400, detail="Message body or attachment required")
    if not body and attachments:
        body = "Attachment"
    now = datetime.utcnow()

    if channel_key == "company_support":
        meta = await resolve_company_thread(key)
        store_key = meta.get("email") or meta.get("thread_key") or key
        peer_name = meta.get("entity_name") or meta.get("profile_name") or store_key
        peer_image = meta.get("imageurl") or ""
        doc = {
            "employer_user_id": store_key,
            "thread_kind": "admin_support",
            "thread_id": f"support-{store_key}",
            "from_user_id": ADMIN_ACTOR,
            "from_user_name": "EventThon Admin",
            "body": body,
            "attachments": attachments,
            "status": "sent",
            "delivery_status": "sent",
            "created_at": now,
        }
        result = await company_support_messages_collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return {
            "status": "success",
            "created_at": now.isoformat(),
            "message": serialize_chat_message(
                doc, channel_key, store_key, peer_name=peer_name, peer_imageurl=peer_image,
            ),
        }
    if channel_key == "user_candidate":
        meta = await resolve_user_thread(key)
        store_key = meta.get("email") or meta.get("thread_key") or key
        peer_name = meta.get("entity_name") or meta.get("profile_name") or store_key
        peer_image = meta.get("imageurl") or ""
        doc = {
            "thread_user_id": store_key,
            "from_user_id": ADMIN_ACTOR,
            "from_role": "admin",
            "from_user_name": "EventThon Admin",
            "body": body,
            "attachments": attachments,
            "status": "sent",
            "delivery_status": "sent",
            "created_at": now,
        }
        result = await admin_candidate_messages_collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return {
            "status": "success",
            "created_at": now.isoformat(),
            "message": serialize_chat_message(
                doc, channel_key, store_key, peer_name=peer_name, peer_imageurl=peer_image,
            ),
        }

    raise HTTPException(status_code=400, detail="Invalid channel")
