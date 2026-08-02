from datetime import datetime
from pathlib import Path

from bson import ObjectId
from fastapi import HTTPException

from database import (
    admin_candidate_messages_collection,
    company_support_messages_collection,
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


def _pick_user_avatar(user: dict) -> str:
    if not user:
        return ""
    for key in (
        "profile_image_url",
        "profileImageUrl",
        "avatar",
        "imageurl",
        "image_url",
        "photo",
    ):
        value = str(user.get(key) or "").strip()
        if value:
            return value
    return ""


async def _resolve_user_avatar(user_id: str, cache: dict[str, str]) -> str:
    uid = str(user_id or "").strip()
    if not uid:
        return ""
    key = f"avatar::{uid}"
    if key in cache:
        return cache[key]
    user = await _find_user_by_identifier(uid)
    resolved = _pick_user_avatar(user)
    cache[key] = resolved
    return resolved


async def _find_user_by_identifier(user_id: str) -> dict:
    uid = str(user_id or "").strip()
    if not uid:
        return {}
    queries = [
        {"mobile": uid},
        {"user_id": uid},
        {"email": uid},
        {"email": uid.lower()},
    ]
    if ObjectId.is_valid(uid):
        queries.append({"_id": ObjectId(uid)})
    user = await user_collection.find_one({"$or": queries})
    if user:
        return user
    if "@" in uid:
        user = await user_collection.find_one({"email": {"$regex": f"^{uid}$", "$options": "i"}})
        if user:
            return user
    return {}


def _presence_from_user(user: dict) -> str:
    if not user:
        return "offline"
    if user.get("is_online") is True:
        return "online"
    for key in ("last_seen", "last_active", "last_active_at", "last_login", "updated_at"):
        raw = user.get(key)
        if not raw:
            continue
        try:
            if isinstance(raw, datetime):
                ts = raw.replace(tzinfo=None) if getattr(raw, "tzinfo", None) else raw
            else:
                ts = datetime.fromisoformat(str(raw).replace("Z", "+00:00")).replace(tzinfo=None)
            age = (datetime.utcnow() - ts).total_seconds()
            if age <= 300:
                return "online"
            if age <= 1800:
                return "away"
        except Exception:
            continue
    return "offline"


async def _resolve_user_presence(user_id: str, cache: dict[str, str]) -> str:
    uid = str(user_id or "").strip()
    if not uid:
        return "offline"
    key = f"presence::{uid}"
    if key in cache:
        return cache[key]
    user = await _find_user_by_identifier(uid)
    status = _presence_from_user(user)
    cache[key] = status
    return status


async def _resolve_company_branding(owner_id: str, cache: dict) -> dict:
    """Company name + logo for an employer account (falls back to user profile)."""
    uid = str(owner_id or "").strip()
    if not uid:
        return {"name": "", "imageurl": ""}
    key = f"company::{uid.lower()}"
    if key in cache:
        return cache[key]
    from database import companies_collection

    company = None
    try:
        company = await companies_collection.find_one(
            {"owner_user_id": {"$regex": f"^{uid}$", "$options": "i"}}
        )
        if not company:
            user = await _find_user_by_identifier(uid)
            if user:
                email = str(user.get("email") or "").strip()
                oid = str(user.get("_id") or "").strip()
                or_q = []
                if email:
                    or_q.append({"owner_user_id": {"$regex": f"^{email}$", "$options": "i"}})
                if oid:
                    or_q.append({"owner_user_id": oid})
                    or_q.append({"user_id": oid})
                if or_q:
                    company = await companies_collection.find_one({"$or": or_q})
    except Exception:
        company = None

    name = ""
    imageurl = ""
    if company:
        name = str(company.get("name") or company.get("company_name") or "").strip()
        imageurl = str(company.get("imageurl") or company.get("logo_url") or "").strip()
    if not imageurl:
        imageurl = await _resolve_user_avatar(uid, cache)
    if not name:
        name = await _resolve_user_name(uid, cache)
    out = {"name": name, "imageurl": imageurl}
    cache[key] = out
    return out


async def _mark_messages_delivered(collection, viewer_ids: list[str]) -> None:
    """When recipient opens inbox, upgrade peer-sent messages from sent → delivered."""
    ids = [str(x or "").strip() for x in (viewer_ids or []) if str(x or "").strip()]
    if not ids:
        return
    or_clauses = []
    for text in ids:
        or_clauses.append({"candidate_user_id": {"$regex": f"^{text}$", "$options": "i"}})
        or_clauses.append({"seller_user_id": {"$regex": f"^{text}$", "$options": "i"}})
    try:
        await collection.update_many(
            {
                "delivery_status": "sent",
                "$or": or_clauses,
                "from_user_id": {"$nin": ids},
            },
            {"$set": {"delivery_status": "delivered"}},
        )
    except Exception:
        pass


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
        "candidate_user_id": str(out.get("candidate_user_id") or out.get("to_user_id") or "").strip(),
        "body": str(out.get("body") or out.get("message") or "").strip(),
        "status": str(out.get("status") or "new").strip(),
        "delivery_status": str(out.get("delivery_status") or "sent").strip(),
        "attachments": _normalize_attachments(out.get("attachments")),
        "reply_to_id": str(out.get("reply_to_id") or "").strip(),
        "message_type": str(out.get("message_type") or "text").strip(),
        "reaction": str(out.get("reaction") or "").strip(),
        "starred": bool(out.get("starred") or False),
        "liked_by": [
            str(x).strip()
            for x in (out.get("liked_by") or [])
            if str(x or "").strip()
        ],
        "likes": _likes_count(out),
        "deleted": bool(out.get("deleted") or False),
        "created_at": _to_iso(created_at_raw),
        "_sort_created_at": _created_sort_value(created_at_raw),
    }


def _likes_count(doc: dict) -> int:
    liked_by = [
        str(x).strip()
        for x in (doc.get("liked_by") or [])
        if str(x or "").strip()
    ]
    stored = doc.get("likes")
    try:
        stored_n = int(stored) if stored is not None else 0
    except (TypeError, ValueError):
        stored_n = 0
    return max(stored_n, len(liked_by))


CHAT_TYPE_COLLECTIONS = (
    ("gig", gig_contact_messages_collection),
    ("job", job_contact_messages_collection),
    ("project", project_contact_messages_collection),
    ("admin_support", company_support_messages_collection),
    ("company_support", company_support_messages_collection),
    ("user_candidate", admin_candidate_messages_collection),
)


def _collection_by_chat_type(chat_type: str):
    normalized = (chat_type or "").strip().lower()
    mapping = {key: col for key, col in CHAT_TYPE_COLLECTIONS}
    # Alias: company candidate/team + squad member threads use job contact messages
    if normalized in {"candidate", "team", "squad", "squad_member"}:
        normalized = "job"
    collection = mapping.get(normalized)
    if collection is None:
        raise HTTPException(
            status_code=400,
            detail="chat_type must be one of: gig, job, project, admin_support, company_support, user_candidate",
        )
    return collection, normalized


async def _find_message_doc(message_id: str, preferred_chat_type: str = ""):
    """Locate a message by id — try preferred chat_type first, then all collections."""
    if not ObjectId.is_valid(message_id):
        return None, "", None
    oid = ObjectId(message_id)
    preferred = (preferred_chat_type or "").strip().lower()
    if preferred in {"candidate", "team", "squad", "squad_member"}:
        preferred = "job"
    ordered = []
    seen = set()
    if preferred:
        try:
            col, key = _collection_by_chat_type(preferred)
            ordered.append((key, col))
            seen.add(id(col))
        except HTTPException:
            pass
    for key, col in CHAT_TYPE_COLLECTIONS:
        if id(col) in seen:
            continue
        ordered.append((key, col))
        seen.add(id(col))
    for key, col in ordered:
        doc = await col.find_one({"_id": oid})
        if doc:
            return doc, key, col
    return None, "", None
