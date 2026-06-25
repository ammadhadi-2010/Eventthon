"""Recent posts for profile activity feed."""

from datetime import datetime
from typing import Any, Dict, List

from database import post_collection


async def fetch_user_activity(user_mongo_id: str) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    try:
        posts = (
            await post_collection.find({"user_id": user_mongo_id})
            .sort("created_at", -1)
            .limit(15)
            .to_list(15)
        )
    except Exception:
        return out
    for p in posts or []:
        ca = p.get("created_at")
        if isinstance(ca, datetime):
            ca_s = ca.isoformat()
        else:
            ca_s = str(ca) if ca is not None else ""
        out.append(
            {
                "id": str(p.get("_id")),
                "type": str(p.get("post_type") or "post"),
                "text": str(p.get("content") or "")[:280],
                "created_at": ca_s,
                "author_name": str(p.get("author_name") or ""),
            }
        )
    return out
