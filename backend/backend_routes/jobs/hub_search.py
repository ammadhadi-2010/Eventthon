"""Multi-filter job search for the Jobs hub."""
from __future__ import annotations

from typing import List, Optional

from .hub_listings import fetch_public_job_docs, job_doc_to_listing_card, job_matches_filters


async def search_hub_jobs(
    q: str = "",
    category: str = "",
    experience_level: str = "",
    job_type: str = "",
    location: str = "",
    work_mode: str = "",
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    limit: int = 50,
) -> List[dict]:
    docs = await fetch_public_job_docs(limit=80)
    rows: List[dict] = []
    for doc in docs:
        if not job_matches_filters(
            doc,
            q=q,
            category=category,
            experience_level=experience_level,
            job_type=job_type,
            location=location,
            work_mode=work_mode,
            salary_min=salary_min,
            salary_max=salary_max,
        ):
            continue
        rows.append(job_doc_to_listing_card(doc))
        if len(rows) >= limit:
            break
    return rows
