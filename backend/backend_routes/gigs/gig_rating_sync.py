"""Recompute gig rating aggregates from stored reviews."""
from __future__ import annotations

from bson import ObjectId

from database import gig_reviews_collection, gigs_collection


async def sync_gig_rating(gig_id: str) -> None:
    raw = str(gig_id or "").strip()
    if not raw or not ObjectId.is_valid(raw):
        return

    oid = ObjectId(raw)
    ratings: list[int] = []
    cursor = gig_reviews_collection.find({"gig_id": raw})
    async for doc in cursor:
        try:
            ratings.append(int(doc.get("rating") or 0))
        except (TypeError, ValueError):
            continue

    if not ratings:
        await gigs_collection.update_one(
            {"_id": oid},
            {"$set": {"rating": 0.0, "review_count": 0}},
        )
        return

    avg = round(sum(ratings) / len(ratings), 2)
    await gigs_collection.update_one(
        {"_id": oid},
        {"$set": {"rating": avg, "review_count": len(ratings)}},
    )
