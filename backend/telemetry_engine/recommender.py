"""Native affinity scoring from UserTelemetryLog activity."""
from __future__ import annotations

from database import user_telemetry_log_collection

LOG_FETCH_LIMIT = 250
TIME_WEIGHT = 0.6
SCROLL_WEIGHT = 0.4

ENDPOINT_CATEGORIES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("projects", ("/projects", "/project")),
    ("gigs", ("/gigs", "/gig")),
    ("jobs", ("/jobs", "/job")),
    ("squads", ("/squads", "/squad")),
    ("articles", ("/articles", "/article")),
    ("messages", ("/messages", "/inbox", "/chat")),
    ("dashboard", ("/dashboard", "/home")),
    ("profile", ("/profile",)),
    ("wallet", ("/wallet", "/finance")),
)


def classify_endpoint(endpoint_url: str) -> str:
    lower = str(endpoint_url or "").strip().lower()
    if not lower:
        return "general"
    for category, fragments in ENDPOINT_CATEGORIES:
        for fragment in fragments:
            if fragment in lower:
                return category
    return "general"


def _build_lookup_filter(user_id: str, session_id: str) -> dict:
    clauses: list[dict] = []
    uid = str(user_id or "").strip()
    sid = str(session_id or "").strip()
    if uid:
        clauses.append({"user_id": uid})
    if sid:
        clauses.append({"session_id": sid})
    if not clauses:
        return {}
    if len(clauses) == 1:
        return clauses[0]
    return {"$or": clauses}


def _score_bucket(total_time: float, max_scroll: float) -> float:
    return round((total_time * TIME_WEIGHT) + (max_scroll * SCROLL_WEIGHT), 2)


async def fetch_recent_logs(user_id: str, session_id: str, limit: int = LOG_FETCH_LIMIT) -> list[dict]:
    query = _build_lookup_filter(user_id, session_id)
    if not query:
        return []
    cursor = user_telemetry_log_collection.find(
        query,
        {
            "endpoint_url": 1,
            "time_spent_seconds": 1,
            "scroll_depth_percentage": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


def aggregate_category_scores(logs: list[dict]) -> dict[str, dict]:
    buckets: dict[str, dict] = {}
    for row in logs:
        endpoint = str(row.get("endpoint_url") or "")
        category = classify_endpoint(endpoint)
        time_spent = float(row.get("time_spent_seconds") or 0)
        scroll_depth = float(row.get("scroll_depth_percentage") or 0)

        if category not in buckets:
            buckets[category] = {
                "category": category,
                "total_time_seconds": 0.0,
                "max_scroll_depth": 0.0,
                "visit_count": 0,
            }

        bucket = buckets[category]
        bucket["total_time_seconds"] = round(bucket["total_time_seconds"] + time_spent, 2)
        bucket["max_scroll_depth"] = round(max(bucket["max_scroll_depth"], scroll_depth), 2)
        bucket["visit_count"] += 1

    for bucket in buckets.values():
        bucket["affinity_score"] = _score_bucket(
            bucket["total_time_seconds"],
            bucket["max_scroll_depth"],
        )
    return buckets


def rank_category_preferences(buckets: dict[str, dict]) -> list[dict]:
    ranked = sorted(
        buckets.values(),
        key=lambda item: item.get("affinity_score", 0),
        reverse=True,
    )
    return ranked


def find_category_affinity(interests: dict, label: str) -> dict | None:
    for row in interests.get("categories", []):
        if row.get("category") == label:
            return row
    return None


async def compute_user_interests(user_id: str, session_id: str) -> dict:
    """
    Query recent telemetry logs for a member or session, then rank tech category affinities.
    Score formula: (Total Time Spent x 0.6) + (Max Scroll Depth x 0.4)
    """
    logs = await fetch_recent_logs(user_id, session_id)
    buckets = aggregate_category_scores(logs)
    ranked = rank_category_preferences(buckets)
    top_preferences = {
        row["category"]: row["affinity_score"]
        for row in ranked
        if row.get("category") and row.get("affinity_score", 0) > 0
    }

    return {
        "user_id": str(user_id or "").strip(),
        "session_id": str(session_id or "").strip(),
        "log_count": len(logs),
        "categories": ranked,
        "top_preferences": top_preferences,
    }
