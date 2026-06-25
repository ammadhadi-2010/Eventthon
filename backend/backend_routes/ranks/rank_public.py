"""Public rank matrix + user rank status APIs."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from backend_routes.profile.profile_helpers import user_lookup_query, verify_profile_owner
from database import user_collection

from .rank_engine import build_user_rank_snapshot, load_active_matrix

router = APIRouter(tags=["Rank System"])


@router.get("/matrix")
async def get_rank_matrix():
    rows = await load_active_matrix()
    return {"rows": rows, "version": 2}


@router.get("/status/{identifier}")
async def get_rank_status(identifier: str, user: dict = Depends(verify_profile_owner)):
    snapshot = await build_user_rank_snapshot(user)
    return {"status": "success", "rank": snapshot}


@router.get("/status/public/{identifier}")
async def get_rank_status_public(identifier: str):
    """Read-only rank card for profile viewers (no auth header required)."""
    ident = (identifier or "").strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Identifier required")
    user = await user_collection.find_one(user_lookup_query(ident))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    snapshot = await build_user_rank_snapshot(user)
    return {
        "status": "success",
        "rankCode": snapshot.get("rankCode"),
        "rankName": snapshot.get("rankName"),
        "badgeTier": snapshot.get("badgeTier"),
        "themeId": snapshot.get("themeId"),
        "iconUrl": snapshot.get("iconUrl"),
        "rankFeatured": snapshot.get("rankFeatured"),
        "nextLockTarget": snapshot.get("nextLockTarget"),
        "gamification": snapshot.get("gamification"),
    }
