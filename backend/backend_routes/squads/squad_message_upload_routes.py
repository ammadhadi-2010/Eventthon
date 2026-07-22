import os
import shutil
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, UploadFile, File, Form

from .squads_session import verify_squads_session, assert_actor_id
from .squad_auto_join import ensure_hub_member
from .squad_permissions import assert_chat_enabled, resolve_session_user_id
from .squad_shared import SQUAD_UPLOAD_DIR, squad_collection, get_squad_or_none, create_activity_event

router = APIRouter()


def _classify_upload(filename: str) -> tuple[str, str]:
    lower = (filename or "").lower()
    if lower.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")):
        return "images", "image"
    if lower.endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):
        return "videos", "file"
    if lower.endswith((".zip", ".rar", ".7z", ".tar", ".gz")):
        return "others", "file"
    return "documents", "file"


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
    await ensure_hub_member(squad, user)
    assert_chat_enabled(squad)
    resolved_sender_id = (sender_id or resolve_session_user_id(user)).strip()
    if resolved_sender_id:
        await assert_actor_id(resolved_sender_id, user)

    unique_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    save_path = os.path.join(SQUAD_UPLOAD_DIR, unique_name)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    static_url = f"/static/uploads/squads/{unique_name}"
    category, msg_type = _classify_upload(file.filename or "")
    clean_sender = (sender_name or "").strip() or "Member"
    file_size = f"{round((file.size or 0) / (1024 * 1024), 2)} MB" if file.size else "File"

    message = {
        "id": f"f-{uuid.uuid4().hex[:8]}",
        "type": msg_type,
        "file_name": file.filename,
        "file_size": file_size,
        "download_url": static_url,
        "image_url": static_url if msg_type == "image" else None,
        "sender": clean_sender,
        "sender_id": resolved_sender_id or None,
        "time": datetime.utcnow().strftime("%I:%M %p"),
        "reactions": [],
    }
    file_entry = {
        "id": f"f-{uuid.uuid4().hex[:8]}",
        "name": file.filename,
        "size": file_size,
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
