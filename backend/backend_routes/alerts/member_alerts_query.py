"""Member alert queries — exclude employer-only notifications."""
from __future__ import annotations

MEMBER_AUDIENCE_FILTER = {"audience": {"$ne": "employer"}}

MEMBER_CATEGORY_DEFS = [
    ("all", "All Alerts", {}),
    ("mentions", "Mentions", {"category": "mentions"}),
    ("squad", "Squad Alerts", {"category": {"$in": ["squad", "squads"]}}),
    ("projects", "Project Updates", {"category": "projects"}),
    ("system", "System Alerts", {"category": "system"}),
    ("jobs", "Job Alerts", {"category": {"$in": ["jobs", "gigs"]}}),
    ("security", "Security Alerts", {"category": "security"}),
]

CATEGORY_ALIASES = {
    "squads": "squad",
    "gig": "jobs",
    "gigs": "jobs",
    "application": "jobs",
    "applications": "jobs",
}


def normalize_alert_category(category: str) -> str:
    key = str(category or "system").strip().lower()
    return CATEGORY_ALIASES.get(key, key)


def member_query(user_ref: str, extra: dict | None = None) -> dict:
    query = {"user_ref": user_ref, **MEMBER_AUDIENCE_FILTER}
    if extra:
        query.update(extra)
    return query
