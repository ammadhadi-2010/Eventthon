"""Suggested members for Quick Connect (random sample, excludes self)."""

from typing import Any, Dict, List

from database import user_collection


async def fetch_suggested_connects(exclude_id: Any, limit: int = 5) -> List[Dict[str, Any]]:
    try:
        pipe: List[dict] = [{"$match": {"_id": {"$ne": exclude_id}}}, {"$sample": {"size": limit}}]
        rows = await user_collection.aggregate(pipe).to_list(limit)
    except Exception:
        return []
    out: List[Dict[str, Any]] = []
    for su in rows or []:
        fn = str(su.get("first_name") or "").strip()
        ln = str(su.get("last_name") or "").strip()
        name = f"{fn} {ln}".strip() or "Member"
        out.append(
            {
                "id": str(su.get("_id")),
                "name": name,
                "headline": str(su.get("headline") or su.get("designation") or "Developer"),
                "avatar": str(
                    su.get("imageurl") or su.get("profile_image_url") or su.get("avatar") or ""
                ),
                "imageurl": str(
                    su.get("imageurl") or su.get("profile_image_url") or su.get("avatar") or ""
                ),
            }
        )
    return out
