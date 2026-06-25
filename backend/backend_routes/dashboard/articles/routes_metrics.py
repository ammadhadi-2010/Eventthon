from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Form, HTTPException

from .article_config import article_collection
from .article_helpers import serialize_article

router = APIRouter()

METRIC_MAP = {
    "view": {"metadata.views": 1},
    "like": {"metadata.likes": 1},
    "share": {"metadata.shares": 1},
    "send": {"metadata.sends": 1, "send_count": 1},
    "comment": {"metadata.comments": 1, "comments_count": 1},
}


@router.post("/{article_id}/metrics")
async def update_article_metrics(article_id: str, action: str = Form(...)):
    try:
        if not ObjectId.is_valid(article_id):
            raise HTTPException(status_code=400, detail="Invalid article id")

        action_key = action.strip().lower()
        if action_key not in METRIC_MAP:
            raise HTTPException(status_code=400, detail="Unsupported metric action")

        update_data = {"$inc": METRIC_MAP[action_key], "$set": {"updated_at": datetime.utcnow()}}
        result = await article_collection.update_one({"_id": ObjectId(article_id)}, update_data)
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")

        article = await article_collection.find_one({"_id": ObjectId(article_id)})
        return {"status": "success", "data": serialize_article(article)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Metric update failed: {exc}")
