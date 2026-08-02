"""Classify and store chat attachments with richer metadata."""
from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from .helpers import MESSAGE_UPLOAD_DIR
from .messages_session import verify_messages_session

router = APIRouter()

ALLOWED_EXT = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv",
    ".zip", ".rar", ".7z",
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".mp4", ".webm", ".mov", ".m4v",
    ".txt", ".md",
}
MAX_BYTES = 40 * 1024 * 1024


def classify_attachment(name: str, kind: str = "file") -> str:
    ext = Path(name or "").suffix.lower()
    if kind == "image" or ext in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        return "image"
    if ext in {".mp4", ".webm", ".mov", ".m4v"}:
        return "video"
    if ext in {".pdf"}:
        return "pdf"
    if ext in {".doc", ".docx"}:
        return "word"
    if ext in {".xls", ".xlsx", ".csv"}:
        return "excel"
    if ext in {".zip", ".rar", ".7z"}:
        return "zip"
    if "resume" in (name or "").lower() or "cv" in (name or "").lower():
        return "resume"
    if "portfolio" in (name or "").lower():
        return "portfolio"
    return (kind or "file").strip().lower() or "file"


@router.post("/upload")
async def upload_message_attachment(
    file: UploadFile = File(...),
    kind: str = Form("file"),
    _user: dict = Depends(verify_messages_session),
):
    MESSAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    original_name = (file.filename or "upload.bin").strip()
    safe_name = original_name.replace("\\", "_").replace("/", "_")
    suffix = Path(safe_name).suffix.lower()
    if suffix and suffix not in ALLOWED_EXT:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use resume, images, video, PDF, Word, Excel, or ZIP.",
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
