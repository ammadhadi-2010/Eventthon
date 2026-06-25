"""Company portal analytics — live counts with week-over-week deltas."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, List, Optional

from .portal_shared import portal_bucket


def _parse_created_at(raw: Any) -> Optional[datetime]:
    if not raw:
        return None
    if isinstance(raw, datetime):
        return raw.replace(tzinfo=None)
    if isinstance(raw, str):
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00")).replace(tzinfo=None)
        except (TypeError, ValueError):
            return None
    return None


def _format_delta(current: int, previous: int) -> str:
    if previous <= 0:
        return "+100%" if current > 0 else "0%"
    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.1f}%"


def _count_apps_between(apps: List[dict], start: datetime, end: datetime) -> int:
    total = 0
    for doc in apps:
        ts = _parse_created_at(doc.get("created_at"))
        if ts and start <= ts < end:
            total += 1
    return total


def _count_hires_between(apps: List[dict], start: datetime, end: datetime) -> int:
    total = 0
    for doc in apps:
        if portal_bucket(doc.get("status")) != "shortlisted":
            continue
        ts = _parse_created_at(doc.get("created_at"))
        if ts and start <= ts < end:
            total += 1
    return total


def build_analytics(apps: List[dict], company: dict, open_jobs: int) -> dict:
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    prev_start = now - timedelta(days=14)

    total_apps = len(apps)
    hires = sum(1 for doc in apps if portal_bucket(doc.get("status")) == "shortlisted")
    profile_views = int(company.get("profile_views") or 0)
    job_views = total_apps + open_jobs

    apps_this_week = _count_apps_between(apps, week_start, now)
    apps_prev_week = _count_apps_between(apps, prev_start, week_start)
    hires_this_week = _count_hires_between(apps, week_start, now)
    hires_prev_week = _count_hires_between(apps, prev_start, week_start)

    return {
        "profileViews": profile_views,
        "jobViews": job_views,
        "applications": total_apps,
        "hires": hires,
        "deltas": {
            "profileViews": "—" if profile_views == 0 else "0%",
            "jobViews": "—" if job_views == 0 else "0%",
            "applications": _format_delta(apps_this_week, apps_prev_week),
            "hires": _format_delta(hires_this_week, hires_prev_week),
        },
    }
