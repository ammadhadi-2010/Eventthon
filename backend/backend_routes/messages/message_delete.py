"""Hard-delete chat messages with session ownership / participant checks."""
from __future__ import annotations

from bson import ObjectId
from fastapi import HTTPException

from .helpers import _find_message_doc
from .messages_session import assert_sender_owner, user_session_ids


def _participant_ids(doc: dict) -> set[str]:
    keys = (
        "from_user_id",
        "sender_user_id",
        "to_user_id",
        "seller_user_id",
        "employer_user_id",
        "candidate_user_id",
        "recipient_user_id",
    )
    out: set[str] = set()
    for key in keys:
        val = str(doc.get(key) or "").strip()
        if val:
            out.add(val)
            out.add(val.lower())
    return out


async def _assert_can_delete(doc: dict, user: dict) -> None:
    """Sender can always delete; thread participants may delete in their inbox too."""
    from_uid = str(doc.get("from_user_id") or doc.get("sender_user_id") or "").strip()
    if from_uid:
        try:
            await assert_sender_owner(from_uid, user)
            return
        except HTTPException:
            pass

    allowed = user_session_ids(user)
    allowed_l = {str(x).strip().lower() for x in allowed}
    participants = _participant_ids(doc)
    if any(pid in allowed or pid.lower() in allowed_l for pid in participants):
        return
    raise HTTPException(status_code=403, detail="You can only delete messages in your conversations")


async def hard_delete_owned_message(message_id: str, chat_type: str, user: dict) -> bool:
    raw_id = (message_id or "").strip()
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid message_id")

    doc, found_type, collection = await _find_message_doc(raw_id, chat_type)
    if not doc or collection is None:
        raise HTTPException(status_code=404, detail="Message not found")

    await _assert_can_delete(doc, user)

    result = await collection.delete_one({"_id": ObjectId(raw_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return True
