"""Company team — membership helpers and owner sync."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId

from database import company_members_collection, companies_collection, user_collection
from .portal_resolve import find_user, primary_owner_key
from .team_roles import role_label


def user_public_name(user: Optional[dict], fallback: str = "Member") -> str:
    if not user:
        return fallback
    first = (user.get("first_name") or "").strip()
    last = (user.get("last_name") or "").strip()
    full = f"{first} {last}".strip()
    if full:
        return full
    return str(user.get("email") or user.get("user_id") or fallback)


def user_email(user: Optional[dict]) -> str:
    if not user:
        return ""
    return str(user.get("email") or "").strip().lower()


def serialize_member(doc: dict) -> dict:
    return {
        "id": str(doc.get("_id") or ""),
        "companyId": str(doc.get("company_id") or ""),
        "userId": str(doc.get("user_id") or ""),
        "email": doc.get("email") or "",
        "name": doc.get("name") or "",
        "imageurl": doc.get("imageurl") or "",
        "role": doc.get("role") or "viewer",
        "roleLabel": role_label(doc.get("role") or "viewer"),
        "status": doc.get("status") or "active",
        "joinedAt": str(doc.get("joined_at") or ""),
        "invitedBy": doc.get("invited_by") or "",
    }


async def find_member_by_id(member_id: str) -> Optional[dict]:
    raw = str(member_id or "").strip()
    if not raw:
        return None
    try:
        return await company_members_collection.find_one({"_id": ObjectId(raw)})
    except Exception:
        return None


async def find_active_membership(user: dict) -> Optional[dict]:
    email = user_email(user)
    uid = str(user.get("_id") or "")
    query = {
        "status": "active",
        "$or": [{"user_id": uid}, {"email": email}] if email else [{"user_id": uid}],
    }
    return await company_members_collection.find_one(query)


async def ensure_owner_membership(company: dict) -> dict:
    """Guarantee company owner exists as an Owner member row (invite-flow exception for founder)."""
    cid = str(company.get("_id") or "")
    owner_key = str(company.get("owner_user_id") or "").strip()
    owner_user = await find_user(owner_key) if owner_key else None
    email = user_email(owner_user) or (owner_key.lower() if "@" in owner_key else "")
    existing = await company_members_collection.find_one(
        {"company_id": cid, "role": "owner", "status": {"$in": ["active", "suspended"]}}
    )
    if existing:
        return existing
    now = datetime.utcnow().isoformat()
    doc = {
        "company_id": cid,
        "user_id": str(owner_user["_id"]) if owner_user else "",
        "email": email,
        "name": user_public_name(owner_user, "Owner"),
        "imageurl": str(
            (owner_user or {}).get("profile_image_url")
            or (owner_user or {}).get("avatar")
            or ""
        ),
        "role": "owner",
        "status": "active",
        "joined_at": now,
        "invited_by": "system",
        "created_at": now,
        "updated_at": now,
    }
    result = await company_members_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def get_actor_membership(company_id: str, user: dict) -> Optional[dict]:
    cid = str(company_id)
    email = user_email(user)
    uid = str(user.get("_id") or "")
    query = {
        "company_id": cid,
        "status": {"$in": ["active", "suspended"]},
        "$or": [{"user_id": uid}, {"email": email}] if email else [{"user_id": uid}],
    }
    return await company_members_collection.find_one(query)


async def list_members(company_id: str, status: Optional[str] = None) -> list[dict]:
    query: dict = {"company_id": str(company_id)}
    if status:
        query["status"] = status
    rows: list[dict] = []
    async for doc in company_members_collection.find(query).sort("joined_at", -1):
        rows.append(serialize_member(doc))
    return rows


async def set_user_company_link(user: dict, company_id: str) -> None:
    patch = {
        "company_id": str(company_id),
        "updated_at": datetime.utcnow().isoformat(),
    }
    role = str(user.get("role") or "").strip().lower()
    # Invitees need Company Hub access; do not demote admins.
    if role not in ("admin", "employer"):
        patch["role"] = "employer"
    await user_collection.update_one({"_id": user["_id"]}, {"$set": patch})


async def clear_user_company_link(user_id: str, company_id: str) -> None:
    user = await find_user(user_id)
    if not user:
        return
    if str(user.get("company_id") or "") != str(company_id):
        return
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$unset": {"company_id": ""}, "$set": {"updated_at": datetime.utcnow().isoformat()}},
    )


async def find_company_by_id(company_id: str) -> Optional[dict]:
    raw = str(company_id or "").strip()
    if not raw:
        return None
    try:
        doc = await companies_collection.find_one({"_id": ObjectId(raw)})
        if doc:
            return doc
    except Exception:
        pass
    return await companies_collection.find_one({"_id": raw})
