"""HTTP routes — company followers."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .portal_followers import (
    CompanyFollowPayload,
    follow_company,
    follow_status,
    list_company_followers,
    remove_company_follower,
    unfollow_company,
)

router = APIRouter(prefix="/company-portal", tags=["Company Portal Followers"])


@router.get("/followers")
async def company_followers_list(
    user_id: str = Query(..., min_length=2, max_length=120),
    q: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(80, ge=1, le=150),
):
    data = await list_company_followers(user_id, q=q, skip=skip, limit=limit)
    return {"status": "success", "data": data}


@router.delete("/followers/{follower_user_id}")
async def company_followers_remove(
    follower_user_id: str,
    user_id: str = Query(..., min_length=2, max_length=120),
):
    if len(follower_user_id.strip()) < 2:
        raise HTTPException(status_code=400, detail="follower_user_id required")
    data = await remove_company_follower(user_id, follower_user_id)
    return data


@router.post("/follow")
async def company_follow(payload: CompanyFollowPayload):
    data = await follow_company(payload)
    return data


@router.delete("/follow/{company_id}")
async def company_unfollow(
    company_id: str,
    user_id: str = Query(..., min_length=2, max_length=120),
):
    data = await unfollow_company(user_id, company_id)
    return data


@router.get("/follow/status")
async def company_follow_status(
    user_id: str = Query(..., min_length=2, max_length=120),
    company_id: str = Query(..., min_length=2, max_length=120),
):
    data = await follow_status(user_id, company_id)
    return {"status": "success", "data": data}
