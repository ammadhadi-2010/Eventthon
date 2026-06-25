from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from database import gig_reviews_collection

from .gig_rating_sync import sync_gig_rating
from .gigs_session import assert_actor_id, assert_gig_owner, verify_gigs_session

router = APIRouter(prefix="/gigs/reviews", tags=["Gig Reviews"])


def _to_iso(raw):
    if isinstance(raw, datetime):
        return raw.isoformat()
    return str(raw or "")


def _empty_breakdown():
    return [{"stars": star, "count": 0} for star in [5, 4, 3, 2, 1]]


class GigReviewUpsertPayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    buyer_user_id: str = Field(..., min_length=2, max_length=120)
    buyer_name: str = Field(..., min_length=2, max_length=120)
    gig_id: str = Field("", max_length=120)
    gig_title: str = Field("Gig", max_length=240)
    order_id: str = Field("", max_length=120)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field("", max_length=2000)


def _serialize_review_row(doc: dict, seller_id: str) -> dict:
    return {
        "id": str(doc.get("_id") or ""),
        "seller_user_id": seller_id,
        "buyer_name": str(doc.get("buyer_name") or "Client").strip(),
        "gig_title": str(doc.get("gig_title") or "Gig").strip(),
        "comment": str(doc.get("comment") or "").strip(),
        "rating": int(doc.get("rating") or 0),
        "created_at": _to_iso(doc.get("created_at")),
    }


async def _rating_breakdown(seller_id: str) -> tuple[list[int], list[dict], float, int]:
    ratings: list[int] = []
    cursor = gig_reviews_collection.find({"seller_user_id": seller_id}).sort("created_at", -1).limit(400)
    async for doc in cursor:
        try:
            ratings.append(int(doc.get("rating") or 0))
        except (TypeError, ValueError):
            continue

    if not ratings:
        return [], _empty_breakdown(), 0.0, 0

    breakdown = []
    weighted = 0
    total = len(ratings)
    for star in [5, 4, 3, 2, 1]:
        count = sum(1 for value in ratings if value == star)
        breakdown.append({"stars": star, "count": count})
        weighted += star * count
    avg = round(weighted / total, 1) if total else 0.0
    return ratings, breakdown, avg, total


@router.get("/summary")
async def get_reviews_summary(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    with_comments: bool = Query(False),
    stars: int = Query(0, ge=0, le=5),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(verify_gigs_session),
):
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)

    query = {"seller_user_id": seller_id}
    if stars:
        query["rating"] = stars
    if with_comments:
        query["comment"] = {"$nin": ["", None]}

    rows = []
    cursor = gig_reviews_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    async for doc in cursor:
        rows.append(_serialize_review_row(doc, seller_id))

    _, breakdown, avg, total = await _rating_breakdown(seller_id)
    return {
        "status": "success",
        "summary": {
            "average_rating": avg,
            "total_reviews": total,
            "breakdown": breakdown,
        },
        "reviews": rows,
    }


@router.post("/")
async def upsert_gig_review(
    payload: GigReviewUpsertPayload,
    user: dict = Depends(verify_gigs_session),
):
    seller_id = payload.seller_user_id.strip()
    buyer_id = payload.buyer_user_id.strip()
    buyer_name = payload.buyer_name.strip()
    order_id = payload.order_id.strip()
    gig_id = payload.gig_id.strip()
    gig_title = payload.gig_title.strip() or "Gig"
    comment = payload.comment.strip()

    await assert_actor_id(buyer_id, user)
    if seller_id == buyer_id:
        raise HTTPException(status_code=400, detail="You cannot review your own gig")

    now = datetime.utcnow()
    base_filter = {"seller_user_id": seller_id, "buyer_user_id": buyer_id}
    if order_id:
        base_filter["order_id"] = order_id
    elif gig_id:
        base_filter["gig_id"] = gig_id
    else:
        base_filter["gig_title"] = gig_title

    update_doc = {
        "$set": {
            "seller_user_id": seller_id,
            "buyer_user_id": buyer_id,
            "buyer_name": buyer_name,
            "gig_id": gig_id,
            "gig_title": gig_title,
            "order_id": order_id,
            "rating": int(payload.rating),
            "comment": comment,
            "updated_at": now,
        },
        "$setOnInsert": {"created_at": now},
    }
    await gig_reviews_collection.update_one(base_filter, update_doc, upsert=True)
    saved = await gig_reviews_collection.find_one(base_filter)
    if gig_id:
        await sync_gig_rating(gig_id)

    return {
        "status": "success",
        "review": {
            "id": str(saved.get("_id") or ""),
            "seller_user_id": seller_id,
            "buyer_user_id": buyer_id,
            "buyer_name": buyer_name,
            "gig_id": gig_id,
            "gig_title": gig_title,
            "order_id": order_id,
            "rating": int(saved.get("rating") or payload.rating),
            "comment": str(saved.get("comment") or comment),
            "created_at": _to_iso(saved.get("created_at")),
            "updated_at": _to_iso(saved.get("updated_at")),
        },
    }
