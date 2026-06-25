from bson import ObjectId
from fastapi import APIRouter, HTTPException

from .helpers import _collection_by_chat_type
from .schemas import UnifiedContactDeliveryPayload

router = APIRouter()


@router.post("/unified-delivery")
async def update_unified_delivery_status(payload: UnifiedContactDeliveryPayload):
    collection, _ = _collection_by_chat_type(payload.chat_type)
    delivery = payload.delivery_status.strip().lower()
    if delivery not in {"sent", "delivered", "read"}:
        raise HTTPException(status_code=400, detail="delivery_status must be one of: sent, delivered, read")

    raw_id = payload.message_id.strip()
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid message_id")

    result = await collection.update_one({"_id": ObjectId(raw_id)}, {"$set": {"delivery_status": delivery}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"status": "success", "id": raw_id, "delivery_status": delivery}
