"""Multi-filter job search for the Jobs hub."""
from __future__ import annotations

from typing import List, Optional

from backend_routes.admin.job_company_link import company_snapshot_for_job
from .hub_listings import fetch_public_job_docs, job_doc_to_listing_card, job_matches_filters


async def _card_with_company_logo(doc: dict, cache: dict) -> dict:
    card = job_doc_to_listing_card(doc)
    if card.get("imageurl"):
        return card
    cid = str(doc.get("company_id") or "").strip()
    if cid:
        if cid not in cache:
            cache[cid] = await company_snapshot_for_job(cid)
        snap = cache.get(cid)
        if snap and snap.get("imageurl"):
            card["imageurl"] = snap["imageurl"]
            if snap.get("company_name"):
                card["company"] = snap["company_name"]
                card["logoText"] = (snap["company_name"][:1] or "J").upper()
            return card

    # Opportunity / no company logo — use poster profile image when available
    poster = str(doc.get("posted_by") or "").strip()
    if poster and str(card.get("listingKind") or "") == "opportunity":
        cache_key = f"user:{poster}"
        if cache_key not in cache:
            from database import user_collection

            user = await user_collection.find_one(
                {"$or": [{"user_id": poster}, {"mobile": poster}, {"email": poster.lower()}]}
            )
            cache[cache_key] = user
        user = cache.get(cache_key)
        if user:
            avatar = str(
                user.get("imageurl")
                or user.get("profile_image_url")
                or user.get("avatar")
                or ""
            ).strip()
            if avatar:
                card["imageurl"] = avatar
    return card


async def search_hub_jobs(
    q: str = "",
    category: str = "",
    experience_level: str = "",
    job_type: str = "",
    listing_kind: str = "",
    company: str = "",
    location: str = "",
    work_mode: str = "",
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    limit: int = 50,
) -> List[dict]:
    docs = await fetch_public_job_docs(limit=80)
    rows: List[dict] = []
    company_cache: dict = {}
    for doc in docs:
        if not job_matches_filters(
            doc,
            q=q,
            category=category,
            experience_level=experience_level,
            job_type=job_type,
            listing_kind=listing_kind,
            company=company,
            location=location,
            work_mode=work_mode,
            salary_min=salary_min,
            salary_max=salary_max,
        ):
            continue
        rows.append(await _card_with_company_logo(doc, company_cache))
        if len(rows) >= limit:
            break
    return rows
