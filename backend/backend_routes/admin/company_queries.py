"""Company metrics and job-count lookups."""
from __future__ import annotations

from typing import Dict, List

from database import companies_collection, jobs_collection, user_collection

from .company_admin_filter import is_listable_company, load_admin_owner_keys
from .company_format import _is_verified, company_to_row


async def open_jobs_count_map() -> Dict[str, int]:
    counts: Dict[str, int] = {}
    pipeline = [
        {"$match": {"company_id": {"$exists": True, "$nin": [None, ""]}}},
        {"$group": {"_id": "$company_id", "count": {"$sum": 1}}},
    ]
    async for row in jobs_collection.aggregate(pipeline):
        counts[str(row["_id"])] = int(row["count"])
    return counts


async def _iter_listable_companies():
    admin_keys = await load_admin_owner_keys(user_collection)
    async for doc in companies_collection.find({}).sort("created_at", -1):
        if is_listable_company(doc, admin_keys):
            yield doc


async def company_metrics() -> dict:
    job_counts = await open_jobs_count_map()
    total = verified = active = hiring = 0
    async for doc in _iter_listable_companies():
        total += 1
        st = str(doc.get("status") or "active").lower()
        if _is_verified(doc):
            verified += 1
        if st == "active":
            active += 1
        cid = str(doc.get("_id") or "")
        if job_counts.get(cid, 0) > 0:
            hiring += 1
    total_jobs = await jobs_collection.count_documents({})
    return {
        "total": total,
        "verified": verified,
        "active": active,
        "hiring": hiring,
        "totalJobsPosted": total_jobs,
    }


async def list_company_rows(
    status: str = "",
    industry: str = "",
    size: str = "",
    q: str = "",
) -> List[dict]:
    job_map = await open_jobs_count_map()
    rows: List[dict] = []
    needle = q.strip().lower()
    status_f = status.strip().lower()
    industry_f = industry.strip().lower()
    size_f = size.strip().lower()
    async for doc in _iter_listable_companies():
        if status_f and status_f != "all":
            if status_f == "verified":
                if not _is_verified(doc):
                    continue
            elif str(doc.get("status") or "").lower() != status_f:
                continue
        if industry_f and industry_f != "all" and industry_f not in str(doc.get("industry") or "").lower():
            continue
        if size_f and size_f != "all" and size_f not in str(doc.get("size") or "").lower():
            continue
        if needle:
            blob = " ".join(
                [
                    str(doc.get("name") or ""),
                    str(doc.get("industry") or ""),
                    str(doc.get("location") or ""),
                ]
            ).lower()
            if needle not in blob:
                continue
        cid = str(doc.get("_id") or "")
        rows.append(company_to_row(doc, job_map.get(cid, 0)))
    return rows


async def widget_rows(limit: int, pending_only: bool = False) -> List[dict]:
    job_map = await open_jobs_count_map()
    rows: List[dict] = []
    async for doc in _iter_listable_companies():
        st = str(doc.get("status") or "").lower()
        if pending_only and st != "pending":
            continue
        cid = str(doc.get("_id") or "")
        rows.append(company_to_row(doc, job_map.get(cid, 0)))
        if len(rows) >= limit:
            break
    return rows
