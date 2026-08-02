"""Live aggregation counters for the jobs marketplace search response."""
from __future__ import annotations

from database import jobs_collection

from .hub_listings import public_listings_query
from .hub_sidebar import _format_count, compute_market_insights

STAT_META = (
    ("active", "Active Jobs", "violet"),
    ("companies", "Companies Hiring", "green"),
    ("remote", "Remote Jobs", "blue"),
    ("salary", "Avg. Salary", "amber"),
)


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
    avg_salary = market.get("averageSalary") or "$0"

    live_values = {
        "active": _format_count(active),
        "companies": _format_count(companies),
        "remote": _format_count(remote_jobs),
        "salary": avg_salary if str(avg_salary).startswith("$") else f"${avg_salary}",
    }
    return [
        {
            "id": row_id,
            "label": label,
            "value": live_values.get(row_id, "0"),
            "change": "Live from listings",
            "tone": tone,
        }
        for row_id, label, tone in STAT_META
    ]
