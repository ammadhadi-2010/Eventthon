from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query

from database import (
    gig_contact_messages_collection,
    job_contact_messages_collection,
    project_contact_messages_collection,
)

from .helpers import _resolve_user_name, _serialize_unified_contact
from .messages_session import assert_inbox_owner, verify_messages_session

router = APIRouter()


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
    query = {"seller_user_id": seller_id}

    for source_type, collection in sources:
        counts_by_type[source_type] = await collection.count_documents(query)
        fetch_limit = min(max(limit * 3, 50), 200)
        cursor = collection.find(query).sort("created_at", -1).limit(fetch_limit)
        async for doc in cursor:
            if doc.get("deleted"):
                continue
            uid = str(doc.get("from_user_id") or doc.get("sender_user_id") or "").strip()
            resolved_name = await _resolve_user_name(uid, name_cache)
            merged.append(_serialize_unified_contact(doc, source_type, resolved_name))

    merged.sort(key=lambda item: item.get("_sort_created_at", datetime.min), reverse=True)
    paged = merged[skip : skip + limit]
    for item in paged:
        item.pop("_sort_created_at", None)

    return {
        "status": "success",
        "total": sum(counts_by_type.values()),
        "counts_by_type": counts_by_type,
        "messages": paged,
    }
