"""Jobs hub right sidebar — market insights, skills, user application feed."""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any, Dict, List

from database import job_applications_collection, jobs_collection

from .hub_listings import _parse_band, public_listings_query
from .hub_shared import normalize_status


def _format_count(n: int) -> str:
    if n >= 1000:
        return f"{n / 1000:.1f}K".replace(".0K", "K")
    return f"{n:,}"


def _relative_time(ts: Any) -> str:
    if not ts:
        return "Recently"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return "Recently"
    if not isinstance(ts, datetime):
        return "Recently"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(delta.total_seconds())
    if sec < 3600:
        return f"{max(1, sec // 60)} min ago"
    if sec < 86400:
        return f"{max(1, sec // 3600)}h ago"
    return f"{max(1, sec // 86400)}d ago"


def _status_label(raw: str) -> str:
    key = normalize_status(raw)
    return {
        "applied": "Applied",
        "in-review": "In Review",
        "interview": "Interview",
        "offered": "Assessment",
    }.get(key, "Applied")


def _status_key(raw: str) -> str:
    key = normalize_status(raw)
    if key == "offered":
        return "assessment"
    return key.replace("-", "")


async def compute_market_insights() -> Dict[str, Any]:
    query = public_listings_query()
    openings = await jobs_collection.count_documents(query)
    salaries_k: List[float] = []
    skill_counter: Counter = Counter()
    cursor = jobs_collection.find(query).sort("created_at", -1).limit(200)
    async for doc in cursor:
        smin, smax = _parse_band(doc)
        if smin or smax:
            salaries_k.append((float(smin) + float(smax)) / 2.0)
        for raw in list(doc.get("skills_tags") or []) + list(doc.get("keywords") or []):
            token = str(raw or "").strip()
            if len(token) >= 2:
                skill_counter[token] += 1
    avg_k = sum(salaries_k) / len(salaries_k) if salaries_k else 85.0
    avg_label = f"${int(round(avg_k))}k"
    progress = int(min(100, max(6, ((avg_k - 40.0) / 160.0) * 100)))
    top_skills = [name for name, _ in skill_counter.most_common(6)]
    return {
        "openingsCount": openings,
        "openingsLabel": _format_count(openings),
        "averageSalary": avg_label,
        "averageSalaryK": round(avg_k, 1),
        "salaryProgressPercent": progress,
        "topSkills": top_skills,
    }


async def user_application_feed(uid: str, limit: int = 6) -> List[dict]:
    rows: List[dict] = []
    user_filter = {"$or": [{"user_id": uid}, {"user_identifier": uid}]}
    async for doc in job_applications_collection.find(user_filter).sort("created_at", -1).limit(limit):
        company = str(doc.get("company") or "Company")
        logo_class = str(doc.get("logo_class") or company.split()[0].lower()[:12] or "google")
        rows.append(
            {
                "id": str(doc.get("_id") or ""),
                "company": company,
                "role": str(doc.get("role") or "Role"),
                "status": _status_label(doc.get("status")),
                "statusKey": _status_key(doc.get("status")),
                "time": _relative_time(doc.get("created_at") or doc.get("applied_date")),
                "logo": str(doc.get("logo_text") or company[:1].upper()),
                "logoClass": logo_class,
            }
        )
    return rows
