"""Company portal analytics — live counts with week-over-week deltas + sparkline series."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Callable, List, Optional

from .portal_pipeline import pipeline_stage
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
    if previous <= 0 and current <= 0:
        return "—"
    if previous <= 0:
        return "+100%" if current > 0 else "—"
    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.0f}%"


def _count_between(
    apps: List[dict],
    start: datetime,
    end: datetime,
    predicate: Optional[Callable[[dict], bool]] = None,
) -> int:
    total = 0
    for doc in apps:
        if predicate and not predicate(doc):
            continue
        ts = _parse_created_at(doc.get("updated_at") or doc.get("created_at"))
        if ts and start <= ts < end:
            total += 1
    return total


def _is_hire(doc: dict) -> bool:
    stage = pipeline_stage(doc.get("status"))
    return stage in {"hired", "offer"} or portal_bucket(doc.get("status")) == "shortlisted"


def _daily_series(
    apps: List[dict],
    days: int = 7,
    predicate: Optional[Callable[[dict], bool]] = None,
) -> List[int]:
    now = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    buckets = [0] * days
    for doc in apps:
        if predicate and not predicate(doc):
            continue
        ts = _parse_created_at(doc.get("created_at"))
        if not ts:
            continue
        day = ts.replace(hour=0, minute=0, second=0, microsecond=0)
        idx = (now - day).days
        if 0 <= idx < days:
            buckets[days - 1 - idx] += 1
    return buckets


def build_analytics(apps: List[dict], company: dict, open_jobs: int) -> dict:
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    prev_start = now - timedelta(days=14)

    total_apps = len(apps)
    hires = sum(1 for doc in apps if _is_hire(doc))
    profile_views = int(company.get("profile_views") or 0)
    from .portal_followers import followers_count_from_company

    followers = followers_count_from_company(company)
    # Job views: stored counter when present, else applicants + live roles as proxy
    job_views = int(company.get("job_views") or 0)
    if job_views <= 0:
        job_views = total_apps + max(0, open_jobs)

    apps_this_week = _count_between(apps, week_start, now)
    apps_prev_week = _count_between(apps, prev_start, week_start)
    hires_this_week = _count_between(apps, week_start, now, _is_hire)
    hires_prev_week = _count_between(apps, prev_start, week_start, _is_hire)

    app_series = _daily_series(apps, 7)
    hire_series = _daily_series(apps, 7, _is_hire)

    return {
        "profileViews": profile_views,
        "jobViews": job_views,
        "applications": total_apps,
        "hires": hires,
        "followersGrowth": followers,
        "deltas": {
            "profileViews": "—" if profile_views == 0 else "0%",
            "jobViews": "—" if job_views == 0 else "0%",
            "applications": _format_delta(apps_this_week, apps_prev_week),
            "hires": _format_delta(hires_this_week, hires_prev_week),
            "followersGrowth": "—" if followers == 0 else "0%",
        },
        "series": {
            "profileViews": [],
            "jobViews": [],
            "applications": app_series,
            "hires": hire_series,
            "followersGrowth": [],
        },
    }
