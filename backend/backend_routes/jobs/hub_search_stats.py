"""Live aggregation counters for the jobs marketplace search response."""
from __future__ import annotations

from database import jobs_collection

from backend_routes.public.public_marketplace_defaults import JOB_BOARD_STATS
from .hub_listings import public_listings_query
from .hub_sidebar import _format_count, compute_market_insights


async def _distinct_company_count(query: dict) -> int:
    pipeline = [
        {"$match": query},
        {"$group": {"_id": {"$ifNull": ["$company_name", "Company"]}}},
        {"$count": "total"},
    ]
    rows = await jobs_collection.aggregate(pipeline).to_list(length=1)
    return int(rows[0]["total"]) if rows else 0


async def build_search_stats() -> list[dict]:
    query = public_listings_query()
    active = await jobs_collection.count_documents(query)
    companies = await _distinct_company_count(query)
    remote_query = {
        **query,
        "$or": [{"remote": True}, {"work_mode": {"$regex": "^remote$", "$options": "i"}}],
    }
    remote_jobs = await jobs_collection.count_documents(remote_query)
    market = await compute_market_insights()
    avg_salary = market.get("averageSalary") or "$85K"

    live_values = {
        "active": _format_count(active),
        "companies": _format_count(companies),
        "remote": _format_count(remote_jobs),
        "salary": avg_salary if str(avg_salary).startswith("$") else f"${avg_salary}",
    }
    tones = {"active": "violet", "companies": "green", "remote": "blue", "salary": "amber"}
    stats = []
    for row in JOB_BOARD_STATS:
        row_id = str(row.get("id") or "")
        stats.append(
            {
                **row,
                "value": live_values.get(row_id, row.get("value")),
                "change": row.get("delta") or row.get("change") or "",
                "tone": tones.get(row_id, "violet"),
            }
        )
    return stats
