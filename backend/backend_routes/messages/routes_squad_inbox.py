"""Squad hub member inbox — 1:1 chats with squad members (job collection, squad-* context)."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from bson import ObjectId

from database import job_contact_messages_collection, user_collection
from backend_routes.squads.squad_permissions import is_squad_member
from backend_routes.squads.squad_shared import get_squad_or_none

from .helpers import (
    _mark_messages_delivered,
    _resolve_user_avatar,
    _resolve_user_name,
    _resolve_user_presence,
    _serialize_unified_contact,
)

router = APIRouter()


def squad_context_id(squad_id: str) -> str:
    return f"squad-{str(squad_id or '').strip()}"


def _member_peer_id(member: dict) -> str:
    return str(
        member.get("user_id")
        or member.get("id")
        or member.get("_id")
        or member.get("email")
        or member.get("mobile")
        or ""
    ).strip()


def _member_name(member: dict) -> str:
    name = str(member.get("name") or "").strip()
    if name:
        return name
    first = str(member.get("first_name") or "").strip()
    last = str(member.get("last_name") or "").strip()
    combined = f"{first} {last}".strip()
    if combined:
        return combined
    return _member_peer_id(member) or "Member"


def _peer_for_viewer(doc: dict, viewer_id: str) -> str:
    viewer = str(viewer_id or "").strip().lower()
    self_ids = {viewer}
    for key in ("candidate_user_id", "to_user_id", "from_user_id", "seller_user_id", "peer_user_id"):
        val = str(doc.get(key) or "").strip()
        if val and val.lower() not in self_ids:
            return val
    return ""


async def _resolve_viewer_user(viewer_id: str) -> dict:
    raw = str(viewer_id or "").strip()
    if not raw:
        return {}
    clauses = [
        {"email": raw.lower()},
        {"mobile": raw},
        {"user_id": raw},
    ]
    if ObjectId.is_valid(raw):
        clauses.append({"_id": ObjectId(raw)})
    user = await user_collection.find_one({"$or": clauses})
    if user:
        user = dict(user)
        user["_id"] = str(user.get("_id") or raw)
        return user
    # Fallback stub so email/mobile leaders still match
    stub = {"_id": raw, "user_id": raw}
    if "@" in raw:
        stub["email"] = raw.lower()
    else:
        stub["mobile"] = raw
    return stub


def _viewer_in_squad(squad: dict, viewer_user: dict, viewer_id: str) -> bool:
    if is_squad_member(squad, viewer_user):
        return True
    viewer = str(viewer_id or "").strip().lower()
    if not viewer:
        return False
    leader = str(squad.get("leader_id") or "").strip().lower()
    if leader and leader == viewer:
        return True
    for member in squad.get("members") or []:
        if not isinstance(member, dict):
            continue
        status = str(member.get("invite_status") or "accepted").lower()
        if status not in ("accepted", "", "active"):
            continue
        for key in ("id", "user_id", "email", "mobile"):
            val = str(member.get(key) or "").strip().lower()
            if val and val == viewer:
                return True
    return False


def _serialize_squad_row(doc: dict, from_name: str, squad_id: str, squad_name: str) -> dict:
    row = _serialize_unified_contact(doc, "job", from_name)
    row["chat_type"] = "job"
    row["chat_tag"] = "Squad Member"
    row["channel"] = "squad_member"
    row["context_id"] = squad_context_id(squad_id)
    row["context_title"] = squad_name or "Squad Chat"
    row["squad_id"] = str(squad_id)
    return row


def _group_member_threads(rows: list[dict], viewer_id: str) -> list[dict]:
    grouped: dict[str, dict] = {}
    viewer = str(viewer_id or "").strip().lower()
    for row in rows:
        peer = _peer_for_viewer(row, viewer_id)
        if not peer or peer.lower() == viewer:
            continue
        key = peer.lower()
        sort_at = row.get("_sort_created_at") or datetime.min
        current = grouped.get(key)
        if not current or sort_at >= current.get("_sort_created_at", datetime.min):
            clone = dict(row)
            clone["from_user_id"] = peer
            clone["candidate_user_id"] = peer
            clone["peer_user_id"] = peer
            if not clone.get("from_user_name") or clone.get("from_user_name") == clone.get("from_user_id"):
                clone["from_user_name"] = row.get("peer_user_name") or row.get("from_user_name") or peer
            clone["_sort_created_at"] = sort_at
            grouped[key] = clone
    out = list(grouped.values())
    out.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    return out


@router.get("/squad-inbox")
async def list_squad_inbox(
    squad_id: str = Query(..., min_length=1, max_length=120),
    viewer_user_id: str = Query(..., min_length=1, max_length=120),
    skip: int = Query(0, ge=0),
    limit: int = Query(80, ge=1, le=120),
):
    sid = squad_id.strip()
    viewer = viewer_user_id.strip()
    if not sid or not viewer:
        raise HTTPException(status_code=400, detail="squad_id and viewer_user_id are required")

    # Squads use string _ids (uuid/seed) — do not require Mongo ObjectId
    squad = await get_squad_or_none(sid)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    viewer_user = await _resolve_viewer_user(viewer)
    if not _viewer_in_squad(squad, viewer_user, viewer):
        raise HTTPException(status_code=403, detail="Join this squad to open member chat.")

    squad_name = str(squad.get("squad_name") or "Squad").strip()
    context_id = squad_context_id(sid)
    members = squad.get("members") if isinstance(squad.get("members"), list) else []

    name_cache: dict[str, str] = {}
    avatar_cache: dict[str, str] = {}
    await _mark_messages_delivered(job_contact_messages_collection, [viewer])

    viewer_re = {"$regex": f"^{viewer}$", "$options": "i"}
    cursor = job_contact_messages_collection.find(
        {
            "job_id": context_id,
            "$or": [
                {"seller_user_id": viewer_re},
                {"from_user_id": viewer_re},
                {"candidate_user_id": viewer_re},
            ],
        }
    ).sort("created_at", -1).limit(400)

    merged = []
    async for doc in cursor:
        uid = str(doc.get("from_user_id") or "").strip()
        peer = _peer_for_viewer(doc, viewer)
        display = await _resolve_user_name(peer or uid, name_cache)
        row = _serialize_squad_row(doc, display, sid, squad_name)
        row["from_user_id"] = uid
        row["from_user_name"] = await _resolve_user_name(uid, name_cache)
        if peer:
            row["candidate_user_id"] = peer
            row["peer_user_id"] = peer
            row["peer_user_name"] = await _resolve_user_name(peer, name_cache)
            row["from_user_imageurl"] = await _resolve_user_avatar(peer, avatar_cache)
        created = doc.get("created_at")
        row["_sort_created_at"] = created if isinstance(created, datetime) else datetime.min
        merged.append(row)

    conversations = _group_member_threads(merged, viewer)

    # Seed every other accepted member so the inbox always lists the squad roster
    existing_peers = {
        str(c.get("peer_user_id") or c.get("candidate_user_id") or c.get("from_user_id") or "")
        .strip()
        .lower()
        for c in conversations
    }
    viewer_l = viewer.lower()
    for member in members:
        status = str(member.get("invite_status") or "accepted").lower()
        if status not in ("accepted", "", "active"):
            continue
        peer = _member_peer_id(member)
        if not peer or peer.lower() == viewer_l:
            continue
        if peer.lower() in existing_peers:
            continue
        name = _member_name(member)
        avatar = str(
            member.get("imageurl")
            or member.get("avatar")
            or member.get("profile_image_url")
            or ""
        ).strip()
        if not avatar:
            avatar = await _resolve_user_avatar(peer, avatar_cache)
        conversations.append(
            {
                "_id": f"squad-seed-{sid}-{peer}",
                "chat_type": "job",
                "chat_tag": "Squad Member",
                "channel": "squad_member",
                "context_id": context_id,
                "context_title": squad_name,
                "squad_id": sid,
                "seller_user_id": viewer,
                "from_user_id": peer,
                "from_user_name": name,
                "from_user_imageurl": avatar,
                "candidate_user_id": peer,
                "peer_user_id": peer,
                "peer_user_name": name,
                "body": "Start chatting with this squad member.",
                "created_at": datetime.utcnow().isoformat(),
                "status": "new",
                "role": member.get("role") or "Member",
                "_isDraft": True,
                "_sort_created_at": datetime.min,
            }
        )

    conversations.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    paged = conversations[skip : skip + limit]

    thread_messages = []
    for item in merged:
        clone = dict(item)
        clone.pop("_sort_created_at", None)
        thread_messages.append(clone)

    for item in paged:
        item.pop("_sort_created_at", None)
        peer = str(item.get("peer_user_id") or item.get("candidate_user_id") or "").strip()
        if peer:
            presence = await _resolve_user_presence(peer, avatar_cache)
            item["online_status"] = presence
            item["is_online"] = presence == "online"
            if not item.get("from_user_imageurl"):
                item["from_user_imageurl"] = await _resolve_user_avatar(peer, avatar_cache)
            if not item.get("from_user_name") or item.get("from_user_name") == peer:
                item["from_user_name"] = await _resolve_user_name(peer, name_cache)

    return {
        "status": "success",
        "squad_id": sid,
        "squad_name": squad_name,
        "messages": paged,
        "thread_messages": thread_messages,
        "counts_by_channel": {"squad_member": len(paged)},
        "total": len(conversations),
    }
