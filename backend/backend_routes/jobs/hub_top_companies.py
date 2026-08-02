"""Aggregate hiring companies from public job listings."""
from __future__ import annotations

from typing import List

from backend_routes.admin.job_company_link import company_snapshot_for_job

from .hub_listings import fetch_public_job_docs, job_doc_to_listing_card


async def list_top_companies(limit: int = 24) -> List[dict]:
    docs = await fetch_public_job_docs(limit=200)
    buckets: dict = {}

    for doc in docs:
        kind = str(doc.get("listing_kind") or "company").strip().lower()
        if kind == "opportunity":
            continue
        card = job_doc_to_listing_card(doc)
        name = str(card.get("company") or "").strip()
        if not name or name.lower() in {"company", "community opportunity"}:
            continue
        cid = str(card.get("companyId") or "").strip()
        key = cid or name.lower()
        row = buckets.get(key)
        if not row:
            buckets[key] = {
                "id": key,
                "companyId": cid,
                "name": name,
                "imageurl": str(card.get("imageurl") or "").strip(),
                "logoText": str(card.get("logoText") or name[:1]).upper(),
                "logoClass": str(card.get("logoClass") or name.split()[0].lower())[:12],
                "jobsCount": 1,
                "industry": str(card.get("category") or "Hiring").strip() or "Hiring",
            }
        else:
            row["jobsCount"] += 1
            if not row.get("imageurl") and card.get("imageurl"):
                row["imageurl"] = card["imageurl"]

    rows = sorted(buckets.values(), key=lambda r: (-r["jobsCount"], r["name"].lower()))
    snap_cache: dict = {}
    out: List[dict] = []
    for row in rows[: max(1, min(limit, 40))]:
        n = int(row["jobsCount"] or 0)
        row["jobsLabel"] = f"{n} Job" if n == 1 else f"{n} Jobs"
        cid = str(row.get("companyId") or "").strip()
        if cid and not row.get("imageurl"):
            if cid not in snap_cache:
                snap_cache[cid] = await company_snapshot_for_job(cid)
            snap = snap_cache.get(cid) or {}
            if snap.get("imageurl"):
                row["imageurl"] = snap["imageurl"]
            if snap.get("company_name"):
                row["name"] = snap["company_name"]
        out.append(row)
    return out
