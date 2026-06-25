from datetime import datetime
from pathlib import Path

from bson import ObjectId
from fastapi import HTTPException

from database import (
    gig_contact_messages_collection,
    job_contact_messages_collection,
    project_contact_messages_collection,
    user_collection,
)

BASE_DIR = Path(__file__).resolve().parents[2]
MESSAGE_UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "messages"


def _created_sort_value(raw):
    if isinstance(raw, datetime):
        return raw
    if isinstance(raw, str):
        try:
            return datetime.fromisoformat(raw)
        except ValueError:
            return datetime.min
    return datetime.min


def _pick_user_name(user: dict) -> str:
    if not user:
        return ""
    for key in ("name", "full_name", "display_name", "username"):
        value = str(user.get(key) or "").strip()
        if value:
            return value
    first = str(user.get("first_name") or "").strip()
    last = str(user.get("last_name") or "").strip()
    return f"{first} {last}".strip()


async def _resolve_user_name(user_id: str, cache: dict[str, str]) -> str:
    uid = str(user_id or "").strip()
    if not uid:
        return ""
    if uid in cache:
        return cache[uid]
    user = await _find_user_by_identifier(uid)
    resolved = _pick_user_name(user)
    cache[uid] = resolved
    return resolved


async def _find_user_by_identifier(user_id: str) -> dict:
    uid = str(user_id or "").strip()
    if not uid:
        return {}
    queries = [{"mobile": uid}, {"user_id": uid}, {"email": uid}]
    if ObjectId.is_valid(uid):
        queries.append({"_id": ObjectId(uid)})
    return await user_collection.find_one({"$or": queries}) or {}


def _normalize_attachments(raw) -> list[dict]:
    if not isinstance(raw, list):
        return []
    out = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        url = str(item.get("imageurl") or item.get("url") or "").strip()
        row = {
            "name": str(item.get("name") or "attachment").strip(),
            "url": url,
            "imageurl": url,
            "type": str(item.get("type") or "file").strip().lower(),
            "size": int(item.get("size") or 0),
        }
        out.append(row)
    return out


def _to_iso(raw_value) -> str:
    if isinstance(raw_value, datetime):
        return raw_value.isoformat()
    return str(raw_value or "")


def _serialize_unified_contact(doc: dict, chat_type: str, from_user_name: str = "") -> dict:
    out = dict(doc)
    out_id = out.get("_id")
    if isinstance(out_id, ObjectId):
        out_id = str(out_id)
    context_key = f"{chat_type}_id"
    context_id = out.get(context_key) or out.get("gig_id") or out.get("job_id") or out.get("project_id")
    if isinstance(context_id, ObjectId):
        context_id = str(context_id)
    elif context_id is None:
        context_id = ""
    else:
        context_id = str(context_id)
    created_at_raw = out.get("created_at")
    return {
        "_id": str(out_id or ""),
        "chat_type": chat_type,
        "chat_tag": {"gig": "Gig Inquiry", "job": "Job Inquiry", "project": "Project Discussion"}.get(chat_type, "Message"),
        "context_id": context_id,
        "context_title": (out.get(f"{chat_type}_title") or out.get("gig_title") or out.get("job_title") or out.get("project_title") or "Untitled context"),
        "from_user_id": str(out.get("from_user_id") or out.get("sender_user_id") or "").strip(),
        "from_user_name": str(from_user_name or out.get("from_user_name") or "").strip(),
        "seller_user_id": str(out.get("seller_user_id") or "").strip(),
        "body": str(out.get("body") or out.get("message") or "").strip(),
        "status": str(out.get("status") or "new").strip(),
        "delivery_status": str(out.get("delivery_status") or "sent").strip(),
        "attachments": _normalize_attachments(out.get("attachments")),
        "reply_to_id": str(out.get("reply_to_id") or "").strip(),
        "message_type": str(out.get("message_type") or "text").strip(),
        "reaction": str(out.get("reaction") or "").strip(),
        "starred": bool(out.get("starred") or False),
        "deleted": bool(out.get("deleted") or False),
        "created_at": _to_iso(created_at_raw),
        "_sort_created_at": _created_sort_value(created_at_raw),
    }


def _collection_by_chat_type(chat_type: str):
    normalized = (chat_type or "").strip().lower()
    mapping = {
        "gig": gig_contact_messages_collection,
        "job": job_contact_messages_collection,
        "project": project_contact_messages_collection,
    }
    collection = mapping.get(normalized)
    if collection is None:
        raise HTTPException(status_code=400, detail="chat_type must be one of: gig, job, project")
    return collection, normalized
