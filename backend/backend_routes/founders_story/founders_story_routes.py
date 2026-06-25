"""Founder's Story public and admin HTTP routes."""
from __future__ import annotations

from fastapi import APIRouter, Query

from .founders_story_schemas import (
    FoundersStoryCommentBody,
    FoundersStoryContentBody,
    FoundersStoryLikeBody,
)
from .founders_story_service import (
    add_comment,
    get_public_story,
    save_story_content,
    toggle_like,
    visitor_liked,
)

router = APIRouter(prefix="/founders-story", tags=["Founder's Story"])


@router.get("")
async def get_founders_story(visitor_id: str = Query("", max_length=80)):
    payload = await get_public_story()
    if visitor_id.strip():
        payload["liked"] = await visitor_liked(visitor_id.strip())
    else:
        payload["liked"] = False
    return {"status": "success", "data": payload}


@router.put("/admin/content")
async def update_founders_story_content(body: FoundersStoryContentBody):
    saved = await save_story_content(body.content)
    return {"status": "success", "data": saved}


@router.post("/like")
async def like_founders_story(body: FoundersStoryLikeBody):
    result = await toggle_like(body.visitor_id.strip())
    return {"status": "success", "data": result}


@router.post("/comments")
async def comment_founders_story(body: FoundersStoryCommentBody):
    row = await add_comment(body.author_name, body.text, body.visitor_id.strip())
    likes_count = (await get_public_story())["likes_count"]
    return {"status": "success", "data": {"comment": row, "likes_count": likes_count}}
