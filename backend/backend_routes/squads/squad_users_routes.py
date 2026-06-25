"""User search for squad recruit / invite flows."""
from fastapi import APIRouter, Depends, Query

from database import user_collection
from backend_routes.ranks.rank_recruiter_sort import sort_recruiter_results
from .squads_session import verify_squads_session

router = APIRouter()


@router.get("/search")
async def search_users_by_skill(
    skill: str = Query("", max_length=120),
    limit: int = Query(20, ge=1, le=50),
    user: dict = Depends(verify_squads_session),
):
    _ = user
    term = (skill or "").strip()
    filter_query = {}
    if term:
        filter_query = {
            "$or": [
                {"first_name": {"$regex": term, "$options": "i"}},
                {"last_name": {"$regex": term, "$options": "i"}},
                {"designation": {"$regex": term, "$options": "i"}},
                {"headline": {"$regex": term, "$options": "i"}},
                {"skills": {"$regex": term, "$options": "i"}},
                {"email": {"$regex": term, "$options": "i"}},
            ]
        }
    fetch_cap = min(max(limit * 4, limit), 120)
    rows = await user_collection.find(filter_query).limit(fetch_cap).to_list(length=fetch_cap)
    rows = sort_recruiter_results(rows, limit=limit)
    mapped = []
    for doc in rows:
        name = f"{doc.get('first_name', '')} {doc.get('last_name', '')}".strip() or "EventThon User"
        mapped.append(
            {
                "_id": str(doc.get("_id")),
                "id": str(doc.get("_id")),
                "name": name,
                "email": doc.get("email") or "",
                "mobile": doc.get("mobile") or "",
                "title": doc.get("designation") or doc.get("headline") or "Member",
                "avatar": doc.get("profile_image_url") or doc.get("imageurl") or doc.get("avatar") or "",
                "skills": doc.get("skills") or [],
            }
        )
    return mapped
