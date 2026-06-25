"""Build Mongo queries and sort tuples for gig list endpoint."""
from __future__ import annotations

import re
from typing import Any, Iterable


def gig_list_sort_options(sort_raw: str) -> list[tuple[str, Any]]:
    s = (sort_raw or "").strip().lower().replace("-", "_")
    if s in {"", "recent", "best_match"}:
        return [("created_at", -1)]
    if s == "reviews" or s == "most_reviewed":
        return [("orders", -1), ("rating", -1)]
    if s in {"price_low", "price_asc"}:
        return [("starting_price", 1)]
    if s in {"price_high", "price_desc"}:
        return [("starting_price", -1)]
    if s in {"fastest_delivery", "delivery"}:
        return [("pricing.delivery_days", 1)]
    return [("created_at", -1)]


def _budget_clause(encoded: str) -> dict | None:
    text = encoded.strip()
    if not text:
        return None
    or_parts = []
    for seg in text.split("|"):
        seg = seg.strip()
        if not seg or ":" not in seg:
            continue
        a, b = seg.split(":", 1)
        try:
            lo = float(a)
            hi = float(b)
        except ValueError:
            continue
        or_parts.append({"starting_price": {"$gte": lo, "$lte": hi}})
    return {"$or": or_parts} if or_parts else None


def delivery_days_projection_expr() -> dict[str, Any]:
    """Numeric delivery days fallback when pricing nested doc is incomplete."""
    return {"$ifNull": ["$pricing.delivery_days", 3]}


def delivery_bucket_exprs(bucket_id: str) -> dict[str, Any] | None:
    """
    Bucket ids: 24h | 3d | 7d | week_plus.
    Matches use pricing.delivery_days with a loose fallback default for missing docs.
    """
    b = (bucket_id or "").strip().lower()
    day = delivery_days_projection_expr()
    if b == "24h":
        return {"$expr": {"$lte": [day, 1]}}
    if b == "3d":
        return {"$expr": {"$and": [{"$gte": [day, 2]}, {"$lte": [day, 3]}]}}
    if b == "7d":
        return {"$expr": {"$and": [{"$gte": [day, 4]}, {"$lte": [day, 7]}]}}
    if b in {"week+", "week_plus"}:
        return {"$expr": {"$gt": [day, 7]}}
    return None


def delivery_buckets_or_clause(bucket_ids: Iterable[str]) -> dict[str, Any] | None:
    parts: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in bucket_ids:
        bid = str(raw).strip().lower()
        if bid == "week+":
            bid = "week_plus"
        if not bid or bid in seen:
            continue
        seen.add(bid)
        ex = delivery_bucket_exprs(bid)
        if ex:
            parts.append(ex)
    return {"$or": parts} if parts else None


def seller_level_clause(level_id: str) -> dict[str, Any] | None:
    lid = (level_id or "").strip().lower()
    if lid == "top":
        return {"seller_level": {"$regex": r"top\s*rated", "$options": "i"}}
    if lid == "lvl2":
        return {"seller_level": {"$regex": r"level\s*2", "$options": "i"}}
    if lid == "lvl1":
        return {
            "$and": [
                {"$nor": [{"seller_level": {"$regex": r"top\s*rated", "$options": "i"}}]},
                {"$nor": [{"seller_level": {"$regex": r"level\s*2", "$options": "i"}}]},
                {
                    "$or": [
                        {"seller_level": {"$regex": r"level\s*1", "$options": "i"}},
                        {"seller_level": {"$exists": False}},
                        {"seller_level": None},
                        {"seller_level": ""},
                    ]
                },
            ]
        }
    if lid == "new":
        return {
            "$or": [
                {"rating": {"$lte": 0}},
                {"seller_level": {"$regex": r"new", "$options": "i"}},
            ]
        }
    return None


def seller_levels_or_clause(level_ids: Iterable[str]) -> dict[str, Any] | None:
    parts: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in level_ids:
        lid = str(raw).strip().lower()
        if not lid or lid in seen:
            continue
        seen.add(lid)
        clause = seller_level_clause(lid)
        if clause:
            parts.append(clause)
    return {"$or": parts} if parts else None


def subcategory_overlap_clause(label: str) -> dict[str, Any] | None:
    text = str(label).strip()
    if not text:
        return None
    safe = re.escape(text)
    return {
        "$or": [
            {"service_type": {"$regex": safe, "$options": "i"}},
            {"title": {"$regex": safe, "$options": "i"}},
            {"tags": {"$elemMatch": {"$regex": safe, "$options": "i"}}},
        ]
    }


def build_gig_list_query(
    search: str = "",
    category: str = "",
    status: str = "",
    seller_user_id: str = "",
    service_type: str = "",
    min_rating: float | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    delivery_days_max: int | None = None,
    budgets_encoded: str = "",
    delivery_buckets: list[str] | None = None,
    seller_levels: list[str] | None = None,
) -> dict:
    and_parts: list[dict[str, Any]] = []

    if status.strip():
        and_parts.append({"status": status.strip()})
    if seller_user_id.strip():
        and_parts.append({"seller_user_id": seller_user_id.strip()})
    if category.strip():
        and_parts.append(
            {"category": {"$regex": re.escape(category.strip()), "$options": "i"}},
        )
    if service_type.strip():
        and_parts.append(
            {"service_type": {"$regex": re.escape(service_type.strip()), "$options": "i"}},
        )

    sr = search.strip()
    if sr:
        safe = re.escape(sr[:240])
        and_parts.append(
            {
                "$or": [
                    {"title": {"$regex": safe, "$options": "i"}},
                    {"category": {"$regex": safe, "$options": "i"}},
                    {"description": {"$regex": safe, "$options": "i"}},
                ],
            },
        )

    price_band: dict[str, Any] = {}
    if min_price is not None and min_price >= 0:
        price_band["$gte"] = float(min_price)
    if max_price is not None and max_price >= 0:
        price_band["$lte"] = float(max_price)
    budget_or = _budget_clause(budgets_encoded)
    if budget_or:
        and_parts.append(budget_or)
    elif price_band:
        and_parts.append({"starting_price": price_band})

    if delivery_days_max is not None and delivery_days_max >= 0:
        and_parts.append({"pricing.delivery_days": {"$lte": int(delivery_days_max)}})

    if min_rating is not None and min_rating >= 0:
        and_parts.append({"rating": {"$gte": float(min_rating)}})

    if delivery_buckets:
        d_or = delivery_buckets_or_clause(delivery_buckets)
        if d_or:
            and_parts.append(d_or)

    if seller_levels:
        s_or = seller_levels_or_clause(seller_levels)
        if s_or:
            and_parts.append(s_or)

    if not and_parts:
        return {}
    if len(and_parts) == 1:
        return and_parts[0]
    return {"$and": and_parts}
