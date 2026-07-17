"""Lead Hunter — free web search scrapers for localized discovery."""

from __future__ import annotations

import base64
import uuid
from typing import Any
from urllib.parse import parse_qs, urlparse

import requests
from bs4 import BeautifulSoup
from googlesearch import search as google_search

from .lead_hunter_parser import _host, company_from_domain, is_junk_url, registrable_domain

USER_AGENT = "Mozilla/5.0 (compatible; EventThon-LeadHunter/1.1)"
RESULT_LIMIT = 15

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
    "yelp.",
    "tripadvisor.",
)


def _normalize_website(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    return raw if "://" in raw else f"https://{raw}"


def _discovery_junk(host: str) -> bool:
    low = (host or "").lower()
    return any(token in low for token in _DISCOVERY_JUNK)


def row_from_url(url: str, source: str) -> dict[str, Any] | None:
    site = _normalize_website(url)
    if not site or is_junk_url(site):
        return None
    domain = registrable_domain(_host(site))
    if not domain or _discovery_junk(domain):
        return None
    return {
        "id": f"disc-{uuid.uuid4().hex[:10]}",
        "business_name": company_from_domain(domain)[:160],
        "website_url": site,
        "domain": domain,
        "email": "",
        "source": source,
    }


def dedupe_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for row in rows:
        domain = str(row.get("domain") or registrable_domain(_host(row.get("website_url", ""))))
        if not domain or domain in seen:
            continue
        seen.add(domain)
        out.append(row)
    return out


def _extract_google_hrefs(html: str) -> list[str]:
    soup = BeautifulSoup(html or "", "html.parser")
    urls: list[str] = []
    for anchor in soup.select("a[href]"):
        href = str(anchor.get("href") or "").strip()
        if href.startswith("/url?"):
            target = parse_qs(urlparse(href).query).get("q", [""])[0]
            if target.startswith("http"):
                urls.append(target)
        elif href.startswith("http") and "google." not in href:
            urls.append(href)
    return urls


def localized_google_scrape(query: str, google_host: str) -> list[str]:
    urls: list[str] = []
    try:
        resp = requests.get(
            f"https://www.{google_host}/search",
            params={"q": query, "hl": "en", "num": str(RESULT_LIMIT)},
            headers={"User-Agent": USER_AGENT, "Accept-Language": "en"},
            timeout=18,
        )
        resp.raise_for_status()
        urls.extend(_extract_google_hrefs(resp.text))
    except requests.RequestException:
        return []
    return urls[:RESULT_LIMIT]


def google_library_scrape(query: str) -> list[str]:
    urls: list[str] = []
    try:
        for url in google_search(query, num_results=RESULT_LIMIT, sleep_interval=1.0, timeout=12, lang="en"):
            if url:
                urls.append(str(url))
            if len(urls) >= RESULT_LIMIT:
                break
    except Exception:
        return []
    return urls


def duckduckgo_scrape(query: str) -> list[str]:
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
    except requests.RequestException:
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


def bing_scrape(query: str) -> list[str]:
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
    except requests.RequestException:
        return []
    return urls[:RESULT_LIMIT]


def free_search_sync(queries: list[str], google_host: str) -> list[dict[str, Any]]:
    raw_urls: list[str] = []
    for query in queries:
        raw_urls.extend(localized_google_scrape(query, google_host))
        raw_urls.extend(google_library_scrape(query))
        raw_urls.extend(duckduckgo_scrape(query))
    if queries:
        raw_urls.extend(bing_scrape(queries[0]))

    seen_urls: set[str] = set()
    rows: list[dict[str, Any]] = []
    for url in raw_urls:
        key = url.strip().lower()
        if not key or key in seen_urls:
            continue
        seen_urls.add(key)
        parsed = row_from_url(url, "web-search")
        if parsed:
            rows.append(parsed)
        if len(rows) >= RESULT_LIMIT:
            break
    return dedupe_rows(rows)
