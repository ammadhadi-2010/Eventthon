"""Chat send alias: POST /api/chat/send-message (session-scoped)."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from database import (
    gig_contact_messages_collection,
    job_contact_messages_collection,
    project_contact_messages_collection,
)

from .helpers import _collection_by_chat_type, _resolve_user_name, _serialize_unified_contact
from .message_delete import hard_delete_owned_message
from .messages_session import assert_sender_owner, verify_messages_session
from .schemas import ChatSendPayload

router = APIRouter()


@router.post("/send-message")
async def send_chat_message(
    payload: ChatSendPayload,
    user: dict = Depends(verify_messages_session),
):
    body = (payload.body or "").strip()
    attachments = payload.attachments or []
    if not body and not attachments:
        raise HTTPException(status_code=400, detail="Message body or attachment required")
    if not body:
        body = "Attachment"

    await assert_sender_owner(payload.from_user_id, user)
    _, chat_type = _collection_by_chat_type(payload.chat_type)

    collection_map = {
        "gig": gig_contact_messages_collection,
        "job": job_contact_messages_collection,
        "project": project_contact_messages_collection,
    }
    id_key_map = {"gig": "gig_id", "job": "job_id", "project": "project_id"}
    title_key_map = {"gig": "gig_title", "job": "job_title", "project": "project_title"}
    collection = collection_map[chat_type]
    context_id = payload.context_id.strip()

    doc = {
        "seller_user_id": payload.seller_user_id.strip(),
        "from_user_id": payload.from_user_id.strip(),
        title_key_map[chat_type]: payload.context_title.strip() or "New Conversation",
        "body": body,
        "status": "new",
        "delivery_status": "sent",
        "attachments": attachments,
        "reply_to_id": payload.reply_to_id.strip(),
        "message_type": (payload.message_type or "text").strip().lower(),
        "reaction": "",
        "starred": False,
        "deleted": False,
        "created_at": datetime.utcnow(),
    }
    if context_id:
        doc[id_key_map[chat_type]] = context_id

    result = await collection.insert_one(doc)
    from_name = await _resolve_user_name(payload.from_user_id.strip(), {})
    serialized = _serialize_unified_contact({**doc, "_id": result.inserted_id}, chat_type, from_name)
    serialized.pop("_sort_created_at", None)
    return {"status": "success", "id": str(result.inserted_id), "message": serialized}


@router.delete("/message/{message_id}", status_code=204)
async def delete_chat_message(
    message_id: str,
    chat_type: str = Query(..., min_length=3, max_length=20),
    user: dict = Depends(verify_messages_session),
):
    await hard_delete_owned_message(message_id, chat_type, user)
    return Response(status_code=204)
