"""Founder's Story persistence and engagement helpers."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List

from database import (
    founders_story_collection,
    founders_story_comments_collection,
    founders_story_likes_collection,
)

DOC_KEY = "founders_story"

DEFAULT_CONTENT = (
    "EventThon began with a simple belief: creators, builders, and teams deserve one place "
    "to connect, collaborate, and ship meaningful work.\n\n"
    "Our founder set out to remove the friction between talent, squads, gigs, and projects — "
    "so every professional could grow with clarity, trust, and momentum.\n\n"
    "Today, EventThon is that network: a home for ambitious people who want to build in public, "
    "earn with integrity, and rise through a transparent rank system.\n\n"
    "This is only the beginning. Thank you for being part of the journey."
)


def _iso(dt: Any) -> str | None:
    if isinstance(dt, datetime):
        return dt.isoformat()
    return str(dt) if dt else None


async def _get_or_seed_story() -> Dict[str, Any]:
    doc = await founders_story_collection.find_one({"doc_key": DOC_KEY})
    if doc:
        return doc
    seed = {
        "doc_key": DOC_KEY,
        "content": DEFAULT_CONTENT,
        "updatedAt": datetime.utcnow().isoformat(),
    }
    await founders_story_collection.insert_one(seed)
    return await founders_story_collection.find_one({"doc_key": DOC_KEY})


async def save_story_content(content: str) -> Dict[str, Any]:
    payload = {
        "doc_key": DOC_KEY,
        "content": content.strip(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    await founders_story_collection.update_one(
        {"doc_key": DOC_KEY},
        {"$set": payload},
        upsert=True,
    )
    return payload


async def _serialize_comment(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(row.get("_id", "")),
        "author_name": row.get("author_name") or "Guest",
        "text": row.get("text") or "",
        "created_at": _iso(row.get("created_at")),
    }


async def get_public_story() -> Dict[str, Any]:
    story = await _get_or_seed_story()
    likes_count = await founders_story_likes_collection.count_documents({})
    rows = (
        await founders_story_comments_collection.find({})
        .sort("created_at", -1)
        .limit(100)
        .to_list(length=100)
    )
    comments: List[Dict[str, Any]] = []
    for row in rows:
        comments.append(await _serialize_comment(row))
    return {
        "content": story.get("content") or DEFAULT_CONTENT,
        "updatedAt": story.get("updatedAt"),
        "likes_count": likes_count,
        "comments": comments,
    }


async def toggle_like(visitor_id: str) -> Dict[str, int]:
    existing = await founders_story_likes_collection.find_one({"visitor_id": visitor_id})
    if existing:
        await founders_story_likes_collection.delete_one({"_id": existing["_id"]})
    else:
        await founders_story_likes_collection.insert_one(
            {"visitor_id": visitor_id, "created_at": datetime.utcnow()}
        )
    count = await founders_story_likes_collection.count_documents({})
    return {"likes_count": count, "liked": existing is None}


async def add_comment(author_name: str, text: str, visitor_id: str) -> Dict[str, Any]:
    doc = {
        "author_name": author_name.strip(),
        "text": text.strip(),
        "visitor_id": visitor_id,
        "created_at": datetime.utcnow(),
    }
    result = await founders_story_comments_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return await _serialize_comment(doc)


async def visitor_liked(visitor_id: str) -> bool:
    if not visitor_id:
        return False
    row = await founders_story_likes_collection.find_one({"visitor_id": visitor_id})
    return row is not None
