"""Shared helpers for admin dashboard overview tabs."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List

TABLE_ROW_LIMIT = 5
WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
BREAKDOWN_COLORS = ["#8b5cf6", "#2563eb", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"]


def human_when(ts: Any) -> str:
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
        return f"{sec // 60}m ago"
    if sec < 86400:
        return f"{sec // 3600}h ago"
    return f"{sec // 86400}d ago"


async def weekly_points(collection, date_field: str = "created_at") -> List[int]:
    now = datetime.utcnow()
    points: List[int] = []
    for offset in range(6, -1, -1):
        start = datetime(now.year, now.month, now.day) - timedelta(days=offset)
        end = start + timedelta(days=1)
        count = await collection.count_documents({date_field: {"$gte": start, "$lt": end}})
        points.append(count)
    return points


async def spike_metrics(collection, date_field: str = "created_at") -> List[Dict[str, str]]:
    now = datetime.utcnow()
    day_start = datetime(now.year, now.month, now.day)
    week_start = day_start - timedelta(days=7)
    prev_week_start = day_start - timedelta(days=14)

    today = await collection.count_documents({date_field: {"$gte": day_start}})
    this_week = await collection.count_documents({date_field: {"$gte": week_start}})
    last_week = await collection.count_documents({date_field: {"$gte": prev_week_start, "$lt": week_start}})

    def pct_change(curr: int, prev: int) -> float:
        if prev <= 0:
            return 100.0 if curr > 0 else 0.0
        return ((curr - prev) / prev) * 100.0

    wow = pct_change(this_week, last_week)
    daily_avg = this_week / 7.0
    prev_daily = last_week / 7.0
    daily_spike = pct_change(round(daily_avg), round(prev_daily)) if prev_daily else (100.0 if daily_avg else 0.0)

    return [
        {
            "label": "WoW Spike",
            "value": f"{wow:+.1f}%",
            "hint": f"{this_week} this wk · {last_week} prior",
            "tone": "up" if wow >= 0 else "down",
        },
        {
            "label": "Week Total",
            "value": f"{this_week:,}",
            "hint": "Registrations (7d)",
            "tone": "neutral",
        },
        {
            "label": "Daily Avg",
            "value": f"{daily_avg:.1f}",
            "hint": f"{daily_spike:+.0f}% vs prior avg",
            "tone": "up" if daily_spike >= 0 else "down",
        },
        {
            "label": "Today",
            "value": f"{today:,}",
            "hint": "Since midnight UTC",
            "tone": "neutral",
        },
    ]


def breakdown_rows(groups: List[dict], total: int, label_key: str = "_id") -> List[Dict[str, str]]:
    denom = total or 1
    rows = []
    for idx, group in enumerate(groups[:4]):
        count = int(group.get("count", 0))
        label = str(group.get(label_key) or "other").replace("_", " ").title()
        rows.append(
            {
                "label": label,
                "value": f"{count:,}",
                "share": f"{(count / denom) * 100:.1f}%",
                "color": BREAKDOWN_COLORS[idx % len(BREAKDOWN_COLORS)],
            }
        )
    return rows


async def aggregate_breakdown(collection, field: str, total: int) -> List[Dict[str, str]]:
    pipeline = [
        {"$group": {"_id": {"$ifNull": [f"${field}", "other"]}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 4},
    ]
    groups = await collection.aggregate(pipeline).to_list(length=4)
    return breakdown_rows(groups, total)
