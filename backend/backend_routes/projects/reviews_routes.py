from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from database import hub_project_reviews_collection

router = APIRouter(prefix="/projects/reviews", tags=["Project Reviews"])


def _to_iso(raw):
    if isinstance(raw, datetime):
        return raw.isoformat()
    return str(raw or "")


def _seed_reviews(owner_user_id: str):
    return [
        {
            "id": "pr-seed-1",
            "owner_user_id": owner_user_id,
            "buyer_name": "John O.",
            "project_title": "Squad Portal Redesign",
            "comment": "Delivered a polished redesign on schedule. Great collaboration.",
            "rating": 5,
            "created_at": "2025-06-04T00:00:00",
        },
        {
            "id": "pr-seed-2",
            "owner_user_id": owner_user_id,
            "buyer_name": "Sarah M.",
            "project_title": "Game Matchmaking API",
            "comment": "Solid architecture and clear documentation for handoff.",
            "rating": 5,
            "created_at": "2025-05-29T00:00:00",
        },
        {
            "id": "pr-seed-3",
            "owner_user_id": owner_user_id,
            "buyer_name": "Mike T.",
            "project_title": "SEO Analytics Dashboard",
            "comment": "Strong analytics UX. Minor tweaks needed post-launch.",
            "rating": 4,
            "created_at": "2025-05-26T00:00:00",
        },
    ]


class ProjectReviewPayload(BaseModel):
    owner_user_id: str = Field(..., min_length=2, max_length=120)
    buyer_user_id: str = Field(..., min_length=2, max_length=120)
    buyer_name: str = Field(..., min_length=2, max_length=120)
    project_id: str = Field("", max_length=120)
    project_title: str = Field("Project", max_length=240)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field("", max_length=2000)


@router.get("/summary")
async def get_project_reviews_summary(
    owner_user_id: str = Query(..., min_length=2, max_length=120),
    limit: int = Query(5, ge=1, le=20),
):
    owner_id = owner_user_id.strip()
    rows = []
    cursor = hub_project_reviews_collection.find({"owner_user_id": owner_id}).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        rows.append(
            {
                "id": str(doc.get("_id") or ""),
                "owner_user_id": owner_id,
                "buyer_name": str(doc.get("buyer_name") or "Client").strip(),
                "project_title": str(doc.get("project_title") or "Project").strip(),
                "comment": str(doc.get("comment") or "").strip(),
                "rating": int(doc.get("rating") or 0),
                "created_at": _to_iso(doc.get("created_at")),
            }
        )

    if not rows:
        rows = _seed_reviews(owner_id)[:limit]

    all_ratings = []
    all_cursor = hub_project_reviews_collection.find({"owner_user_id": owner_id}).limit(400)
    async for doc in all_cursor:
        all_ratings.append(int(doc.get("rating") or 0))
    if not all_ratings:
        all_ratings = [r["rating"] for r in _seed_reviews(owner_id)]

    breakdown = []
    weighted = 0
    total = len(all_ratings)
    for star in [5, 4, 3, 2, 1]:
        count = sum(1 for value in all_ratings if value == star)
        breakdown.append({"stars": star, "count": count})
        weighted += star * count
    avg = round(weighted / total, 1) if total else 0.0

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
async def upsert_project_review(payload: ProjectReviewPayload):
    owner_id = payload.owner_user_id.strip()
    buyer_id = payload.buyer_user_id.strip()
    now = datetime.utcnow()
    filt = {"owner_user_id": owner_id, "buyer_user_id": buyer_id}
    if payload.project_id.strip():
        filt["project_id"] = payload.project_id.strip()
    else:
        filt["project_title"] = payload.project_title.strip() or "Project"

    await hub_project_reviews_collection.update_one(
        filt,
        {
            "$set": {
                "owner_user_id": owner_id,
                "buyer_user_id": buyer_id,
                "buyer_name": payload.buyer_name.strip(),
                "project_id": payload.project_id.strip(),
                "project_title": payload.project_title.strip() or "Project",
                "rating": int(payload.rating),
                "comment": payload.comment.strip(),
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    saved = await hub_project_reviews_collection.find_one(filt)
    return {
        "status": "success",
        "review": {
            "id": str(saved.get("_id") or ""),
            "buyer_name": saved.get("buyer_name"),
            "project_title": saved.get("project_title"),
            "rating": saved.get("rating"),
            "comment": saved.get("comment"),
            "created_at": _to_iso(saved.get("created_at")),
        },
    }
