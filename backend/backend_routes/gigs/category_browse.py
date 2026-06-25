"""Category marketplace browse facets (counts + aggregates) — separate router under /api/gigs."""

from __future__ import annotations

import asyncio
import re
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from database import gigs_collection

from .list_filters import delivery_bucket_exprs, seller_level_clause, subcategory_overlap_clause

router = APIRouter(tags=["Gigs Category Browse"])

SELLER_LEVEL_IDS = ("top", "lvl2", "lvl1", "new")
DELIVERY_BUCKET_IDS = ("24h", "3d", "7d", "week_plus")


def _published_category_match(category: str) -> dict[str, Any]:
    cat_rx = re.escape(category.strip())
    return {
        "status": "Published",
        "category": {"$regex": cat_rx, "$options": "i"},
    }


async def _count_documents(q: dict[str, Any]) -> int:
    return int(await gigs_collection.count_documents(q))


@router.get("/browse/facets")
async def get_category_browse_facets(
    category: str = Query(..., min_length=1, max_length=180),
    sub_labels: list[str] = Query(
        default=[],
        description="repeat param: subcategories to count vs service_type/title/tags",
    ),
):
    """
    Aggregate counts for the category browse right rail without applying price/seller/delivery filters.
    """
    cat = category.strip()
    if not cat:
        raise HTTPException(status_code=400, detail="category is required")

    base = _published_category_match(cat)

    agg_rows = (
        await gigs_collection.aggregate(
            [
                {"$match": base},
                {
                    "$group": {
                        "_id": None,
                        "total": {"$sum": 1},
                        "avg_rating": {"$avg": "$rating"},
                        "min_price": {"$min": "$starting_price"},
                        "max_price": {"$max": "$starting_price"},
                    },
                },
            ]
        ).to_list(1)
    )
    summary = agg_rows[0] if agg_rows else None

    total = int(summary["total"]) if summary else 0
    avg_raw = summary.get("avg_rating") if summary else None
    avg_out = (
        round(float(avg_raw), 2) if avg_raw is not None and float(avg_raw) > 0 else None
    )

    mn = summary.get("min_price") if summary else None
    mx = summary.get("max_price") if summary else None
    bounds: dict[str, Any] | None = None
    if total > 0 and (mn is not None or mx is not None):
        bounds = {}
        bounds["min"] = float(mn) if mn is not None else None
        bounds["max"] = float(mx) if mx is not None else None

    clean_labels = [str(l).strip() for l in sub_labels if str(l).strip()]
    sub_pairs: list[tuple[str, dict[str, Any]]] = []
    for lab in clean_labels:
        qsub = subcategory_overlap_clause(lab)
        if qsub:
            sub_pairs.append((lab, {"$and": [base, qsub]}))

    sell_pairs = []
    for lid in SELLER_LEVEL_IDS:
        cl = seller_level_clause(lid)
        if cl:
            sell_pairs.append((lid, {"$and": [base, cl]}))

    del_pairs = []
    for bid in DELIVERY_BUCKET_IDS:
        ex = delivery_bucket_exprs(bid)
        if ex:
            del_pairs.append((bid, {"$and": [base, ex]}))

    counts_sub = await asyncio.gather(*[_count_documents(q) for _, q in sub_pairs]) if sub_pairs else []
    counts_sell = await asyncio.gather(*[_count_documents(q) for _, q in sell_pairs]) if sell_pairs else []
    counts_del = await asyncio.gather(*[_count_documents(q) for _, q in del_pairs]) if del_pairs else []

    subcategories = [{"label": lab, "count": counts_sub[idx]} for idx, (lab, _) in enumerate(sub_pairs)]
    seller_levels = [{"id": lid, "count": counts_sell[idx]} for idx, (lid, _) in enumerate(sell_pairs)]
    delivery_buckets = [{"id": bid, "count": counts_del[idx]} for idx, (bid, _) in enumerate(del_pairs)]

    return {
        "status": "success",
        "category": cat,
        "total": total,
        "avg_rating": avg_out,
        "price_bounds": bounds,
        "subcategories": subcategories,
        "seller_levels": seller_levels,
        "delivery_buckets": delivery_buckets,
    }
