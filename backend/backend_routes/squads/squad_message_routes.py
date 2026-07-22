import uuid
from datetime import datetime

from fastapi import APIRouter, Depends

from .squads_session import verify_squads_session, assert_actor_id
from .squad_auto_join import ensure_hub_member
from .squad_permissions import (
    assert_hub_read_access,
    assert_chat_enabled,
    resolve_session_user_id,
)
from .squad_shared import (
    SendMessagePayload,
    UpdateMessagePayload,
    ReactMessagePayload,
    squad_collection,
    get_squad_or_none,
    create_activity_event,
)

router = APIRouter()


@router.get("/{squad_id}/messages")
async def get_squad_messages(
    squad_id: str,
    limit: int = 80,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found", "data": []}
    assert_hub_read_access(squad, user)
    await ensure_hub_member(squad, user)
    assert_chat_enabled(squad)
    messages = squad.get("messages", [])
    capped = messages[-max(1, min(limit, 120)) :]
    return {"status": "success", "data": capped}


@router.post("/{squad_id}/messages")
async def send_squad_message(
    squad_id: str,
    payload: SendMessagePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await ensure_hub_member(squad, user)
    assert_chat_enabled(squad)
    sender_id = (payload.sender_id or resolve_session_user_id(user)).strip()
    if sender_id:
        await assert_actor_id(sender_id, user)
    clean_text = (payload.text or "").strip()
    if not clean_text:
        return {"status": "error", "message": "Message text required"}
    sender_name = (payload.sender_name or "").strip() or "Member"
    message = {
        "id": f"m-{uuid.uuid4().hex[:8]}",
        "type": "text",
        "text": clean_text,
        "sender": sender_name,
        "sender_id": sender_id or None,
        "time": datetime.utcnow().strftime("%I:%M %p"),
        "reactions": [],
    }
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$push": {
                "messages": message,
                "activity_feed": create_activity_event(
                    "message",
                    f"{sender_name} sent a new message",
                    sender_name,
                ),
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "data": message}


@router.put("/{squad_id}/messages/{message_id}")
async def update_squad_message(
    squad_id: str,
    message_id: str,
    payload: UpdateMessagePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await ensure_hub_member(squad, user)
    assert_chat_enabled(squad)
    clean_text = (payload.text or "").strip()
    if not clean_text:
        return {"status": "error", "message": "Message text required"}
    messages = squad.get("messages", [])
    target = next((m for m in messages if m.get("id") == message_id), None)
    if not target:
        return {"status": "error", "message": "Message not found"}
    sender_id = (payload.sender_id or resolve_session_user_id(user)).strip()
    if sender_id:
        await assert_actor_id(sender_id, user)
    if target.get("sender_id") and sender_id and str(target.get("sender_id")) != str(sender_id):
        return {"status": "error", "message": "Not allowed to edit this message"}
    await squad_collection.update_one(
        {"_id": squad_id, "messages.id": message_id},
        {
            "$set": {
                "messages.$.text": clean_text,
                "messages.$.edited": True,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    updated = {**target, "text": clean_text, "edited": True}
    return {"status": "success", "data": updated}


@router.delete("/{squad_id}/messages/{message_id}")
async def delete_squad_message(
    squad_id: str,
    message_id: str,
    sender_id: str | None = None,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await ensure_hub_member(squad, user)
    assert_chat_enabled(squad)
    messages = squad.get("messages", [])
    target = next((m for m in messages if m.get("id") == message_id), None)
    if not target:
        return {"status": "error", "message": "Message not found"}
    actor_id = (sender_id or resolve_session_user_id(user)).strip()
    if actor_id:
        await assert_actor_id(actor_id, user)
    if target.get("sender_id") and actor_id and str(target.get("sender_id")) != str(actor_id):
        return {"status": "error", "message": "Not allowed to delete this message"}
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$pull": {"messages": {"id": message_id}},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "message": "Message deleted", "id": message_id}


@router.post("/{squad_id}/messages/{message_id}/react")
async def react_squad_message(
    squad_id: str,
    message_id: str,
    payload: ReactMessagePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await ensure_hub_member(squad, user)
    assert_chat_enabled(squad)
    emoji = (payload.emoji or "").strip()
    if not emoji:
        return {"status": "error", "message": "Emoji required"}
    messages = squad.get("messages", [])
    target = next((m for m in messages if m.get("id") == message_id), None)
    if not target:
        return {"status": "error", "message": "Message not found"}
    reactions = list(target.get("reactions") or [])
    found = False
    for row in reactions:
        if row.get("emoji") == emoji:
            row["count"] = int(row.get("count") or 0) + 1
            found = True
            break
    if not found:
        reactions.append({"emoji": emoji, "count": 1})
    await squad_collection.update_one(
        {"_id": squad_id, "messages.id": message_id},
        {"$set": {"messages.$.reactions": reactions, "updated_at": datetime.utcnow()}},
    )
    updated = {**target, "reactions": reactions}
    return {"status": "success", "data": updated}
