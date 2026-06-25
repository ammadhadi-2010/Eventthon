"""Admin listing APIs for enterprise bug report management."""
from __future__ import annotations

from fastapi import APIRouter, Query

from .presentation import build_summary, normalize_status
from .store import list_feedback_reports

router = APIRouter(prefix="/feedback", tags=["Admin Feedback"])


def _matches_filters(row: dict, status: str, priority: str, search: str) -> bool:
    if status and status.lower() != "all":
        if normalize_status(row.get("status")) != status:
            return False
    if priority and priority.lower() != "all":
        if str(row.get("priority") or "") != priority:
            return False
    if search:
        token = search.lower()
        haystack = " ".join(
            [
                str(row.get("report_code") or ""),
                str(row.get("title") or ""),
                str(row.get("description") or ""),
                str(row.get("reporter_name") or ""),
                str(row.get("page_location") or ""),
            ]
        ).lower()
        if token not in haystack:
            return False
    return True


@router.get("")
async def admin_list_feedback_reports(
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    rows = await list_feedback_reports(enrich=True)
    summary = build_summary(rows)
    filtered = [
        row
        for row in rows
        if _matches_filters(row, status or "all", priority or "all", (search or "").strip())
    ]
    return {
        "status": "success",
        "data": filtered,
        "summary": summary,
    }
