from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query

from database import (
    gig_contact_messages_collection,
    job_contact_messages_collection,
    project_contact_messages_collection,
)

from .helpers import (
    _mark_messages_delivered,
    _resolve_company_branding,
    _resolve_user_avatar,
    _resolve_user_name,
    _resolve_user_presence,
    _serialize_unified_contact,
)
from .messages_session import assert_inbox_owner, user_session_ids, verify_messages_session

router = APIRouter()


def _viewer_idents(seller_id: str, user: dict) -> list[str]:
    ids = {seller_id.strip()}
    for val in user_session_ids(user):
        text = str(val or "").strip()
        if text:
            ids.add(text)
    return [x for x in ids if x]


def _is_viewer(uid: str, viewer_lower: set[str]) -> bool:
    return bool(uid) and uid.strip().lower() in viewer_lower


def _peer_for_viewer(row: dict, viewer_lower: set[str]) -> str:
    """Other party in the thread — never the logged-in viewer."""
    seller = str(row.get("seller_user_id") or "").strip()
    sender = str(row.get("from_user_id") or "").strip()
    candidate = str(row.get("candidate_user_id") or "").strip()

    if candidate and not _is_viewer(candidate, viewer_lower):
        return candidate
    if candidate and _is_viewer(candidate, viewer_lower) and seller and not _is_viewer(seller, viewer_lower):
        return seller
    if sender and not _is_viewer(sender, viewer_lower):
        return sender
    if seller and not _is_viewer(seller, viewer_lower):
        return seller
    return ""


def _conversation_key(row: dict, viewer_lower: set[str]) -> str:
    peer = _peer_for_viewer(row, viewer_lower)
    if not peer:
        return ""
    chat_type = str(row.get("chat_type") or "job").strip().lower()
    ctx = str(row.get("context_id") or "").strip()
    return f"{chat_type}::{peer.lower()}::{ctx}"


def _group_peer_conversations(rows: list[dict], viewer_lower: set[str]) -> list[dict]:
    grouped: dict[str, dict] = {}
    for row in rows:
        key = _conversation_key(row, viewer_lower)
        if not key:
            continue
        peer = _peer_for_viewer(row, viewer_lower)
        current = grouped.get(key)
        row_time = row.get("_sort_created_at") or datetime.min
        if not current or row_time >= (current.get("_sort_created_at") or datetime.min):
            conv = dict(row)
            conv["conversation_key"] = key
            conv["_id"] = f"conv-{key}"
            conv["peer_user_id"] = peer
            conv["candidate_user_id"] = conv.get("candidate_user_id") or (
                peer if str(row.get("chat_tag") or "").lower() in {"company", "team member", "applicant"} else conv.get("candidate_user_id")
            )
            # Always show the peer in the list (not "me")
            if _is_viewer(str(conv.get("from_user_id") or ""), viewer_lower) or str(conv.get("from_user_id") or "").lower() != peer.lower():
                conv["from_user_id"] = peer
                if conv.get("peer_user_name"):
                    conv["from_user_name"] = conv["peer_user_name"]
            grouped[key] = conv
        else:
            # Older peer-authored message can still supply name/avatar
            if str(row.get("from_user_id") or "").strip().lower() == peer.lower():
                if row.get("from_user_name") and (
                    not current.get("from_user_name")
                    or current.get("from_user_name") == current.get("from_user_id")
                ):
                    current["from_user_name"] = row.get("from_user_name")
                if row.get("from_user_imageurl") and not current.get("from_user_imageurl"):
                    current["from_user_imageurl"] = row.get("from_user_imageurl")
    out = list(grouped.values())
    out.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    return out


@router.get("/unified-inbox")
async def list_unified_contact_inbox(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    chat_type: str = Query("all"),
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    user: dict = Depends(verify_messages_session),
):
    seller_id = seller_user_id.strip()
    await assert_inbox_owner(seller_id, user)
    type_filter = (chat_type or "all").strip().lower()
    if type_filter not in {"all", "gig", "job", "project"}:
        raise HTTPException(status_code=400, detail="chat_type must be one of: all, gig, job, project")

    sources = [
        ("gig", gig_contact_messages_collection),
        ("job", job_contact_messages_collection),
        ("project", project_contact_messages_collection),
    ]
    if type_filter != "all":
        sources = [source for source in sources if source[0] == type_filter]

    merged = []
    counts_by_type = {}
    name_cache: dict[str, str] = {}
    avatar_cache: dict = {}
    presence_cache: dict[str, str] = {}
    viewer_ids = _viewer_idents(seller_id, user)
    viewer_lower = {x.lower() for x in viewer_ids}

    or_clauses = []
    for ident in viewer_ids:
        or_clauses.append({"seller_user_id": {"$regex": f"^{ident}$", "$options": "i"}})
        or_clauses.append({"candidate_user_id": {"$regex": f"^{ident}$", "$options": "i"}})
        or_clauses.append({"from_user_id": {"$regex": f"^{ident}$", "$options": "i"}})
    query = {"$or": or_clauses} if or_clauses else {"seller_user_id": seller_id}

    for source_type, collection in sources:
        await _mark_messages_delivered(collection, viewer_ids)
        counts_by_type[source_type] = await collection.count_documents(query)
        fetch_limit = min(max(limit * 3, 80), 250)
        cursor = collection.find(query).sort("created_at", -1).limit(fetch_limit)
        async for doc in cursor:
            if doc.get("deleted"):
                continue
            uid = str(doc.get("from_user_id") or doc.get("sender_user_id") or "").strip()
            candidate = str(doc.get("candidate_user_id") or "").strip()
            seller = str(doc.get("seller_user_id") or "").strip()
            resolved_name = await _resolve_user_name(uid, name_cache)
            row = _serialize_unified_contact(doc, source_type, resolved_name)
            row["from_user_imageurl"] = await _resolve_user_avatar(uid, avatar_cache)
            if candidate:
                row["candidate_user_id"] = candidate

            peer = _peer_for_viewer(row, viewer_lower)
            if not peer:
                continue

            viewer_is_candidate = _is_viewer(candidate, viewer_lower)
            sender_is_viewer = _is_viewer(uid, viewer_lower)

            # Company / employer thread addressed to me
            if viewer_is_candidate and seller and not _is_viewer(seller, viewer_lower):
                brand = await _resolve_company_branding(seller, avatar_cache)
                peer_name = brand.get("name") or await _resolve_user_name(seller, name_cache)
                peer_avatar = brand.get("imageurl") or await _resolve_user_avatar(seller, avatar_cache)
                row["peer_user_id"] = seller
                row["peer_user_name"] = peer_name
                row["from_user_name"] = peer_name
                row["from_user_imageurl"] = peer_avatar
                row["candidate_user_id"] = candidate
                if str(row.get("context_id") or "").startswith("team-"):
                    row["chat_tag"] = "Company"
                row["online_status"] = await _resolve_user_presence(seller, presence_cache)
            elif sender_is_viewer and seller and not _is_viewer(seller, viewer_lower):
                # My outbound message → list peer is the seller/recipient
                brand = await _resolve_company_branding(seller, avatar_cache)
                peer_name = brand.get("name") or await _resolve_user_name(seller, name_cache)
                peer_avatar = brand.get("imageurl") or await _resolve_user_avatar(seller, avatar_cache)
                row["peer_user_id"] = seller
                row["peer_user_name"] = peer_name
                row["from_user_name"] = peer_name
                row["from_user_imageurl"] = peer_avatar
                row["online_status"] = await _resolve_user_presence(seller, presence_cache)
            else:
                row["peer_user_id"] = peer
                row["peer_user_name"] = await _resolve_user_name(peer, name_cache)
                if sender_is_viewer or _is_viewer(str(row.get("from_user_id") or ""), viewer_lower):
                    row["from_user_name"] = row["peer_user_name"]
                    row["from_user_imageurl"] = await _resolve_user_avatar(peer, avatar_cache)
                row["online_status"] = await _resolve_user_presence(peer, presence_cache)

            row["is_online"] = row.get("online_status") == "online"
            # Keep real sender on the raw row for thread bubbles via thread_messages path:
            # list grouping will pin peer onto from_* for sidebar only.
            row["_raw_from_user_id"] = uid
            merged.append(row)

    merged.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    conversations = _group_peer_conversations(merged, viewer_lower)

    # After grouping, resolve peer display fields that may still be empty
    for item in conversations:
        peer = str(item.get("peer_user_id") or item.get("from_user_id") or "").strip()
        if peer:
            if not item.get("from_user_name") or item.get("from_user_name") == peer:
                item["from_user_name"] = await _resolve_user_name(peer, name_cache)
            if not item.get("from_user_imageurl"):
                brand = await _resolve_company_branding(peer, avatar_cache)
                item["from_user_imageurl"] = brand.get("imageurl") or await _resolve_user_avatar(peer, avatar_cache)
                if brand.get("name") and (
                    not item.get("from_user_name") or item.get("from_user_name") == peer
                ):
                    item["from_user_name"] = brand["name"]
            if not item.get("online_status"):
                item["online_status"] = await _resolve_user_presence(peer, presence_cache)
                item["is_online"] = item["online_status"] == "online"
            item["from_user_id"] = peer
            item["peer_user_id"] = peer

    paged = conversations[skip : skip + limit]
    thread_messages = []
    for item in merged:
        clone = dict(item)
        # Restore real sender for chat bubbles
        if clone.get("_raw_from_user_id"):
            clone["from_user_id"] = clone.pop("_raw_from_user_id")
        else:
            clone.pop("_raw_from_user_id", None)
        clone.pop("_sort_created_at", None)
        thread_messages.append(clone)

    for item in paged:
        item.pop("_sort_created_at", None)
        item.pop("_raw_from_user_id", None)

    return {
        "status": "success",
        "total": len(conversations),
        "counts_by_type": counts_by_type,
        "messages": paged,
        "thread_messages": thread_messages,
    }
