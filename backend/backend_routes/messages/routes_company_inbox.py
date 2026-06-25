"""Employer company hub inbox — candidate applicants and admin support channels."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import company_support_messages_collection, job_contact_messages_collection

from .helpers import _resolve_user_name, _serialize_unified_contact

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


def _serialize_candidate(doc: dict, from_name: str) -> dict:
    row = _serialize_unified_contact(doc, "job", from_name)
    row["channel"] = "candidate"
    row["chat_tag"] = "Applicant"
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
    body: str = Field(..., min_length=1, max_length=4000)


@router.post("/company-support-send")
async def send_company_support_message(payload: CompanySupportSendBody):
    employer_id = payload.employer_user_id.strip()
    body = payload.body.strip()
    if not body:
        raise HTTPException(status_code=400, detail="Message body is required")
    await _ensure_support_thread(employer_id)
    now = datetime.utcnow()
    result = await company_support_messages_collection.insert_one(
        {
            "employer_user_id": employer_id,
            "thread_kind": "admin_support",
            "thread_id": f"support-{employer_id}",
            "from_user_id": employer_id,
            "from_user_name": "Employer",
            "body": body,
            "status": "new",
            "created_at": now,
        }
    )
    return {"status": "success", "id": str(result.inserted_id)}


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
    merged = []

    if channel_key in {"all", "candidate"}:
        cursor = job_contact_messages_collection.find({"seller_user_id": employer_id}).sort("created_at", -1).limit(120)
        async for doc in cursor:
            uid = str(doc.get("from_user_id") or "").strip()
            merged.append(_serialize_candidate(doc, await _resolve_user_name(uid, name_cache)))

    if channel_key in {"all", "admin_support"}:
        cursor = company_support_messages_collection.find({"employer_user_id": employer_id}).sort(
            "created_at", -1
        ).limit(80)
        async for doc in cursor:
            from_id = str(doc.get("from_user_id") or ADMIN_SUPPORT_ACTOR)
            from_name = str(doc.get("from_user_name") or "EventThon Admin")
            if from_id != ADMIN_SUPPORT_ACTOR:
                from_name = await _resolve_user_name(from_id, name_cache)
            merged.append(_serialize_support(doc, from_name))

    merged.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    paged = merged[skip : skip + limit]
    for item in paged:
        item.pop("_sort_created_at", None)

    counts = {
        "candidate": await job_contact_messages_collection.count_documents({"seller_user_id": employer_id}),
        "admin_support": await company_support_messages_collection.count_documents(
            {"employer_user_id": employer_id}
        ),
    }
    return {
        "status": "success",
        "total": counts["candidate"] + counts["admin_support"],
        "counts_by_channel": counts,
        "messages": paged,
    }
