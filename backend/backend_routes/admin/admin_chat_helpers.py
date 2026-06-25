"""Admin chat — thread metadata and message serialization."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId

from database import companies_collection, user_collection

from backend_routes.messages.helpers import _find_user_by_identifier, _pick_user_name, _to_iso

ADMIN_ACTOR = "eventthon-admin-support"
ADMIN_SUPPORT_ACTOR = "eventthon-admin-support"


def _parse_imageurl(doc: Optional[dict]) -> str:
    if not doc:
        return ""
    for key in ("imageurl", "profile_image_url", "avatar", "logo_url"):
        val = str(doc.get(key) or "").strip()
        if val:
            return val
    return ""


async def resolve_company_thread(employer_id: str) -> Dict[str, Any]:
    employer_id = str(employer_id or "").strip()
    company = await companies_collection.find_one(
        {
            "$or": [
                {"owner_user_id": employer_id},
                {"contact_email": {"$regex": f"^{employer_id}$", "$options": "i"}},
            ]
        }
    )
    user = await _find_user_by_identifier(employer_id)
    name = str(company.get("name") if company else "") or _pick_user_name(user) or employer_id
    imageurl = _parse_imageurl(company) or _parse_imageurl(user)
    return {"thread_key": employer_id, "entity_name": name, "imageurl": imageurl}


async def resolve_user_thread(user_id: str) -> Dict[str, Any]:
    user_id = str(user_id or "").strip()
    user = await _find_user_by_identifier(user_id)
    name = _pick_user_name(user) or user_id
    return {"thread_key": user_id, "entity_name": name, "imageurl": _parse_imageurl(user)}


def serialize_chat_message(doc: dict, channel: str, thread_key: str) -> dict:
    doc_id = doc.get("_id")
    if isinstance(doc_id, ObjectId):
        doc_id = str(doc_id)
    from_id = str(doc.get("from_user_id") or "").strip()
    is_admin = from_id in {ADMIN_ACTOR, ADMIN_SUPPORT_ACTOR} or str(doc.get("from_role") or "") == "admin"
    created = doc.get("created_at")
    return {
        "id": doc_id,
        "thread_key": thread_key,
        "channel": channel,
        "body": str(doc.get("body") or doc.get("message") or "").strip(),
        "from_user_id": from_id,
        "direction": "outgoing" if is_admin else "incoming",
        "created_at": _to_iso(created),
        "status": str(doc.get("status") or "sent"),
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
