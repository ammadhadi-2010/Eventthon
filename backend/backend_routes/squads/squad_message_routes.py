import os
import shutil
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, UploadFile, File, Form

from .squads_session import verify_squads_session, assert_actor_id
from .squad_permissions import (
    assert_hub_member,
    assert_hub_read_access,
    assert_chat_enabled,
    resolve_session_user_id,
)
from .squad_shared import (
    SendMessagePayload,
    UpdateMessagePayload,
    ReactMessagePayload,
    SQUAD_UPLOAD_DIR,
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
    assert_hub_member(squad, user)
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
    assert_hub_member(squad, user)
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


@router.post("/{squad_id}/messages/upload")
async def send_file_message(
    squad_id: str,
    file: UploadFile = File(...),
    sender_name: str = Form("Member"),
    sender_id: str = Form(""),
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_member(squad, user)
    assert_chat_enabled(squad)
    resolved_sender_id = (sender_id or resolve_session_user_id(user)).strip()
    if resolved_sender_id:
        await assert_actor_id(resolved_sender_id, user)
    unique_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    save_path = os.path.join(SQUAD_UPLOAD_DIR, unique_name)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    static_url = f"/static/uploads/squads/{unique_name}"
    lower_name = (file.filename or "").lower()
    category = "documents"
    if lower_name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")):
        category = "images"
    elif lower_name.endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):
        category = "videos"
    elif lower_name.endswith((".zip", ".rar", ".7z", ".tar", ".gz")):
        category = "others"

    clean_sender = (sender_name or "").strip() or "Member"
    message = {
        "id": f"f-{uuid.uuid4().hex[:8]}",
        "type": "file",
        "file_name": file.filename,
        "file_size": f"{round((file.size or 0) / (1024 * 1024), 2)} MB" if file.size else "File",
        "download_url": static_url,
        "sender": clean_sender,
        "sender_id": resolved_sender_id or None,
        "time": datetime.utcnow().strftime("%I:%M %p"),
        "reactions": [],
    }
    file_entry = {
        "id": f"f-{uuid.uuid4().hex[:8]}",
        "name": file.filename,
        "size": message["file_size"],
        "download_url": static_url,
        "uploaded_by": clean_sender,
        "uploaded_at": datetime.utcnow().isoformat(),
        "category": category,
    }
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$push": {
                "messages": message,
                "files": file_entry,
                "activity_feed": create_activity_event(
                    "file_upload",
                    f"{clean_sender} uploaded file {file.filename}",
                    clean_sender,
                    {"file_name": file.filename},
                ),
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "data": message, "file": file_entry}


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
    assert_hub_member(squad, user)
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
    assert_hub_member(squad, user)
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
    assert_hub_member(squad, user)
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
