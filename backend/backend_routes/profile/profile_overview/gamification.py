"""Rank / XP snapshot for profile overview UI."""

from backend_routes.ranks.rank_engine import build_user_rank_snapshot


async def build_gamification_snapshot(user: dict) -> dict:
    snapshot = await build_user_rank_snapshot(user)
    gamification = snapshot.get("gamification") or {}
    if gamification:
        return gamification
    return {
        "rank_label": "Frontline Recruit",
        "current_xp": 0,
        "next_xp": 1000,
        "next_rank": "Frontline Specialist",
        "progress_pct": 0,
        "missing_gates": [],
        "blocked_by_gates": [],
        "gate_status": {},
        "deals_current": 0,
        "deals_required": 0,
        "stars_current": 0.0,
        "stars_required": 0.0,
    }
