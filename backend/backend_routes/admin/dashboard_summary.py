from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query

from database import (
    companies_collection,
    gigs_collection,
    hub_projects_collection,
    squad_collection,
    transaction_collection,
    user_collection,
)

router = APIRouter(tags=["Admin Dashboard"])


def _month_range(now: datetime) -> tuple[datetime, datetime, datetime]:
    start = datetime(now.year, now.month, 1)
    if now.month == 12:
        next_start = datetime(now.year + 1, 1, 1)
    else:
        next_start = datetime(now.year, now.month + 1, 1)
    if now.month == 1:
        prev_start = datetime(now.year - 1, 12, 1)
    else:
        prev_start = datetime(now.year, now.month - 1, 1)
    return prev_start, start, next_start


def _pct_change(curr: int, prev: int) -> str:
    if prev <= 0:
        return "+0.0%" if curr <= 0 else "+100.0%"
    pct = ((curr - prev) / prev) * 100
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct:.1f}%"


def _human_when(ts: Any) -> str:
    if not ts:
        return "Recently"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            return "Recently"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(max(1, delta.total_seconds()))
    if sec < 60:
        return "Just now"
    if sec < 3600:
        return f"{sec // 60} mins ago"
    if sec < 86400:
        return f"{sec // 3600} hours ago"
    return f"{sec // 86400} days ago"


def _company_verification_row(doc: dict) -> Dict[str, Any]:
    return {
        "id": str(doc.get("_id") or ""),
        "name": str(doc.get("name") or "Company").strip(),
        "industry": str(doc.get("industry") or "General").strip(),
        "country": str(doc.get("country") or "").strip(),
        "contactEmail": str(doc.get("contact_email") or "").strip(),
        "registrationNumber": str(doc.get("registration_number") or "").strip(),
        "taxId": str(doc.get("tax_id") or "").strip(),
        "imageurl": str(doc.get("imageurl") or doc.get("logo_url") or "").strip(),
        "verificationProofImageurl": str(doc.get("verification_proof_imageurl") or "").strip(),
        "submittedOn": _human_when(doc.get("verification_submitted_at") or doc.get("created_at")),
        "status": str(doc.get("status") or "pending").lower(),
    }


@router.get("/dashboard/summary")
async def get_admin_dashboard_summary(view: str = Query("pending")):
    now = datetime.utcnow()
    prev_start, month_start, next_month_start = _month_range(now)

    (
        total_users,
        total_squads,
        total_projects,
        total_gigs,
        users_curr,
        users_prev,
        squads_curr,
        squads_prev,
        gigs_curr,
        gigs_prev,
        projects_curr,
        projects_prev,
    ) = await asyncio.gather(
        user_collection.count_documents({}),
        squad_collection.count_documents({}),
        hub_projects_collection.count_documents({}),
        gigs_collection.count_documents({}),
        user_collection.count_documents({"created_at": {"$gte": month_start, "$lt": next_month_start}}),
        user_collection.count_documents({"created_at": {"$gte": prev_start, "$lt": month_start}}),
        squad_collection.count_documents({"created_at": {"$gte": month_start, "$lt": next_month_start}}),
        squad_collection.count_documents({"created_at": {"$gte": prev_start, "$lt": month_start}}),
        gigs_collection.count_documents({"created_at": {"$gte": month_start, "$lt": next_month_start}}),
        gigs_collection.count_documents({"created_at": {"$gte": prev_start, "$lt": month_start}}),
        hub_projects_collection.count_documents({"created_at": {"$gte": month_start, "$lt": next_month_start}}),
        hub_projects_collection.count_documents({"created_at": {"$gte": prev_start, "$lt": month_start}}),
    )

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

    stats = [
        {"label": "Total Users", "value": f"{total_users:,}", "change": _pct_change(users_curr, users_prev), "detail": "vs last month", "color": "#8b5cf6", "icon": "users", "points": [12, 16, 14, 20, 18, 22, 19]},
        {"label": "Total Squads", "value": f"{total_squads:,}", "change": _pct_change(squads_curr, squads_prev), "detail": "vs last month", "color": "#2563eb", "icon": "squads", "points": [10, 14, 18, 16, 20, 17, 21]},
        {"label": "Total Projects", "value": f"{total_projects:,}", "change": _pct_change(projects_curr, projects_prev), "detail": "vs last month", "color": "#22c55e", "icon": "projects", "points": [8, 12, 15, 14, 18, 16, 20]},
        {"label": "Total Gigs", "value": f"{total_gigs:,}", "change": _pct_change(gigs_curr, gigs_prev), "detail": "vs last month", "color": "#f59e0b", "icon": "gigs", "points": [9, 13, 17, 15, 19, 18, 22]},
        {"label": "Platform Revenue", "value": f"${revenue:,.0f}", "change": "+0.0%", "detail": "vs last month", "color": "#ec4899", "icon": "revenue", "points": [14, 18, 16, 22, 20, 24, 23]},
    ]

    role_aggr = await user_collection.aggregate(
        [{"$group": {"_id": {"$ifNull": ["$role", "other"]}, "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 4}]
    ).to_list(length=4)
    total_roles = sum(int(r.get("count", 0)) for r in role_aggr) or 1
    role_breakdown = [
        {
            "label": str((r.get("_id") or "other")).title(),
            "value": f"{int(r.get('count', 0)):,}",
            "share": f"{(int(r.get('count', 0)) / total_roles) * 100:.1f}%",
            "color": ["#8b5cf6", "#2563eb", "#22c55e", "#f59e0b"][idx % 4],
        }
        for idx, r in enumerate(role_aggr)
    ]

    recent_users = await user_collection.find({}).sort("created_at", -1).limit(5).to_list(length=5)
    recent_activities = [
        {
            "title": "New user registered",
            "meta": f"{(u.get('first_name') or '').strip()} {(u.get('last_name') or '').strip()}".strip() or (u.get("email") or "User"),
            "time": _human_when(u.get("created_at")),
            "color": ["#8b5cf6", "#2563eb", "#22c55e", "#f59e0b", "#ec4899"][i % 5],
        }
        for i, u in enumerate(recent_users)
    ]

    country_aggr = await user_collection.aggregate(
        [{"$match": {"country": {"$nin": [None, "", " "]}}}, {"$group": {"_id": "$country", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 5}]
    ).to_list(length=5)
    country_total = sum(int(r.get("count", 0)) for r in country_aggr) or 1
    top_countries = [{"country": str(r.get("_id")), "share": f"{(int(r.get('count', 0)) / country_total) * 100:.1f}%"} for r in country_aggr]

    tx_docs = await transaction_collection.find({}).sort("created_at", -1).limit(5).to_list(length=5)
    transaction_rows: List[Dict[str, Any]] = []
    for i, tx in enumerate(tx_docs):
        uid = str(tx.get("user_id") or tx.get("sender_id") or tx.get("from_user_id") or "")
        user = await user_collection.find_one({"$or": [{"user_id": uid}, {"mobile": uid}]}) if uid else None
        name = (
            f"{(user or {}).get('first_name', '')} {(user or {}).get('last_name', '')}".strip()
            or (user or {}).get("email")
            or "Platform User"
        )
        amount = tx.get("amount", 0)
        currency = tx.get("currency", "USD")
        transaction_rows.append(
            {
                "id": f"#TXN{9000 + i}",
                "user": name,
                "type": str(tx.get("type") or "Transaction").replace("_", " ").title(),
                "amount": f"{currency} {float(amount or 0):.2f}",
                "status": "Completed" if str(tx.get("status", "completed")).lower() in {"completed", "success", "done"} else "Pending",
                "date": _human_when(tx.get("created_at")),
            }
        )

    company_pending_docs = await companies_collection.find({"status": "pending"}).sort("verification_submitted_at", -1).limit(5).to_list(length=5)
    company_verification_requests = [_company_verification_row(doc) for doc in company_pending_docs]

    return {
        "view": view,
        "stats": stats,
        "roleBreakdown": role_breakdown,
        "recentActivities": recent_activities,
        "topCountries": top_countries,
        "transactionRows": transaction_rows,
        "companyVerificationRequests": company_verification_requests,
    }

