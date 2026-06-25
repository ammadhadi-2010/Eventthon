from bson import ObjectId
from fastapi import APIRouter, HTTPException

from .article_config import article_collection
from .article_helpers import serialize_article

router = APIRouter()


@router.get("/all")
async def get_articles():
    try:
        cursor = article_collection.find().sort("created_at", -1)
        articles = await cursor.to_list(length=100)
        return [serialize_article(art) for art in articles]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Articles fetch failed: {exc}")


@router.get("/slug/{slug}")
async def get_article_by_slug(slug: str):
    try:
        article = await article_collection.find_one({"slug": slug.strip()})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return {"status": "success", "data": serialize_article(article)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Article load failed: {exc}")


@router.get("/{article_id}")
async def get_article_by_id(article_id: str):
    try:
        if not ObjectId.is_valid(article_id):
            raise HTTPException(status_code=400, detail="Invalid article id")
        article = await article_collection.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return {"status": "success", "data": serialize_article(article)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Article load failed: {exc}")
