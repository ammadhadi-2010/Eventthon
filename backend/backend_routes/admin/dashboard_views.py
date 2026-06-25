"""Admin dashboard list views — transactions, activities, country analytics."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query

from database import transaction_collection, user_collection

from .dashboard_overview import build_overview_tab

router = APIRouter(tags=["Admin Dashboard Views"])

VALID_OVERVIEW_TABS = frozenset({"users", "squads", "projects", "gigs", "jobs", "revenue"})


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
    if sec < 3600:
        return f"{sec // 60} mins ago"
    if sec < 86400:
        return f"{sec // 3600} hours ago"
    return f"{sec // 86400} days ago"


@router.get("/transactions")
async def list_admin_transactions(limit: int = Query(100, ge=1, le=500)):
    docs = await transaction_collection.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    rows: List[Dict[str, Any]] = []
    for i, tx in enumerate(docs):
        uid = str(tx.get("user_id") or tx.get("sender_id") or tx.get("from_user_id") or "")
        user = await user_collection.find_one({"$or": [{"user_id": uid}, {"mobile": uid}]}) if uid else None
        name = (
            f"{(user or {}).get('first_name', '')} {(user or {}).get('last_name', '')}".strip()
            or (user or {}).get("email")
            or "Platform User"
        )
        amount = tx.get("amount", 0)
        currency = tx.get("currency", "USD")
        rows.append(
            {
                "id": f"#TXN{9000 + i}",
                "user": name,
                "type": str(tx.get("type") or "Transaction").replace("_", " ").title(),
                "amount": f"{currency} {float(amount or 0):.2f}",
                "status": "Completed"
                if str(tx.get("status", "completed")).lower() in {"completed", "success", "done"}
                else "Pending",
                "date": _human_when(tx.get("created_at")),
            }
        )
    return {"status": "success", "rows": rows, "total": len(rows)}


@router.get("/activities")
async def list_admin_activities(limit: int = Query(100, ge=1, le=500)):
    docs = await user_collection.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
    rows = [
        {
            "title": "New user registered",
            "meta": f"{(u.get('first_name') or '').strip()} {(u.get('last_name') or '').strip()}".strip()
            or (u.get("email") or "User"),
            "time": _human_when(u.get("created_at")),
            "color": ["#8b5cf6", "#2563eb", "#22c55e", "#f59e0b", "#ec4899"][i % 5],
        }
        for i, u in enumerate(docs)
    ]
    return {"status": "success", "rows": rows, "total": len(rows)}


@router.get("/analytics/countries")
async def list_country_analytics():
    groups = await user_collection.aggregate(
        [
            {"$match": {"country": {"$nin": [None, "", " "]}}},
            {"$group": {"_id": "$country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
    ).to_list(length=500)
    total = sum(int(row.get("count", 0)) for row in groups) or 1
    rows = [
        {
            "country": str(row.get("_id") or "Unknown"),
            "users": int(row.get("count", 0)),
            "share": f"{(int(row.get('count', 0)) / total) * 100:.1f}%",
        }
        for row in groups
    ]
    return {"status": "success", "rows": rows, "total": len(rows), "networkTotal": total}


@router.get("/dashboard/overview/{tab}")
async def get_dashboard_overview_tab(tab: str):
    key = str(tab or "").strip().lower()
    if key not in VALID_OVERVIEW_TABS:
        raise HTTPException(status_code=404, detail="Unknown overview tab")
    try:
        payload = await build_overview_tab(key)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "success", "tab": key, "data": payload}
