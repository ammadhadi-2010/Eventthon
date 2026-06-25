"""Hard-delete chat messages with session ownership checks."""
from __future__ import annotations

from bson import ObjectId
from fastapi import HTTPException

from .helpers import _collection_by_chat_type
from .messages_session import assert_sender_owner


async def hard_delete_owned_message(message_id: str, chat_type: str, user: dict) -> bool:
    raw_id = (message_id or "").strip()
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid message_id")

    collection, _ = _collection_by_chat_type(chat_type)
    doc = await collection.find_one({"_id": ObjectId(raw_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Message not found")

    from_uid = str(doc.get("from_user_id") or doc.get("sender_user_id") or "").strip()
    if not from_uid:
        raise HTTPException(status_code=403, detail="Message has no sender")
    await assert_sender_owner(from_uid, user)

    result = await collection.delete_one({"_id": ObjectId(raw_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return True
