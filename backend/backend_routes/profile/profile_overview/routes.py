from fastapi import APIRouter, Depends, Query

from database import user_collection

from ..profile_helpers import verify_profile_owner
from .activity import fetch_user_activity
from .gamification import build_gamification_snapshot
from .network import fetch_network_list
from .schemas import SocialActionBody
from .social import apply_social_action
from .stats import merge_profile_stats
from .suggestions import fetch_suggested_connects

router = APIRouter(tags=["User Profile Overview"])


@router.get("/overview-data/{identifier}")
async def get_profile_overview(identifier: str, user: dict = Depends(verify_profile_owner)):
    uid = str(user["_id"])
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$inc": {"profile_stats.profile_views": 1}},
        upsert=False,
    )
    stats = merge_profile_stats(user)
    activity = await fetch_user_activity(uid)
    suggested = await fetch_suggested_connects(user.get("_id"), 5)
    gamification = await build_gamification_snapshot(user)
    return {
        "stats": stats,
        "activity": activity,
        "suggested_connects": suggested,
        "gamification": gamification,
    }


@router.get("/network/{identifier}/{list_key}")
async def get_profile_network_list(
    identifier: str,
    list_key: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    q: str = Query("", max_length=80),
    user: dict = Depends(verify_profile_owner),
):
    return await fetch_network_list(user, list_key, page=page, limit=limit, search=q)


@router.post("/social/{identifier}/action")
async def profile_social_action(
    identifier: str,
    body: SocialActionBody,
    _user: dict = Depends(verify_profile_owner),
):
    return await apply_social_action(identifier, body)
