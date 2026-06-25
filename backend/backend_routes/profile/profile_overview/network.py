"""Paginated followers / following / connections / mutual / commanders lists."""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Set

from bson import ObjectId
from bson.errors import InvalidId

from database import user_collection

from backend_routes.ranks.rank_recruiter_sort import recruiter_ranked_pipeline

from .user_card import _avatar, build_network_row

VALID_LIST_KEYS = ("commanders", "mutual", "followers", "following", "connections")


def _as_oid_set(raw: Optional[List]) -> Set[ObjectId]:
    out: Set[ObjectId] = set()
    for item in raw or []:
        try:
            out.add(ObjectId(str(item)))
        except (InvalidId, TypeError):
            continue
    return out


def _search_filter(q: str) -> dict:
    term = (q or "").strip()
    if not term:
        return {}
    regex = re.compile(re.escape(term), re.IGNORECASE)
    return {
        "$or": [
            {"first_name": regex},
            {"last_name": regex},
            {"headline": regex},
            {"designation": regex},
            {"email": regex},
        ]
    }


async def _fetch_by_ids(
    ids: List[ObjectId],
    *,
    skip: int,
    limit: int,
    search: str,
    exclude_id: ObjectId,
) -> tuple[List[dict], int]:
    unique = [oid for oid in dict.fromkeys(ids) if oid != exclude_id]
    total = len(unique)
    if not total:
        return [], 0
    page_ids = unique[skip : skip + limit]
    if not page_ids:
        return [], total
    docs = await user_collection.find({"_id": {"$in": page_ids}, **_search_filter(search)}).to_list(len(page_ids))
    by_id = {doc["_id"]: doc for doc in docs}
    ordered = [by_id[oid] for oid in page_ids if oid in by_id]
    return ordered, total


def _mutual_ids(user: dict) -> Set[ObjectId]:
    following = _as_oid_set(user.get("following_ids"))
    followers = _as_oid_set(user.get("follower_ids"))
    connections = _as_oid_set(user.get("connection_ids"))
    return (following & followers) | connections


async def _mutual_faces(viewer: dict, target: dict, limit: int = 6) -> tuple[int, List[str]]:
    viewer_set = _mutual_ids(viewer) | _as_oid_set(viewer.get("connection_ids"))
    target_set = _mutual_ids(target) | _as_oid_set(target.get("connection_ids"))
    shared = list(viewer_set & target_set)
    count = len(shared)
    if not shared:
        return count, []
    docs = await user_collection.find({"_id": {"$in": shared[:limit]}}).to_list(limit)
    return count, [_avatar(d) for d in docs if _avatar(d)]


async def fetch_network_list(
    user: dict,
    list_key: str,
    *,
    page: int = 1,
    limit: int = 20,
    search: str = "",
) -> Dict[str, Any]:
    key = (list_key or "commanders").lower()
    if key not in VALID_LIST_KEYS:
        key = "commanders"
    page = max(1, int(page or 1))
    limit = max(1, min(int(limit or 20), 50))
    skip = (page - 1) * limit
    exclude_id = user["_id"]
    self_id = str(exclude_id)

    if key == "commanders":
        match = {"_id": {"$ne": exclude_id}, **_search_filter(search)}
        total = await user_collection.count_documents(match)
        pipeline = recruiter_ranked_pipeline(match=match, skip=skip, limit=limit)
        docs = await user_collection.aggregate(pipeline).to_list(length=limit)
    elif key == "followers":
        ids = list(_as_oid_set(user.get("follower_ids")))
        docs, total = await _fetch_by_ids(ids, skip=skip, limit=limit, search=search, exclude_id=exclude_id)
    elif key == "following":
        ids = list(_as_oid_set(user.get("following_ids")))
        docs, total = await _fetch_by_ids(ids, skip=skip, limit=limit, search=search, exclude_id=exclude_id)
    elif key == "connections":
        ids = list(_as_oid_set(user.get("connection_ids")))
        docs, total = await _fetch_by_ids(ids, skip=skip, limit=limit, search=search, exclude_id=exclude_id)
    else:
        ids = list(_mutual_ids(user))
        docs, total = await _fetch_by_ids(ids, skip=skip, limit=limit, search=search, exclude_id=exclude_id)

    items: List[Dict[str, Any]] = []
    for idx, doc in enumerate(docs):
        mutual_count = 0
        mutual_faces: List[str] = []
        if key == "mutual":
            mutual_count, mutual_faces = await _mutual_faces(user, doc)
        row = build_network_row(
            doc,
            idx=idx,
            list_key=key,
            mutual_count=mutual_count,
            mutual_face_urls=mutual_faces,
        )
        items.append(row)

    return {
        "list_key": key,
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "viewer_id": self_id,
    }
