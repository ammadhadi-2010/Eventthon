from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from .article_config import article_collection
from .article_helpers import resolve_author, serialize_article
from backend_routes.dashboard.post_feed_enrich import enrich_articles_list

router = APIRouter()


@router.get("/all")
async def get_articles():
    try:
        cursor = article_collection.find().sort("created_at", -1)
        articles = await cursor.to_list(length=100)
        serialized = [serialize_article(art) for art in articles]
        return await enrich_articles_list(serialized)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Articles fetch failed: {exc}")


@router.get("/mine")
async def get_my_articles(identifier: str = Query(..., min_length=1)):
    try:
        author = await resolve_author(identifier)
        if not author:
            raise HTTPException(status_code=404, detail="Author not found")

        author_oid = str(author["_id"])
        author_email = (author.get("email") or "").strip().lower()
        query = {
            "$or": [
                {"author_id": author_oid},
                {"author_email": author_email},
            ]
        }
        if author.get("mobile"):
            query["$or"].append({"author_mobile": author.get("mobile")})

        cursor = article_collection.find(query).sort("created_at", -1)
        articles = await cursor.to_list(length=200)
        serialized = [serialize_article(art) for art in articles]
        return await enrich_articles_list(serialized)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"My articles fetch failed: {exc}")


@router.get("/slug/{slug}")
async def get_article_by_slug(slug: str):
    try:
        article = await article_collection.find_one({"slug": slug.strip()})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        serialized = serialize_article(article)
        enriched = await enrich_articles_list([serialized])
        return {"status": "success", "data": enriched[0]}
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
        serialized = serialize_article(article)
        enriched = await enrich_articles_list([serialized])
        return {"status": "success", "data": enriched[0]}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Article load failed: {exc}")
