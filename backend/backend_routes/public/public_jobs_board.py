"""Public job board listing endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Query

from database import jobs_collection
from .public_marketplace import public_jobs_board_payload

router = APIRouter(prefix="/jobs", tags=["Public Job Board"])


@router.get("/board", dependencies=[])
async def public_jobs_board(q: str = Query("", max_length=120)):
    """Remote job board — listings, stats, sidebar metadata (no auth)."""
    needle = q.strip().lower()
    rows = []
    async for doc in jobs_collection.find({"visibility": "public"}).sort("created_at", -1).limit(80):
        if needle:
            blob = " ".join(
                str(doc.get(k) or "")
                for k in ("title", "category", "company_name", "summary")
            ).lower()
            skills = " ".join(doc.get("skills_tags") or []).lower()
            if needle not in blob and needle not in skills:
                continue
        rows.append(doc)
    payload = public_jobs_board_payload(rows)
    return {"status": "success", **payload}
