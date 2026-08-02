from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from .helpers import _collection_by_chat_type, _find_message_doc
from .message_delete import hard_delete_owned_message
from .messages_session import user_session_ids, verify_messages_session
from .schemas import UnifiedMessageActionPayload

router = APIRouter()


def _primary_liker_id(user: dict) -> str:
    email = str(user.get("email") or "").strip().lower()
    if email:
        return email
    mobile = str(user.get("mobile") or "").strip()
    if mobile:
        return mobile
    return str(user.get("_id") or user.get("user_id") or "").strip()


@router.post("/unified-action")
async def update_unified_message_action(
    payload: UnifiedMessageActionPayload,
    user: dict = Depends(verify_messages_session),
):
    raw_id = payload.message_id.strip()
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid message_id")

    action = payload.action.strip().lower()
    value = payload.value.strip()
    preferred_type = str(payload.chat_type or "").strip().lower()
    if action not in {"star", "react", "delete", "like"}:
        raise HTTPException(status_code=400, detail="action must be one of: star, react, delete, like")

    if action == "delete":
        # Prefer declared type; fall back to discovery for wrong chat_type clients
        try:
            _collection_by_chat_type(preferred_type)
            chat_type = preferred_type if preferred_type not in {"candidate", "team"} else "job"
        except HTTPException:
            _, chat_type, _ = await _find_message_doc(raw_id, preferred_type)
            if not chat_type:
                raise HTTPException(status_code=404, detail="Message not found") from None
        await hard_delete_owned_message(raw_id, chat_type, user)
        return {"status": "success", "id": raw_id, "chat_type": chat_type, "action": action, "deleted": True}

    doc, chat_type, collection = await _find_message_doc(raw_id, preferred_type)
    if not doc or collection is None:
        raise HTTPException(status_code=404, detail="Message not found")

    if action == "like":
        liked_by = {
            str(x).strip().lower()
            for x in (doc.get("liked_by") or [])
            if str(x or "").strip()
        }
        aliases = {str(x).strip().lower() for x in user_session_ids(user) if str(x or "").strip()}
        primary = _primary_liker_id(user).lower()
        if primary:
            aliases.add(primary)
        want_like = value.lower() in {"true", "1", "yes", "on"}
        if want_like:
            if primary:
                liked_by.add(primary)
        else:
            liked_by -= aliases
        liked_list = sorted(liked_by)
        await collection.update_one(
            {"_id": ObjectId(raw_id)},
            {"$set": {"liked_by": liked_list, "likes": len(liked_list)}},
        )
        return {
            "status": "success",
            "id": raw_id,
            "chat_type": chat_type,
            "action": action,
            "value": "true" if want_like else "false",
            "liked": bool(primary and primary in liked_by),
            "likes": len(liked_list),
            "liked_by": liked_list,
        }

    update_set = {}
    if action == "star":
        update_set["starred"] = value.lower() in {"true", "1", "yes", "on"}
    else:
        update_set["reaction"] = value

    result = await collection.update_one({"_id": ObjectId(raw_id)}, {"$set": update_set})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")

    return {
        "status": "success",
        "id": raw_id,
        "chat_type": chat_type,
        "action": action,
        "value": value,
    }
