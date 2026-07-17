"""Lead Hunter — localized discovery orchestration."""

from __future__ import annotations

import asyncio
import re
from typing import Any

from database import companies_collection

from .lead_hunter_search_config import build_localized_queries, localized_google_host
from .lead_hunter_search_scrape import (
    RESULT_LIMIT,
    dedupe_rows,
    free_search_sync,
    row_from_url,
)

async def _platform_search(country: str, category: str) -> list[dict[str, Any]]:
    clauses: list[dict[str, Any]] = [{"website": {"$exists": True, "$nin": [None, ""]}}]
    if category:
        cat_rx = re.escape(category.strip())
        clauses.append(
            {
                "$or": [
                    {"industry": {"$regex": cat_rx, "$options": "i"}},
                    {"name": {"$regex": cat_rx, "$options": "i"}},
                    {"tagline": {"$regex": cat_rx, "$options": "i"}},
                ]
            }
        )
    if country:
        clauses.append({"country": {"$regex": re.escape(country.strip()), "$options": "i"}})

    query: dict[str, Any] = {"$and": clauses} if len(clauses) > 1 else clauses[0]
    docs = await companies_collection.find(query, {"name": 1, "website": 1}).limit(12).to_list(12)

    rows: list[dict[str, Any]] = []
    for doc in docs:
        parsed = row_from_url(str(doc.get("website") or ""), "platform")
        if parsed:
            parsed["business_name"] = str(doc.get("name") or parsed["business_name"])[:160]
            rows.append(parsed)
    return rows


async def run_google_lead_search(
    *,
    country: str,
    category: str,
    country_code: str = "",
) -> dict[str, Any]:
    country = str(country or "").strip()
    category = str(category or "").strip()
    if not country:
        return {"error": "Country is required for lead search"}
    if not category:
        return {"error": "Target category is required for lead search"}

    queries = build_localized_queries(country, category, country_code)
    google_host = localized_google_host(country_code)
    web_rows = await asyncio.to_thread(free_search_sync, queries, google_host)
    platform_rows = await _platform_search(country, category)
    links = dedupe_rows(web_rows + platform_rows)[:RESULT_LIMIT]

    if not links:
        return {
            "error": (
                f"No localized businesses found for '{category} in {country}'. "
                "Try another category or country."
            )
        }

    return {
        "status": "success",
        "query": queries[0],
        "google_host": google_host,
        "links": links,
        "message": f"Discovered {len(links)} localized {category} lead(s) in {country}.",
    }
