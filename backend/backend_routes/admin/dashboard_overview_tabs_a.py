"""Overview tab builders — users through gigs."""

from __future__ import annotations

from typing import Any, Dict

from database import gigs_collection, hub_projects_collection, squad_collection, user_collection

from .dashboard_overview_helpers import TABLE_ROW_LIMIT, WEEK_LABELS, aggregate_breakdown, human_when, weekly_points


async def users_tab() -> Dict[str, Any]:
    total = await user_collection.count_documents({})
    points = await weekly_points(user_collection)
    breakdown = await aggregate_breakdown(user_collection, "role", total)
    docs = await user_collection.find({}).sort("created_at", -1).limit(TABLE_ROW_LIMIT).to_list(length=TABLE_ROW_LIMIT)
    return {
        "metricLabel": "User Growth",
        "breakdownTitle": "Users by Role",
        "total": f"{total:,}",
        "change": f"+{max(points)} this week",
        "color": "#8b5cf6",
        "points": points,
        "labels": WEEK_LABELS,
        "breakdown": breakdown,
        "tableColumns": [
            {"key": "name", "label": "User"},
            {"key": "detail", "label": "Contact"},
            {"key": "status", "label": "Role"},
            {"key": "when", "label": "Joined"},
        ],
        "tableRows": [
            {
                "name": f"{doc.get('first_name', '')} {doc.get('last_name', '')}".strip() or doc.get("email", "User"),
                "detail": str(doc.get("email") or doc.get("mobile") or "—"),
                "status": str(doc.get("role") or "user").title(),
                "when": human_when(doc.get("created_at")),
            }
            for doc in docs
        ],
    }


async def squads_tab() -> Dict[str, Any]:
    total = await squad_collection.count_documents({})
    points = await weekly_points(squad_collection)
    breakdown = await aggregate_breakdown(squad_collection, "admin_status", total)
    docs = await squad_collection.find({}).sort("created_at", -1).limit(TABLE_ROW_LIMIT).to_list(length=TABLE_ROW_LIMIT)
    return {
        "metricLabel": "Squad Growth",
        "breakdownTitle": "Squads by Status",
        "total": f"{total:,}",
        "change": f"+{max(points)} this week",
        "color": "#2563eb",
        "points": points,
        "labels": WEEK_LABELS,
        "breakdown": breakdown,
        "tableColumns": [
            {"key": "name", "label": "Squad"},
            {"key": "detail", "label": "Niche"},
            {"key": "status", "label": "Status"},
            {"key": "when", "label": "Created"},
        ],
        "tableRows": [
            {
                "name": str(doc.get("squad_name") or doc.get("name") or "Squad"),
                "detail": str(doc.get("niche") or doc.get("category") or "General"),
                "status": str(doc.get("admin_status") or doc.get("status") or "active").title(),
                "when": human_when(doc.get("created_at")),
            }
            for doc in docs
        ],
    }


async def projects_tab() -> Dict[str, Any]:
    total = await hub_projects_collection.count_documents({})
    points = await weekly_points(hub_projects_collection, "updated_at")
    breakdown = await aggregate_breakdown(hub_projects_collection, "status", total)
    docs = await hub_projects_collection.find({}).sort("updated_at", -1).limit(TABLE_ROW_LIMIT).to_list(length=TABLE_ROW_LIMIT)
    return {
        "metricLabel": "Project Activity",
        "breakdownTitle": "Projects by Status",
        "total": f"{total:,}",
        "change": f"+{max(points)} this week",
        "color": "#22c55e",
        "points": points,
        "labels": WEEK_LABELS,
        "breakdown": breakdown,
        "tableColumns": [
            {"key": "name", "label": "Project"},
            {"key": "detail", "label": "Category"},
            {"key": "status", "label": "Status"},
            {"key": "when", "label": "Updated"},
        ],
        "tableRows": [
            {
                "name": str(doc.get("name") or doc.get("title") or "Project"),
                "detail": str(doc.get("category") or "General"),
                "status": str(doc.get("status") or "draft").title(),
                "when": human_when(doc.get("updated_at") or doc.get("created_at")),
            }
            for doc in docs
        ],
    }


async def gigs_tab() -> Dict[str, Any]:
    total = await gigs_collection.count_documents({})
    points = await weekly_points(gigs_collection)
    breakdown = await aggregate_breakdown(gigs_collection, "category", total)
    docs = await gigs_collection.find({}).sort("created_at", -1).limit(TABLE_ROW_LIMIT).to_list(length=TABLE_ROW_LIMIT)
    return {
        "metricLabel": "Gig Listings",
        "breakdownTitle": "Gigs by Category",
        "total": f"{total:,}",
        "change": f"+{max(points)} this week",
        "color": "#f59e0b",
        "points": points,
        "labels": WEEK_LABELS,
        "breakdown": breakdown,
        "tableColumns": [
            {"key": "name", "label": "Gig"},
            {"key": "detail", "label": "Category"},
            {"key": "status", "label": "Status"},
            {"key": "when", "label": "Posted"},
        ],
        "tableRows": [
            {
                "name": str(doc.get("title") or "Gig"),
                "detail": str(doc.get("category") or "General"),
                "status": str(doc.get("status") or "active").title(),
                "when": human_when(doc.get("created_at")),
            }
            for doc in docs
        ],
    }
