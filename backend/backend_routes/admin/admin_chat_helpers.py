"""Admin chat — thread metadata and message serialization."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId

from database import companies_collection

from backend_routes.messages.helpers import (
    _find_user_by_identifier,
    _pick_user_avatar,
    _pick_user_name,
    _presence_from_user,
    _to_iso,
)

ADMIN_ACTOR = "eventthon-admin-support"
ADMIN_SUPPORT_ACTOR = "eventthon-admin-support"
ADMIN_AVATAR = "/assets/eventthon-logo.png"


def _parse_imageurl(doc: Optional[dict]) -> str:
    if not doc:
        return ""
    for key in ("imageurl", "profile_image_url", "avatar", "logo_url"):
        val = str(doc.get(key) or "").strip()
        if val:
            return val
    return ""


def _pretty_email_fallback(raw: str) -> str:
    text = str(raw or "").strip()
    if "@" in text:
        local = text.split("@", 1)[0].replace(".", " ").replace("_", " ").strip()
        return local.title() if local else text
    return text


def _display_name(company: Optional[dict], user: Optional[dict], fallback: str) -> str:
    company_name = str((company or {}).get("name") or (company or {}).get("company_name") or "").strip()
    profile_name = _pick_user_name(user or {})
    email = str((user or {}).get("email") or fallback or "").strip().lower()
    if company_name and email and company_name.lower() not in {
        _pretty_email_fallback(email).lower(),
        email,
        email.split("@")[0].lower(),
    }:
        return company_name
    if profile_name:
        return profile_name
    if company_name:
        return company_name
    return _pretty_email_fallback(fallback)


def _identity_keys(user: Optional[dict], raw_key: str = "") -> List[str]:
    keys: List[str] = []
    seen = set()

    def add(val: str) -> None:
        text = str(val or "").strip()
        if not text:
            return
        low = text.lower()
        if low in seen:
            return
        seen.add(low)
        keys.append(text)

    add(raw_key)
    if user:
        add(str(user.get("email") or ""))
        add(str(user.get("user_id") or ""))
        add(str(user.get("mobile") or ""))
        add(str(user.get("_id") or ""))
    return keys


def _canonical_key(user: Optional[dict], raw_key: str) -> str:
    if user:
        email = str(user.get("email") or "").strip().lower()
        if email:
            return email
        oid = str(user.get("_id") or "").strip().lower()
        if oid:
            return oid
    return str(raw_key or "").strip().lower()


async def resolve_company_thread(employer_id: str) -> Dict[str, Any]:
    employer_id = str(employer_id or "").strip()
    company = await companies_collection.find_one(
        {
            "$or": [
                {"owner_user_id": {"$regex": f"^{re.escape(employer_id)}$", "$options": "i"}},
                {"contact_email": {"$regex": f"^{re.escape(employer_id)}$", "$options": "i"}},
                {"email": {"$regex": f"^{re.escape(employer_id)}$", "$options": "i"}},
            ]
        }
    )
    user = await _find_user_by_identifier(employer_id)
    profile_name = _pick_user_name(user or {})
    company_name = str((company or {}).get("name") or (company or {}).get("company_name") or "").strip()
    email = str((user or {}).get("email") or employer_id).strip()
    name = _display_name(company, user, employer_id)
    imageurl = _parse_imageurl(company) or _pick_user_avatar(user or {}) or _parse_imageurl(user)
    online_status = _presence_from_user(user or {})
    identities = _identity_keys(user, employer_id)
    if email:
        identities = _identity_keys(user, email)
    canonical = _canonical_key(user, employer_id)
    return {
        "thread_key": email or employer_id,
        "canonical_key": canonical,
        "identity_keys": identities,
        "entity_name": name,
        "profile_name": profile_name or name,
        "company_name": company_name,
        "email": email,
        "imageurl": imageurl,
        "online_status": online_status,
        "is_online": online_status == "online",
        "channel_label": "Company",
        "member_since": _to_iso((user or {}).get("created_at") or (company or {}).get("created_at")),
        "country": str((user or {}).get("country") or (user or {}).get("location") or "").strip(),
    }


async def resolve_user_thread(user_id: str) -> Dict[str, Any]:
    user_id = str(user_id or "").strip()
    user = await _find_user_by_identifier(user_id)
    profile_name = _pick_user_name(user or {})
    email = str((user or {}).get("email") or user_id).strip()
    name = profile_name or _pretty_email_fallback(user_id)
    online_status = _presence_from_user(user or {})
    identities = _identity_keys(user, user_id)
    canonical = _canonical_key(user, user_id)
    return {
        "thread_key": email or user_id,
        "canonical_key": canonical,
        "identity_keys": identities,
        "entity_name": name,
        "profile_name": profile_name or name,
        "company_name": "",
        "email": email,
        "imageurl": _pick_user_avatar(user or {}) or _parse_imageurl(user),
        "online_status": online_status,
        "is_online": online_status == "online",
        "channel_label": "Member",
        "member_since": _to_iso((user or {}).get("created_at")),
        "country": str((user or {}).get("country") or (user or {}).get("location") or "").strip(),
    }


def serialize_chat_message(
    doc: dict,
    channel: str,
    thread_key: str,
    *,
    peer_name: str = "",
    peer_imageurl: str = "",
) -> dict:
    doc_id = doc.get("_id")
    if isinstance(doc_id, ObjectId):
        doc_id = str(doc_id)
    from_id = str(doc.get("from_user_id") or "").strip()
    is_admin = from_id in {ADMIN_ACTOR, ADMIN_SUPPORT_ACTOR} or str(doc.get("from_role") or "") == "admin"
    created = doc.get("created_at")
    delivery = str(doc.get("delivery_status") or doc.get("status") or "sent").strip().lower()
    if delivery in {"new", "ok"}:
        delivery = "sent"
    sender_name = "EventThon Admin" if is_admin else (
        str(doc.get("from_user_name") or "").strip() or peer_name or from_id or "User"
    )
    sender_image = ADMIN_AVATAR if is_admin else (
        str(doc.get("from_user_imageurl") or "").strip() or peer_imageurl or ""
    )
    # Recipient face — admin sent → company/user; company/user sent → admin
    recipient_image = peer_imageurl if is_admin else ADMIN_AVATAR
    recipient_name = peer_name if is_admin else "EventThon Admin"
    liked_by = [
        str(x).strip()
        for x in (doc.get("liked_by") or [])
        if str(x or "").strip()
    ]
    try:
        likes_n = int(doc.get("likes") or 0)
    except (TypeError, ValueError):
        likes_n = 0
    return {
        "id": doc_id,
        "thread_key": thread_key,
        "channel": channel,
        "chat_type": "company_support" if channel == "company_support" else "user_candidate",
        "body": str(doc.get("body") or doc.get("message") or "").strip(),
        "from_user_id": from_id,
        "from_user_name": sender_name,
        "from_user_imageurl": sender_image,
        "to_user_name": recipient_name,
        "to_user_imageurl": recipient_image,
        "peer_imageurl": peer_imageurl or "",
        "direction": "outgoing" if is_admin else "incoming",
        "created_at": _to_iso(created),
        "status": delivery,
        "delivery_status": delivery,
        "liked_by": liked_by,
        "likes": max(likes_n, len(liked_by)),
        "attachments": doc.get("attachments") if isinstance(doc.get("attachments"), list) else [],
    }


def sort_messages(rows: List[dict]) -> List[dict]:
    def key(item: dict):
        raw = item.get("created_at") or ""
        try:
            return datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        except ValueError:
            return datetime.min

    return sorted(rows, key=key)


def is_employer_message(doc: dict) -> bool:
    from_id = str(doc.get("from_user_id") or "").strip()
    return from_id not in {ADMIN_ACTOR, ADMIN_SUPPORT_ACTOR}


def is_candidate_message(doc: dict) -> bool:
    from_id = str(doc.get("from_user_id") or "").strip()
    return bool(from_id) and from_id not in {ADMIN_ACTOR, ADMIN_SUPPORT_ACTOR}


def identity_match_query(identity_keys: List[str], *fields: str) -> dict:
    keys = [str(k).strip() for k in (identity_keys or []) if str(k).strip()]
    if not keys:
        return {"_id": {"$exists": False}}
    or_clauses = []
    for field in fields:
        for key in keys:
            or_clauses.append({field: {"$regex": f"^{re.escape(key)}$", "$options": "i"}})
    return {"$or": or_clauses}


def employer_match_query(thread_key: str, identity_keys: Optional[List[str]] = None) -> dict:
    keys = list(identity_keys or [])
    if thread_key and thread_key not in keys:
        keys.append(thread_key)
    return identity_match_query(keys, "employer_user_id", "from_user_id")
