"""Lead Hunter — free web search discovery (no API keys)."""

from __future__ import annotations

import asyncio
import base64
import re
import uuid
from typing import Any

import requests
from bs4 import BeautifulSoup
from database import companies_collection
from googlesearch import search as google_search

from .lead_hunter_parser import _host, company_from_domain, is_junk_url, registrable_domain

USER_AGENT = "Mozilla/5.0"
RESULT_LIMIT = 15

_COUNTRY_TLD = {
    "AE": "ae",
    "SA": "sa",
    "PK": "pk",
    "IN": "in",
    "GB": "uk",
    "AU": "au",
    "CA": "ca",
    "DE": "de",
    "FR": "fr",
    "IT": "it",
    "ES": "es",
    "NL": "nl",
    "SG": "sg",
    "MY": "my",
    "QA": "qa",
    "KW": "kw",
    "BH": "bh",
    "OM": "om",
    "EG": "eg",
    "NG": "ng",
    "ZA": "za",
    "BR": "br",
    "MX": "mx",
}


def _build_queries(country: str, category: str, country_code: str = "") -> list[str]:
    category = category.strip()
    country = country.strip()
    queries = [f'"{category}" companies in {country} website contact email']
    tld = _COUNTRY_TLD.get((country_code or "").upper())
    if tld:
        queries.insert(0, f"site:.{tld} {category} company contact email")
    return queries


def _normalize_website(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    return raw if "://" in raw else f"https://{raw}"


_DISCOVERY_JUNK = (
    "google.",
    "wikipedia.",
    "whatsapp.",
    "facebook.",
    "linkedin.",
    "youtube.",
    "twitter.",
    "bing.",
    "microsoft.",
    "apple.com",
    "amazon.",
    "gov.",
    ".gov",
    "web.de",
)


def _discovery_junk(host: str) -> bool:
    low = (host or "").lower()
    return any(token in low for token in _DISCOVERY_JUNK)


def _row_from_url(url: str, source: str) -> dict[str, Any] | None:
    site = _normalize_website(url)
    if not site or is_junk_url(site):
        return None
    domain = registrable_domain(_host(site))
    if not domain or _discovery_junk(domain):
        return None
    label = company_from_domain(domain)
    return {
        "id": f"disc-{uuid.uuid4().hex[:10]}",
        "business_name": label[:160],
        "website_url": site,
        "domain": domain,
        "source": source,
    }


def _dedupe_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for row in rows:
        domain = str(row.get("domain") or registrable_domain(_host(row.get("website_url", ""))))
        if not domain or domain in seen:
            continue
        seen.add(domain)
        out.append(row)
    return out


def _google_scrape_sync(query: str) -> list[str]:
    urls: list[str] = []
    try:
        for url in google_search(
            query,
            num_results=RESULT_LIMIT,
            sleep_interval=1.2,
            timeout=12,
            lang="en",
        ):
            if url:
                urls.append(str(url))
            if len(urls) >= RESULT_LIMIT:
                break
    except Exception:
        return []
    return urls


def _duckduckgo_scrape_sync(query: str) -> list[str]:
    urls: list[str] = []
    try:
        resp = requests.post(
            "https://lite.duckduckgo.com/lite/",
            data={"q": query},
            headers={"User-Agent": USER_AGENT},
            timeout=18,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for anchor in soup.find_all("a", class_="result-link"):
            href = str(anchor.get("href") or "").strip()
            if href.startswith("http"):
                urls.append(href)
    except (requests.RequestException, ValueError):
        return []
    return urls[:RESULT_LIMIT]


def _unwrap_redirect(url: str) -> str:
    href = str(url or "").strip()
    if "u=a1" in href:
        try:
            token = href.split("u=a1", 1)[1].split("&", 1)[0]
            pad = "=" * (-len(token) % 4)
            return base64.b64decode(token + pad).decode("utf-8", errors="ignore")
        except (ValueError, IndexError):
            return ""
    if href.startswith("http") and "bing.com" not in href:
        return href
    return ""


def _bing_scrape_sync(query: str) -> list[str]:
    urls: list[str] = []
    try:
        resp = requests.get(
            "https://www.bing.com/search",
            params={"q": query, "count": str(RESULT_LIMIT)},
            headers={"User-Agent": USER_AGENT},
            timeout=18,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for anchor in soup.select("li.b_algo h2 a"):
            target = _unwrap_redirect(str(anchor.get("href") or ""))
            if target.startswith("http"):
                urls.append(target)
    except (requests.RequestException, ValueError):
        return []
    return urls[:RESULT_LIMIT]


def _free_search_sync(queries: list[str]) -> list[dict[str, Any]]:
    raw_urls: list[str] = []
    for query in queries:
        raw_urls.extend(_google_scrape_sync(query))
        raw_urls.extend(_duckduckgo_scrape_sync(query))
    if queries:
        raw_urls.extend(_bing_scrape_sync(queries[-1]))

    seen_urls: set[str] = set()
    rows: list[dict[str, Any]] = []
    for url in raw_urls:
        key = url.strip().lower()
        if not key or key in seen_urls:
            continue
        seen_urls.add(key)
        parsed = _row_from_url(url, "web-search")
        if parsed:
            rows.append(parsed)
        if len(rows) >= RESULT_LIMIT:
            break
    return _dedupe_rows(rows)


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
        parsed = _row_from_url(str(doc.get("website") or ""), "platform")
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

    queries = _build_queries(country, category, country_code)
    web_rows = await asyncio.to_thread(_free_search_sync, queries)
    platform_rows = await _platform_search(country, category)
    links = _dedupe_rows(web_rows + platform_rows)[:RESULT_LIMIT]

    if not links:
        return {
            "error": (
                "No outreach-ready website links found for this country and category. "
                "Try a different category or country."
            )
        }

    return {
        "status": "success",
        "query": queries[0],
        "links": links,
        "message": f"Discovered {len(links)} country-wide {category} lead(s) via free web search.",
    }
