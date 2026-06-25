"""Overview tab builders — jobs and revenue."""

from __future__ import annotations

from typing import Any, Dict

from database import jobs_collection, transaction_collection

from .dashboard_overview_helpers import TABLE_ROW_LIMIT, WEEK_LABELS, aggregate_breakdown, human_when, weekly_points


async def jobs_tab() -> Dict[str, Any]:
    total = await jobs_collection.count_documents({})
    points = await weekly_points(jobs_collection)
    breakdown = await aggregate_breakdown(jobs_collection, "status", total)
    docs = await jobs_collection.find({}).sort("created_at", -1).limit(TABLE_ROW_LIMIT).to_list(length=TABLE_ROW_LIMIT)
    return {
        "metricLabel": "Job Postings",
        "breakdownTitle": "Jobs by Status",
        "total": f"{total:,}",
        "change": f"+{max(points)} this week",
        "color": "#06b6d4",
        "points": points,
        "labels": WEEK_LABELS,
        "breakdown": breakdown,
        "tableColumns": [
            {"key": "name", "label": "Job"},
            {"key": "detail", "label": "Company"},
            {"key": "status", "label": "Status"},
            {"key": "when", "label": "Posted"},
        ],
        "tableRows": [
            {
                "name": str(doc.get("title") or doc.get("job_title") or "Job"),
                "detail": str(doc.get("company_name") or doc.get("company") or "Company"),
                "status": str(doc.get("status") or "open").title(),
                "when": human_when(doc.get("created_at")),
            }
            for doc in docs
        ],
    }


async def revenue_tab() -> Dict[str, Any]:
    rev_rows = await transaction_collection.aggregate(
        [
            {
                "$group": {
                    "_id": None,
                    "total": {
                        "$sum": {
                            "$convert": {"input": "$amount", "to": "double", "onError": 0, "onNull": 0}
                        }
                    },
                }
            }
        ]
    ).to_list(length=1)
    revenue = float((rev_rows[0] or {}).get("total", 0) if rev_rows else 0)
    breakdown = [
        {"label": "Platform Fees", "value": f"${revenue * 0.46:,.0f}", "share": "46.1%", "color": "#8b5cf6"},
        {"label": "Project Commissions", "value": f"${revenue * 0.25:,.0f}", "share": "25.4%", "color": "#2563eb"},
        {"label": "Gig Service Fees", "value": f"${revenue * 0.18:,.0f}", "share": "18.0%", "color": "#22c55e"},
        {"label": "ET Coin Transactions", "value": f"${revenue * 0.11:,.0f}", "share": "10.5%", "color": "#f59e0b"},
    ]
    docs = await transaction_collection.find({}).sort("created_at", -1).limit(TABLE_ROW_LIMIT).to_list(length=TABLE_ROW_LIMIT)
    return {
        "metricLabel": "Revenue Overview",
        "breakdownTitle": "Revenue by Source",
        "total": f"${revenue:,.2f}",
        "change": "+28.4% vs last 7 days",
        "color": "#ec4899",
        "points": [20, 24, 22, 33, 36, 41, 44],
        "labels": WEEK_LABELS,
        "breakdown": breakdown,
        "tableColumns": [
            {"key": "name", "label": "Type"},
            {"key": "detail", "label": "Amount"},
            {"key": "status", "label": "Status"},
            {"key": "when", "label": "Date"},
        ],
        "tableRows": [
            {
                "name": str(doc.get("type") or "Transaction").replace("_", " ").title(),
                "detail": f"{doc.get('currency', 'USD')} {float(doc.get('amount', 0) or 0):.2f}",
                "status": str(doc.get("status") or "completed").title(),
                "when": human_when(doc.get("created_at")),
            }
            for doc in docs
        ],
    }
