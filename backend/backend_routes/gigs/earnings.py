"""Seller earnings summaries from gig orders."""
from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query

from database import gig_orders_collection

from .gigs_session import assert_gig_owner, verify_gigs_session

router = APIRouter(prefix="/gigs/earnings", tags=["Gig Earnings"])

BETA_STATUS = "In Progress / Beta Mode"


def _period_start(period: str) -> datetime:
    now = datetime.utcnow()
    key = (period or "month").strip().lower()
    if key == "week":
        return now - timedelta(days=7)
    return now - timedelta(days=30)


async def _sum_revenue(query: dict) -> float:
    pipeline = [{"$match": query}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    async for row in gig_orders_collection.aggregate(pipeline):
        return float(row.get("total") or 0.0)
    return 0.0


@router.get("/summary")
async def seller_earnings_summary(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    period: str = Query("month"),
    user: dict = Depends(verify_gigs_session),
):
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)

    base = {"seller_user_id": seller_id}
    since = _period_start(period)
    period_q = {**base, "created_at": {"$gte": since}}

    earnings = await _sum_revenue(period_q)
    total_orders = await gig_orders_collection.count_documents(period_q)
    completed = await gig_orders_collection.count_documents({**period_q, "status": "Completed"})
    in_progress = await gig_orders_collection.count_documents(
        {**period_q, "status": {"$in": ["In Progress", BETA_STATUS]}}
    )
    pending = await gig_orders_collection.count_documents({**period_q, "status": "Pending"})

    lifetime = await _sum_revenue(base)
    if total_orders == 0 and lifetime == 0:
        return {
            "status": "success",
            "summary": {
                "period": period,
                "earnings": 0,
                "orders": 0,
                "completed_orders": 0,
                "in_progress_orders": 0,
                "pending_orders": 0,
                "lifetime_earnings": 0,
                "avg_order_value": 0,
            },
        }

    avg = round(earnings / total_orders, 2) if total_orders else 0
    return {
        "status": "success",
        "summary": {
            "period": period,
            "earnings": earnings,
            "orders": total_orders,
            "completed_orders": completed,
            "in_progress_orders": in_progress,
            "pending_orders": pending,
            "lifetime_earnings": lifetime,
            "avg_order_value": avg,
        },
    }
