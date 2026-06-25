"""E-6 Vanguard featured boost for recruiter / talent discovery ordering."""

from __future__ import annotations

from typing import Any

from .rank_badge_meta import normalize_rank_code

VANGUARD_ALIASES = frozenset(
    {"e-6", "e6", "vanguard", "apex_vanguard", "apex vanguard", "apex-vanguard", "elite"}
)


def user_rank_code(doc: dict[str, Any]) -> str:
    raw = str(doc.get("rank_code") or doc.get("rank_tier") or doc.get("rank") or "").strip()
    if not raw:
        return "E-1"
    lowered = raw.lower().replace(" ", "_")
    if lowered in VANGUARD_ALIASES or raw.lower() in VANGUARD_ALIASES:
        return "E-6"
    return normalize_rank_code(raw)


def is_vanguard_featured(doc: dict[str, Any]) -> bool:
    if bool(doc.get("rank_featured")):
        return True
    return user_rank_code(doc) == "E-6"


def recruiter_sort_key(doc: dict[str, Any]) -> tuple[int, int, str]:
    featured = 1 if is_vanguard_featured(doc) else 0
    points = int(doc.get("rank_points") or doc.get("xp_current") or 0)
    name = f"{doc.get('first_name', '')} {doc.get('last_name', '')}".strip().lower()
    return (-featured, -points, name)


def sort_recruiter_results(rows: list[dict[str, Any]], *, limit: int | None = None) -> list[dict[str, Any]]:
    ordered = sorted(rows, key=recruiter_sort_key)
    return ordered[:limit] if limit is not None else ordered


def recruiter_ranked_pipeline(*, match: dict[str, Any], skip: int, limit: int) -> list[dict[str, Any]]:
    """Mongo aggregation stages: featured E-6 users first, then rank_points."""
    return [
        {"$match": match},
        {
            "$addFields": {
                "_recruiter_featured": {
                    "$max": [
                        {"$cond": [{"$in": [{"$toLower": {"$ifNull": ["$rank_code", ""]}}, list(VANGUARD_ALIASES)]}, 1, 0]},
                        {"$cond": [{"$in": [{"$toLower": {"$ifNull": ["$rank_tier", ""]}}, list(VANGUARD_ALIASES)]}, 1, 0]},
                        {"$cond": [{"$in": [{"$toLower": {"$ifNull": ["$rank", ""]}}, list(VANGUARD_ALIASES)]}, 1, 0]},
                        {"$cond": [{"$eq": [{"$ifNull": ["$rank_featured", False]}, True]}, 1, 0]},
                    ]
                },
                "_recruiter_points": {
                    "$convert": {
                        "input": {"$ifNull": ["$rank_points", {"$ifNull": ["$xp_current", 0]}]},
                        "to": "int",
                        "onError": 0,
                        "onNull": 0,
                    }
                },
            }
        },
        {"$sort": {"_recruiter_featured": -1, "_recruiter_points": -1, "first_name": 1}},
        {"$skip": max(0, skip)},
        {"$limit": max(1, limit)},
    ]
