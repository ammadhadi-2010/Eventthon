from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from .helpers import _collection_by_chat_type
from .message_delete import hard_delete_owned_message
from .messages_session import verify_messages_session
from .schemas import UnifiedMessageActionPayload

router = APIRouter()


@router.post("/unified-action")
async def update_unified_message_action(
    payload: UnifiedMessageActionPayload,
    user: dict = Depends(verify_messages_session),
):
    collection, chat_type = _collection_by_chat_type(payload.chat_type)
    raw_id = payload.message_id.strip()
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid message_id")

    action = payload.action.strip().lower()
    value = payload.value.strip()
    if action not in {"star", "react", "delete"}:
        raise HTTPException(status_code=400, detail="action must be one of: star, react, delete")

    if action == "delete":
        await hard_delete_owned_message(raw_id, chat_type, user)
        return {"status": "success", "id": raw_id, "chat_type": chat_type, "action": action, "deleted": True}

    update_set = {}
    if action == "star":
        update_set["starred"] = value.lower() == "true"
    else:
        update_set["reaction"] = value

    result = await collection.update_one({"_id": ObjectId(raw_id)}, {"$set": update_set})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")

    return {"status": "success", "id": raw_id, "chat_type": chat_type, "action": action, "value": value}
