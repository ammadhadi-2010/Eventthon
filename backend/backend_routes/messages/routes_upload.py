from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile

from .helpers import MESSAGE_UPLOAD_DIR
from .messages_session import verify_messages_session

router = APIRouter()


@router.post("/upload")
async def upload_message_attachment(
    file: UploadFile = File(...),
    kind: str = Form("file"),
    _user: dict = Depends(verify_messages_session),
):
    MESSAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    original_name = (file.filename or "upload.bin").strip()
    safe_name = original_name.replace("\\", "_").replace("/", "_")
    suffix = Path(safe_name).suffix
    stored_name = f"{uuid4().hex}{suffix}"
    target = MESSAGE_UPLOAD_DIR / stored_name

    content = await file.read()
    target.write_bytes(content)
    public_url = f"/static/uploads/messages/{stored_name}"
    return {
        "status": "success",
        "attachment": {
            "name": safe_name,
            "url": public_url,
            "imageurl": public_url,
            "type": (kind or "file").strip().lower(),
            "size": len(content),
        },
    }
