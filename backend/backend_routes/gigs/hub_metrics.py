"""Live marketplace stats for the gigs hub."""
from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter

from database import gig_orders_collection, gigs_collection

router = APIRouter(prefix="/gigs/hub", tags=["Gig Hub"])


def _format_count(value: int) -> str:
    if value >= 1_000_000:
        return f"{value / 1_000_000:.1f}M"
    if value >= 10_000:
        return f"{value / 1_000:.1f}K"
    if value >= 1_000:
        return f"{value:,}"
    return str(value)


def _format_money(value: float) -> str:
    if value >= 1_000_000:
        return f"${value / 1_000_000:.1f}M"
    if value >= 1_000:
        return f"${value / 1_000:.1f}K"
    return f"${value:,.0f}"


def _week_delta(current: int, previous: int) -> str:
    if previous <= 0:
        return "+100% this week" if current > 0 else "0% this week"
    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.0f}% this week"


async def _count_between(collection, query: dict, field: str, start: datetime, end: datetime) -> int:
    return await collection.count_documents({**query, field: {"$gte": start, "$lt": end}})


@router.get("/metrics")
async def gig_hub_metrics():
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    prev_start = now - timedelta(days=14)

    published_q = {"status": "Published"}
    active_gigs = await gigs_collection.count_documents(published_q)
    gigs_this_week = await _count_between(gigs_collection, published_q, "created_at", week_start, now)
    gigs_prev_week = await _count_between(gigs_collection, published_q, "created_at", prev_start, week_start)

    seller_ids = await gigs_collection.distinct("seller_user_id", published_q)
    freelancers = len([sid for sid in seller_ids if str(sid or "").strip()])
    new_sellers = await _count_between(
        gigs_collection,
        published_q,
        "created_at",
        week_start,
        now,
    )

    completed_q = {"status": "Completed"}
    completed_orders = await gig_orders_collection.count_documents(completed_q)
    orders_this_week = await _count_between(gig_orders_collection, {}, "created_at", week_start, now)
    orders_prev_week = await _count_between(gig_orders_collection, {}, "created_at", prev_start, week_start)

    revenue = 0.0
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    async for row in gig_orders_collection.aggregate(pipeline):
        revenue = float(row.get("total") or 0.0)

    return {
        "status": "success",
        "stats": [
            {
                "key": "active_gigs",
                "label": "Active Gigs",
                "value": _format_count(active_gigs),
                "change": _week_delta(gigs_this_week, gigs_prev_week),
                "tone": "violet",
            },
            {
                "key": "freelancers",
                "label": "Freelancers",
                "value": _format_count(freelancers),
                "change": _week_delta(new_sellers, max(1, freelancers // 10)),
                "tone": "blue",
            },
            {
                "key": "orders_completed",
                "label": "Orders Completed",
                "value": _format_count(completed_orders),
                "change": _week_delta(orders_this_week, orders_prev_week),
                "tone": "green",
            },
            {
                "key": "total_earnings",
                "label": "Total Earnings",
                "value": _format_money(revenue),
                "change": _week_delta(orders_this_week, orders_prev_week),
                "tone": "amber",
            },
        ],
    }
