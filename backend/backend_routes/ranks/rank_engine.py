"""Elite rank matrix engine — resolve tiers, next targets, and user snapshots."""

from __future__ import annotations

from typing import Any

from database import rank_collection

from backend_routes.admin.rank_seed import ELITE_DEFAULT_RANKS

from .rank_badge_meta import (
    RANK_ALIASES,
    RANK_ORDER,
    normalize_rank_code,
    resolve_badge_icon_url,
    theme_for_code,
)


def _vip_preview(doc: dict[str, Any]) -> str:
    code = str(doc.get("rankCode") or "").strip()
    benefits = str(doc.get("benefits") or "").strip()
    return f"{code}: {benefits}" if benefits else f"{code}: No benefit copy configured."


def serialize_matrix_row(doc: dict[str, Any]) -> dict[str, Any]:
    from backend_routes.admin.rank_management import _serialize_rank

    row = _serialize_rank(doc)
    rank_code = row.get("rankCode") or "E-1"
    theme = theme_for_code(rank_code)
    row.update(theme)
    row["iconUrl"] = resolve_badge_icon_url(row.get("iconUrl"), rank_code)
    row["badgeImageUrl"] = row["iconUrl"]
    row["featureOnFrontlineDashboard"] = bool(doc.get("featureOnFrontlineDashboard"))
    row["vipBenefitPreview"] = row.get("vipBenefitPreview") or _vip_preview(doc)
    return row


async def load_active_matrix() -> list[dict[str, Any]]:
    from backend_routes.admin.rank_management import _ensure_seed

    await _ensure_seed()
    docs = await rank_collection.find({"status": "active"}).sort("minPoints", 1).to_list(length=20)
    if not docs:
        docs = list(ELITE_DEFAULT_RANKS)
    return [serialize_matrix_row(d) for d in docs]


def resolve_rank_from_progress(
    matrix: list[dict[str, Any]],
    *,
    points: int = 0,
    deals: int = 0,
    star_rating: float = 0,
) -> dict[str, Any]:
    matched = matrix[0] if matrix else serialize_matrix_row(ELITE_DEFAULT_RANKS[0])
    for tier in matrix:
        if (
            points >= int(tier.get("minPoints") or 0)
            and deals >= int(tier.get("minDealsRequired") or 0)
            and star_rating >= float(tier.get("minStarRating") or 0)
        ):
            matched = tier
    return matched


def resolve_rank_points_only(matrix: list[dict[str, Any]], points: int = 0) -> dict[str, Any]:
    matched = matrix[0] if matrix else serialize_matrix_row(ELITE_DEFAULT_RANKS[0])
    for tier in matrix:
        if points >= int(tier.get("minPoints") or 0):
            matched = tier
    return matched


def _gate_status(next_rank: dict[str, Any], *, points: int, deals: int, star_rating: float) -> dict[str, Any]:
    req_p = int(next_rank.get("minPoints") or 0)
    req_d = int(next_rank.get("minDealsRequired") or 0)
    req_s = float(next_rank.get("minStarRating") or 0)
    return {
        "points": {"met": points >= req_p, "current": points, "required": req_p},
        "deals": {"met": deals >= req_d, "current": deals, "required": req_d},
        "stars": {"met": star_rating >= req_s, "current": star_rating, "required": req_s},
    }


def _missing_gates(next_rank: dict[str, Any], gate_status: dict[str, Any]) -> list[dict[str, Any]]:
    missing: list[dict[str, Any]] = []
    for gate in ("points", "deals", "stars"):
        row = gate_status[gate]
        if row["met"]:
            continue
        current = row["current"]
        required = row["required"]
        deficit = required - current if gate != "stars" else round(required - current, 1)
        missing.append({"gate": gate, "required": required, "current": current, "deficit": max(0, deficit)})
    return missing


def get_next_rank(matrix: list[dict[str, Any]], rank_code: str) -> dict[str, Any] | None:
    code = normalize_rank_code(rank_code)
    try:
        idx = RANK_ORDER.index(code)
    except ValueError:
        return None
    if idx >= len(matrix) - 1:
        return None
    next_code = RANK_ORDER[idx + 1]
    return next((r for r in matrix if r.get("rankCode") == next_code), None)


def build_next_lock_target(
    matrix: list[dict[str, Any]],
    *,
    rank_code: str | None = None,
    points: int = 0,
    deals: int = 0,
    star_rating: float = 0,
) -> dict[str, Any]:
    gate_locked = resolve_rank_from_progress(matrix, points=points, deals=deals, star_rating=star_rating)
    points_only = resolve_rank_points_only(matrix, points)
    stored_code = normalize_rank_code(rank_code) if rank_code else None
    blocked_by: list[str] = []
    if stored_code and stored_code != gate_locked.get("rankCode"):
        try:
            if RANK_ORDER.index(stored_code) > RANK_ORDER.index(gate_locked.get("rankCode") or "E-1"):
                for gate, row in _gate_status(points_only, points=points, deals=deals, star_rating=star_rating).items():
                    if not row["met"]:
                        blocked_by.append(gate)
        except ValueError:
            pass

    current = gate_locked
    nxt = get_next_rank(matrix, current.get("rankCode") or "E-1")
    if not nxt:
        return {
            "currentRank": current,
            "nextRank": None,
            "isMaxRank": True,
            "gaps": {"points": 0, "deals": 0, "stars": 0},
            "progressPct": 100,
            "gateStatus": {},
            "missingGates": [],
            "blockedByGates": blocked_by,
            "pointsOnlyRank": points_only,
        }

    gate_status = _gate_status(nxt, points=points, deals=deals, star_rating=star_rating)
    missing_gates = _missing_gates(nxt, gate_status)
    gaps = {
        "points": max(0, int(nxt.get("minPoints") or 0) - points),
        "deals": max(0, int(nxt.get("minDealsRequired") or 0) - deals),
        "stars": max(0.0, round(float(nxt.get("minStarRating") or 0) - star_rating, 1)),
    }
    p_goal = max(1, int(nxt.get("minPoints") or 0))
    d_goal = max(1, int(nxt.get("minDealsRequired") or 0))
    s_goal = max(0.1, float(nxt.get("minStarRating") or 0))
    progress_pct = round(
        (
            min(100, int(points / p_goal * 100))
            + min(100, int(deals / d_goal * 100))
            + min(100, int(star_rating / s_goal * 100))
        )
        / 3
    )
    return {
        "currentRank": current,
        "nextRank": nxt,
        "isMaxRank": False,
        "gaps": gaps,
        "progressPct": progress_pct,
        "targetLabel": f"{nxt.get('rankCode')} · {nxt.get('rankName')}",
        "gateStatus": gate_status,
        "missingGates": missing_gates,
        "blockedByGates": blocked_by or [g["gate"] for g in missing_gates],
        "pointsOnlyRank": points_only,
    }


def extract_user_progress(user: dict[str, Any]) -> dict[str, Any]:
    raw_rank = str(user.get("rank_code") or user.get("rank_tier") or user.get("rank") or "").strip()
    points = int(user.get("rank_points") or user.get("xp_current") or 0)
    deals = int(user.get("completed_deals") or user.get("completed_orders") or 0)
    stars = float(user.get("star_rating") or user.get("rating") or 0)
    rank_code = normalize_rank_code(raw_rank) if raw_rank else None
    if not rank_code and raw_rank:
        alias = RANK_ALIASES.get(raw_rank.lower().replace(" ", "_"))
        rank_code = alias
    return {
        "rankCode": rank_code,
        "points": points,
        "deals": deals,
        "starRating": stars,
    }


async def build_user_rank_snapshot(user: dict[str, Any]) -> dict[str, Any]:
    matrix = await load_active_matrix()
    progress = extract_user_progress(user)
    lock = build_next_lock_target(
        matrix,
        rank_code=progress.get("rankCode"),
        points=progress["points"],
        deals=progress["deals"],
        star_rating=progress["starRating"],
    )
    current = lock["currentRank"]
    nxt = lock.get("nextRank") or {}
    featured = current.get("rankCode") == "E-6" or bool(current.get("featureOnFrontlineDashboard"))
    return {
        "rankCode": current.get("rankCode"),
        "rankName": current.get("rankName"),
        "badgeTier": current.get("badgeTier"),
        "themeId": current.get("themeId"),
        "ribbonText": current.get("ribbonText"),
        "starCount": current.get("starCount"),
        "benefits": current.get("benefits"),
        "iconUrl": current.get("iconUrl") or current.get("badgeImageUrl"),
        "currentRank": current,
        "nextRank": nxt or None,
        "nextLockTarget": lock,
        "progress": progress,
        "rankFeatured": featured,
        "gamification": {
            "rank_label": current.get("rankName") or "Frontline Recruit",
            "current_xp": progress["points"],
            "next_xp": int(nxt.get("minPoints") or progress["points"]),
            "next_rank": nxt.get("rankName") or current.get("rankName"),
            "progress_pct": lock.get("progressPct", 0),
            "missing_gates": lock.get("missingGates") or [],
            "blocked_by_gates": lock.get("blockedByGates") or [],
            "gate_status": lock.get("gateStatus") or {},
            "deals_current": progress["deals"],
            "deals_required": int(nxt.get("minDealsRequired") or 0),
            "stars_current": progress["starRating"],
            "stars_required": float(nxt.get("minStarRating") or 0),
        },
    }
