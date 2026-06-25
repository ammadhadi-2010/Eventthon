from fastapi import APIRouter, Query

from database import message_conversation_preferences_collection

from .helpers import _collection_by_chat_type, _find_user_by_identifier, _pick_user_name, _to_iso

router = APIRouter()


@router.get("/conversation-sidebar")
async def get_conversation_sidebar(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    viewer_user_id: str = Query(..., min_length=2, max_length=120),
    chat_type: str = Query("gig", min_length=3, max_length=20),
    context_id: str = Query("", max_length=120),
    context_title: str = Query("", max_length=240),
):
    collection, normalized_type = _collection_by_chat_type(chat_type)
    seller = seller_user_id.strip()
    viewer = viewer_user_id.strip()
    context_id_text = context_id.strip()
    context_title_text = context_title.strip()

    user_doc = await _find_user_by_identifier(seller)
    preference_doc = await message_conversation_preferences_collection.find_one({"seller_user_id": seller, "viewer_user_id": viewer}) or {}

    filters = {"seller_user_id": seller}
    id_key = {"gig": "gig_id", "job": "job_id", "project": "project_id"}[normalized_type]
    title_key = {"gig": "gig_title", "job": "job_title", "project": "project_title"}[normalized_type]
    if context_id_text:
        filters[id_key] = context_id_text
    elif context_title_text:
        filters[title_key] = context_title_text

    files = []
    cursor = collection.find(filters).sort("created_at", -1).limit(40)
    async for doc in cursor:
        created_iso = _to_iso(doc.get("created_at"))
        for idx, item in enumerate(doc.get("attachments") or []):
            if isinstance(item, dict):
                files.append(
                    {
                        "id": f"{str(doc.get('_id') or '')}-{idx}",
                        "name": str(item.get("name") or f"attachment-{idx + 1}").strip(),
                        "url": str(item.get("url") or "").strip(),
                        "type": str(item.get("type") or "").strip().lower(),
                        "size": int(item.get("size") or 0),
                        "created_at": created_iso,
                    }
                )

    return {
        "status": "success",
        "profile": {
            "name": _pick_user_name(user_doc) or seller,
            "country": str(user_doc.get("country") or user_doc.get("location_country") or user_doc.get("location") or "Pakistan").strip(),
            "member_since": _to_iso(user_doc.get("created_at") or user_doc.get("joined_at")),
            "total_orders": int(user_doc.get("total_orders") or 0),
            "rating": float(user_doc.get("rating") or 4.9),
            "reviews": int(user_doc.get("total_reviews") or user_doc.get("reviews_count") or 0),
            "badge": str(user_doc.get("badge") or "Top Rated Seller").strip(),
            "online": bool(user_doc.get("is_online") or False),
        },
        "order": {
            "order_id": context_id_text or "#ORD-12548",
            "title": context_title_text or "Untitled context",
            "status": "In Progress",
            "chat_type": normalized_type,
        },
        "files": files[:12],
        "preferences": {
            "away_enabled": bool(preference_doc.get("away_enabled") or False),
            "muted": bool(preference_doc.get("muted") or False),
            "blocked": bool(preference_doc.get("blocked") or False),
        },
    }
