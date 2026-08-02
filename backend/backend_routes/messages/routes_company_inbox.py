"""Employer company hub inbox — candidate applicants and admin support channels."""
from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import (
    company_hiring_threads_collection,
    company_support_messages_collection,
    job_contact_messages_collection,
    user_collection,
)

from .helpers import (
    _normalize_attachments,
    _resolve_user_avatar,
    _resolve_user_name,
    _resolve_user_presence,
    _serialize_unified_contact,
    _mark_messages_delivered,
)

router = APIRouter()

ADMIN_SUPPORT_ACTOR = "eventthon-admin-support"
ADMIN_SUPPORT_TITLE = "EventThon Admin Support"


def _serialize_support(doc: dict, from_name: str) -> dict:
    base = _serialize_unified_contact(
        {
            **doc,
            "job_id": doc.get("thread_id") or "admin-support",
            "job_title": ADMIN_SUPPORT_TITLE,
            "from_user_id": doc.get("from_user_id") or ADMIN_SUPPORT_ACTOR,
            "seller_user_id": doc.get("employer_user_id") or "",
            "body": doc.get("body") or doc.get("message") or "",
        },
        "job",
        from_name,
    )
    base["chat_type"] = "admin_support"
    base["chat_tag"] = "Admin Support"
    base["channel"] = "admin_support"
    return base


def _peer_user_id(row: dict, employer_id: str) -> str:
    """Conversation peer for company inbox (member/applicant), not the employer sender."""
    employer = str(employer_id or "").strip().lower()
    seller = str(row.get("seller_user_id") or employer_id or "").strip().lower()
    self_ids = {x for x in (employer, seller) if x}
    candidate = str(row.get("candidate_user_id") or row.get("to_user_id") or "").strip()
    if candidate and candidate.lower() not in self_ids:
        return candidate
    sender = str(row.get("from_user_id") or "").strip()
    if sender and sender.lower() not in self_ids:
        return sender
    return ""


def _is_employer_self(peer: str, employer_id: str, seller_user_id: str = "") -> bool:
    peer_l = str(peer or "").strip().lower()
    if not peer_l:
        return True
    return peer_l in {
        str(employer_id or "").strip().lower(),
        str(seller_user_id or employer_id or "").strip().lower(),
    }


def _serialize_candidate(doc: dict, from_name: str) -> dict:
    row = _serialize_unified_contact(doc, "job", from_name)
    row["channel"] = "candidate"
    ctx = str(row.get("context_id") or doc.get("job_id") or "").strip()
    if ctx.startswith("team-"):
        row["chat_tag"] = "Team Member"
    else:
        row["chat_tag"] = "Applicant"
    candidate_uid = str(doc.get("candidate_user_id") or row.get("candidate_user_id") or "").strip()
    if candidate_uid:
        row["candidate_user_id"] = candidate_uid
    # Optional enrichment fields (pass-through; safe if missing)
    for key in (
        "hiring_stage",
        "salary_range",
        "salary_min",
        "salary_max",
        "recruiter_name",
        "from_user_imageurl",
        "is_verified",
        "online_status",
        "labels",
        "candidate_skills",
    ):
        if key in doc and doc.get(key) is not None:
            row[key] = doc.get(key)
    return row


async def _enrich_candidate_row(row: dict, employer_id: str, skill_cache: dict, avatar_cache: dict) -> dict:
    candidate = _peer_user_id(row, employer_id)
    job_id = str(row.get("context_id") or row.get("job_id") or "").strip()
    if not candidate:
        return row
    row["candidate_user_id"] = candidate
    sender = str(row.get("from_user_id") or "").strip()
    if sender.lower() == candidate.lower() and not row.get("from_user_imageurl"):
        row["from_user_imageurl"] = await _resolve_user_avatar(candidate, avatar_cache)
    key = f"{employer_id.strip().lower()}::{candidate.lower()}::{job_id}"
    thread = await company_hiring_threads_collection.find_one({"thread_key": key})
    if not thread and job_id:
        # fallback without job
        thread = await company_hiring_threads_collection.find_one(
            {
                "employer_user_id": {"$regex": f"^{employer_id}$", "$options": "i"},
                "candidate_user_id": {"$regex": f"^{candidate}$", "$options": "i"},
            }
        )
    if thread:
        row["hiring_stage"] = str(thread.get("hiring_stage") or row.get("hiring_stage") or "applied")
        labels = thread.get("labels") or []
        if isinstance(labels, list):
            row["labels"] = [str(x).lower() for x in labels if str(x).strip()]
    if candidate not in skill_cache:
        skills = []
        user = await user_collection.find_one(
            {"$or": [{"email": candidate.lower()}, {"_id": candidate}]}
        )
        if not user:
            try:
                user = await user_collection.find_one({"_id": ObjectId(candidate)})
            except Exception:
                user = None
        raw = (user or {}).get("skills") or (user or {}).get("top_skills") or []
        if isinstance(raw, list):
            for s in raw[:8]:
                label = (s.get("name") if isinstance(s, dict) else str(s) or "").strip()
                if label:
                    skills.append(label)
        skill_cache[candidate] = skills
    row["candidate_skills"] = skill_cache.get(candidate) or []
    presence = await _resolve_user_presence(candidate, avatar_cache)
    row["online_status"] = presence
    row["is_online"] = presence == "online"
    return row


async def _ensure_support_thread(employer_id: str) -> None:
    existing = await company_support_messages_collection.find_one(
        {"employer_user_id": employer_id, "thread_kind": "admin_support"}
    )
    if existing:
        return
    now = datetime.utcnow()
    await company_support_messages_collection.insert_one(
        {
            "employer_user_id": employer_id,
            "thread_kind": "admin_support",
            "thread_id": f"support-{employer_id}",
            "from_user_id": ADMIN_SUPPORT_ACTOR,
            "from_user_name": "EventThon Admin",
            "body": "Welcome to employer support. Ask verification or billing questions here.",
            "status": "new",
            "created_at": now,
        }
    )


class CompanySupportSendBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    body: str = Field("", max_length=4000)
    attachments: list[dict] = Field(default_factory=list)


@router.post("/company-support-send")
async def send_company_support_message(payload: CompanySupportSendBody):
    employer_id = payload.employer_user_id.strip()
    body = payload.body.strip()
    attachments = _normalize_attachments(payload.attachments)
    if not body and not attachments:
        raise HTTPException(status_code=400, detail="Message body or attachment is required")
    if not body and attachments:
        body = "Attachment"
    await _ensure_support_thread(employer_id)
    now = datetime.utcnow()
    doc = {
        "employer_user_id": employer_id,
        "thread_kind": "admin_support",
        "thread_id": f"support-{employer_id}",
        "from_user_id": employer_id,
        "from_user_name": "Employer",
        "body": body,
        "attachments": attachments,
        "message_type": "attachment" if attachments else "text",
        "status": "new",
        "delivery_status": "sent",
        "created_at": now,
    }
    result = await company_support_messages_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {
        "status": "success",
        "id": str(result.inserted_id),
        "message": _serialize_support(doc, "Employer"),
    }


def _conversation_key(row: dict, employer_id: str) -> str:
    channel = str(row.get("channel") or "").strip().lower()
    chat_type = str(row.get("chat_type") or "").strip().lower()
    if channel == "admin_support" or chat_type == "admin_support":
        return f"support::{employer_id.strip().lower()}"
    peer = _peer_user_id(row, employer_id)
    if not peer:
        return ""
    job_id = str(row.get("context_id") or row.get("job_id") or "").strip()
    return f"candidate::{peer.lower()}::{job_id}"


def _pin_candidate_peer(conv: dict, row: dict, employer_id: str, peer_name_cache: dict | None = None) -> None:
    """Keep sidebar identity on the member/applicant even when employer sent last."""
    peer = _peer_user_id(row, employer_id) or _peer_user_id(conv, employer_id)
    if not peer or _is_employer_self(peer, employer_id, str(row.get("seller_user_id") or "")):
        return
    conv["candidate_user_id"] = peer
    conv["from_user_id"] = peer
    peer_name = str(
        row.get("peer_user_name")
        or conv.get("peer_user_name")
        or (row.get("from_user_name") if str(row.get("from_user_id") or "").strip().lower() == peer.lower() else "")
        or conv.get("from_user_name")
        or ""
    ).strip()
    if peer_name_cache and (not peer_name or peer_name.lower() == peer.lower()):
        peer_name = str(peer_name_cache.get(peer.lower()) or peer_name or peer).strip()
    conv["from_user_name"] = peer_name or peer
    if str(row.get("context_id") or "").startswith("team-"):
        conv["chat_tag"] = "Team Member"
    if row.get("from_user_imageurl") and str(row.get("from_user_id") or "").strip().lower() == peer.lower():
        conv["from_user_imageurl"] = row.get("from_user_imageurl")
    elif not conv.get("from_user_imageurl") and row.get("from_user_imageurl"):
        conv["from_user_imageurl"] = row.get("from_user_imageurl")


def _group_conversations(rows: list[dict], employer_id: str, peer_name_cache: dict | None = None) -> list[dict]:
    """One sidebar row per peer/thread — not one row per message."""
    grouped: dict[str, dict] = {}
    for row in rows:
        key = _conversation_key(row, employer_id)
        if not key:
            continue
        current = grouped.get(key)
        row_time = row.get("_sort_created_at") or datetime.min
        if not current:
            conv = dict(row)
            conv["conversation_key"] = key
            conv["_id"] = f"conv-{key}"
            if key.startswith("support::"):
                conv["from_user_id"] = ADMIN_SUPPORT_ACTOR
                conv["from_user_name"] = "EventThon Admin"
                conv["chat_tag"] = "Admin Support"
                conv["channel"] = "admin_support"
                conv["chat_type"] = "admin_support"
                if current_avatar := str(row.get("from_user_imageurl") or "").strip():
                    conv["from_user_imageurl"] = current_avatar
            else:
                _pin_candidate_peer(conv, row, employer_id, peer_name_cache)
                if _is_employer_self(conv.get("from_user_id"), employer_id, conv.get("seller_user_id")):
                    continue
            grouped[key] = conv
            continue
        cur_time = current.get("_sort_created_at") or datetime.min
        if row_time >= cur_time:
            preview = dict(row)
            preview["conversation_key"] = key
            preview["_id"] = current["_id"]
            if key.startswith("support::"):
                preview["from_user_id"] = ADMIN_SUPPORT_ACTOR
                preview["from_user_name"] = "EventThon Admin"
                preview["chat_tag"] = "Admin Support"
                preview["channel"] = "admin_support"
                preview["chat_type"] = "admin_support"
                preview["from_user_imageurl"] = (
                    str(row.get("from_user_imageurl") or current.get("from_user_imageurl") or "").strip()
                )
            else:
                # Preserve peer identity from prior grouping when latest msg is from employer
                preview["from_user_name"] = current.get("from_user_name") or preview.get("from_user_name")
                preview["from_user_imageurl"] = current.get("from_user_imageurl") or preview.get("from_user_imageurl")
                preview["chat_tag"] = current.get("chat_tag") or preview.get("chat_tag")
                _pin_candidate_peer(preview, row, employer_id, peer_name_cache)
                if _is_employer_self(preview.get("from_user_id"), employer_id, preview.get("seller_user_id")):
                    continue
            grouped[key] = preview
        elif key.startswith("support::") and not current.get("from_user_imageurl") and row.get("from_user_imageurl"):
            current["from_user_imageurl"] = row.get("from_user_imageurl")
        elif not key.startswith("support::"):
            # Older message from peer can still supply name/avatar
            peer = _peer_user_id(row, employer_id)
            if peer and str(row.get("from_user_id") or "").strip().lower() == peer.lower():
                if row.get("from_user_name") and (
                    not current.get("from_user_name")
                    or current.get("from_user_name") == current.get("from_user_id")
                ):
                    current["from_user_name"] = row.get("from_user_name")
                if row.get("from_user_imageurl") and not current.get("from_user_imageurl"):
                    current["from_user_imageurl"] = row.get("from_user_imageurl")
    out = [
        item
        for item in grouped.values()
        if str(item.get("channel") or "").lower() == "admin_support"
        or str(item.get("chat_type") or "").lower() == "admin_support"
        or not _is_employer_self(item.get("from_user_id") or item.get("candidate_user_id"), employer_id, item.get("seller_user_id"))
    ]
    out.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    return out


@router.get("/company-inbox")
async def list_company_inbox(
    employer_user_id: str = Query(..., min_length=2, max_length=120),
    channel: str = Query("all"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    employer_id = employer_user_id.strip()
    channel_key = (channel or "all").strip().lower()
    if channel_key not in {"all", "candidate", "admin_support"}:
        raise HTTPException(status_code=400, detail="channel must be all, candidate, or admin_support")

    await _ensure_support_thread(employer_id)
    name_cache: dict[str, str] = {}
    skill_cache: dict[str, list] = {}
    avatar_cache: dict[str, str] = {}
    merged = []

    if channel_key in {"all", "candidate"}:
        # Case-insensitive employer match + employer-authored team replies
        employer_re = {"$regex": f"^{employer_id}$", "$options": "i"}
        await _mark_messages_delivered(job_contact_messages_collection, [employer_id])
        cursor = job_contact_messages_collection.find(
            {
                "$or": [
                    {"seller_user_id": employer_re},
                    {"from_user_id": employer_re},
                ]
            }
        ).sort("created_at", -1).limit(200)
        async for doc in cursor:
            uid = str(doc.get("from_user_id") or "").strip()
            peer = _peer_user_id(
                {
                    "from_user_id": uid,
                    "candidate_user_id": doc.get("candidate_user_id"),
                    "seller_user_id": doc.get("seller_user_id") or employer_id,
                },
                employer_id,
            )
            display_name = await _resolve_user_name(peer or uid, name_cache)
            row = _serialize_candidate(doc, display_name)
            # Message bubble still needs real sender; list grouping pins peer separately
            row["from_user_id"] = uid
            row["from_user_name"] = await _resolve_user_name(uid, name_cache)
            if peer:
                row["candidate_user_id"] = peer
            merged.append(await _enrich_candidate_row(row, employer_id, skill_cache, avatar_cache))

    if channel_key in {"all", "admin_support"}:
        cursor = company_support_messages_collection.find(
            {"employer_user_id": {"$regex": f"^{employer_id}$", "$options": "i"}}
        ).sort("created_at", -1).limit(80)
        async for doc in cursor:
            from_id = str(doc.get("from_user_id") or ADMIN_SUPPORT_ACTOR)
            from_name = str(doc.get("from_user_name") or "EventThon Admin")
            if from_id != ADMIN_SUPPORT_ACTOR:
                from_name = await _resolve_user_name(from_id, name_cache)
            row = _serialize_support(doc, from_name)
            # Conversation list shows Admin identity for support thread
            if from_id == ADMIN_SUPPORT_ACTOR or str(row.get("channel")) == "admin_support":
                row["from_user_imageurl"] = (
                    await _resolve_user_avatar("eventthon@gmail.com", avatar_cache)
                    or await _resolve_user_avatar(ADMIN_SUPPORT_ACTOR, avatar_cache)
                    or ""
                )
            else:
                row["from_user_imageurl"] = await _resolve_user_avatar(from_id, avatar_cache)
            merged.append(row)

    merged.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    peer_name_cache = {str(k).strip().lower(): v for k, v in name_cache.items() if v}
    conversations = _group_conversations(merged, employer_id, peer_name_cache)
    paged = conversations[skip : skip + limit]
    thread_messages = []
    for item in merged:
        # Keep real message history (including employer-sent) for open threads
        if not _peer_user_id(item, employer_id) and str(item.get("channel") or "").lower() != "admin_support":
            # Orphan employer-only rows still stay out of sidebar; omit from threads too
            if _is_employer_self(item.get("from_user_id"), employer_id, item.get("seller_user_id")):
                continue
        clone = dict(item)
        clone.pop("_sort_created_at", None)
        thread_messages.append(clone)
    for item in paged:
        item.pop("_sort_created_at", None)
        # Resolve peer display name if still an id/email
        peer = str(item.get("from_user_id") or item.get("candidate_user_id") or "").strip()
        if peer and (not item.get("from_user_name") or item.get("from_user_name") == peer):
            item["from_user_name"] = await _resolve_user_name(peer, name_cache)
        if peer and not item.get("from_user_imageurl"):
            item["from_user_imageurl"] = await _resolve_user_avatar(peer, avatar_cache)
        if peer:
            presence = await _resolve_user_presence(peer, avatar_cache)
            item["online_status"] = presence
            item["is_online"] = presence == "online"

    support_keys = {k for k in (_conversation_key(r, employer_id) for r in merged) if k and k.startswith("support::")}
    candidate_keys = {k for k in (_conversation_key(r, employer_id) for r in merged) if k and k.startswith("candidate::")}
    counts = {
        "candidate": len(candidate_keys),
        "admin_support": len(support_keys),
    }
    return {
        "status": "success",
        "total": counts["candidate"] + counts["admin_support"],
        "counts_by_channel": counts,
        "messages": paged,
        "thread_messages": thread_messages,
    }
