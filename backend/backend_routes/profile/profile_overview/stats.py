"""Merge persisted profile_stats with derived counts from user graph fields."""

from __future__ import annotations

from typing import Any, Dict


def _len_ids(user: dict, key: str) -> int:
    raw = user.get(key) or []
    return len(raw) if isinstance(raw, list) else 0


def _stat(user: dict, key: str, derived: int, fallback: int = 0) -> int:
    ps = user.get("profile_stats") or {}
    stored = int(ps.get(key, fallback) or 0)
    return max(derived, stored) if derived else stored


def merge_profile_stats(user: dict) -> Dict[str, Any]:
    ps = user.get("profile_stats") or {}
    projects = user.get("projects") or []
    proj_count = len(
        [p for p in projects if isinstance(p, dict) and str(p.get("title") or "").strip()]
    )
    followers = _stat(user, "followers", _len_ids(user, "follower_ids"))
    following = _stat(user, "following", _len_ids(user, "following_ids"))
    connections = _stat(user, "connections", _len_ids(user, "connection_ids"))
    mutual = _len_ids(user, "connection_ids")
    if user.get("following_ids") and user.get("follower_ids"):
        following_set = {str(x) for x in user.get("following_ids") or []}
        follower_set = {str(x) for x in user.get("follower_ids") or []}
        mutual = max(mutual, len(following_set & follower_set))

    return {
        "profile_views": int(ps.get("profile_views", 0)),
        "connections": connections,
        "squads": int(ps.get("squads", user.get("squadCount") or 0)),
        "projects": int(ps.get("projects", proj_count)),
        "success_score": int(ps.get("success_score", user.get("jss") or 0)),
        "impressions": int(ps.get("impressions", 0)),
        "followers": followers,
        "following": following,
        "completed_orders": int(ps.get("completed_orders", user.get("orders_completed") or 0)),
        "total_earnings_usd": float(ps.get("total_earnings_usd", user.get("earnings_k") or 0)),
        "followers_delta_month": int(ps.get("followers_delta_month", 0)),
        "connections_mutual": int(ps.get("connections_mutual", mutual)),
        "top_commanders": int(ps.get("top_commanders", 8)),
    }
