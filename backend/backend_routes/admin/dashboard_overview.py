"""Build a single platform overview tab on demand."""

from __future__ import annotations

from typing import Any, Dict, Tuple

from database import (
    gigs_collection,
    hub_projects_collection,
    jobs_collection,
    squad_collection,
    transaction_collection,
    user_collection,
)

from .dashboard_overview_helpers import spike_metrics
from .dashboard_overview_tabs_a import gigs_tab, projects_tab, squads_tab, users_tab
from .dashboard_overview_tabs_b import jobs_tab, revenue_tab

TAB_REGISTRY: Dict[str, Tuple[Any, Any, str]] = {
    "users": (users_tab, user_collection, "created_at"),
    "squads": (squads_tab, squad_collection, "created_at"),
    "projects": (projects_tab, hub_projects_collection, "updated_at"),
    "gigs": (gigs_tab, gigs_collection, "created_at"),
    "jobs": (jobs_tab, jobs_collection, "created_at"),
    "revenue": (revenue_tab, transaction_collection, "created_at"),
}


async def build_overview_tab(tab: str) -> Dict[str, Any]:
    key = str(tab or "").strip().lower()
    entry = TAB_REGISTRY.get(key)
    if not entry:
        raise ValueError(f"Unknown overview tab: {tab}")
    builder, collection, date_field = entry
    payload = await builder()
    payload["spikeMetrics"] = await spike_metrics(collection, date_field)
    return payload
