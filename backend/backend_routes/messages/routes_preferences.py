from datetime import datetime

from fastapi import APIRouter, Query

from database import message_conversation_preferences_collection

from .schemas import ConversationPreferencePayload

router = APIRouter()


@router.get("/conversation-preferences")
async def get_conversation_preferences(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    viewer_user_id: str = Query(..., min_length=2, max_length=120),
):
    seller = seller_user_id.strip()
    viewer = viewer_user_id.strip()
    row = await message_conversation_preferences_collection.find_one({"seller_user_id": seller, "viewer_user_id": viewer})
    if not row:
        return {
            "status": "success",
            "preferences": {
                "seller_user_id": seller,
                "viewer_user_id": viewer,
                "away_enabled": False,
                "muted": False,
                "blocked": False,
            },
        }
    return {
        "status": "success",
        "preferences": {
            "seller_user_id": seller,
            "viewer_user_id": viewer,
            "away_enabled": bool(row.get("away_enabled") or False),
            "muted": bool(row.get("muted") or False),
            "blocked": bool(row.get("blocked") or False),
        },
    }


@router.post("/conversation-preferences")
async def update_conversation_preferences(payload: ConversationPreferencePayload):
    seller = payload.seller_user_id.strip()
    viewer = payload.viewer_user_id.strip()
    await message_conversation_preferences_collection.update_one(
        {"seller_user_id": seller, "viewer_user_id": viewer},
        {
            "$set": {
                "away_enabled": bool(payload.away_enabled),
                "muted": bool(payload.muted),
                "blocked": bool(payload.blocked),
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {
                "seller_user_id": seller,
                "viewer_user_id": viewer,
                "created_at": datetime.utcnow(),
            },
        },
        upsert=True,
    )
    return {
        "status": "success",
        "preferences": {
            "seller_user_id": seller,
            "viewer_user_id": viewer,
            "away_enabled": bool(payload.away_enabled),
            "muted": bool(payload.muted),
            "blocked": bool(payload.blocked),
        },
    }
