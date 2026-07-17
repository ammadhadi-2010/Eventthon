"""Lead Hunter — scrape pipeline: filter links, verify emails, build lead rows."""

from __future__ import annotations

import asyncio
import uuid
from typing import Any
from urllib.parse import urlparse

from .lead_hunter_fetch import safe_fetch
from .lead_hunter_parser import (
    company_from_domain,
    company_from_html,
    contact_page_urls,
    extract_verified_emails,
    filter_scrape_links,
    registrable_domain,
    _host,
)
from .lead_hunter_store import save_verified_leads

EVENTTHON_FROM_NAME = "EventThon Support"
EVENTTHON_FROM_EMAIL = "eventthon@gmail.com"
EVENTTHON_REPLY_TO = "eventthon@gmail.com"
MAX_PAGES = 8


def _normalize_source(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    return raw if "://" in raw else f"https://{raw}"


def _build_scan_urls(source: str, main_html: str) -> list[str]:
    pages = contact_page_urls(source)
    for link in filter_scrape_links(source, main_html):
        if link not in pages:
            pages.append(link)
    return pages[:MAX_PAGES]


async def run_lead_extract(
    *,
    country: str,
    city: str,
    category: str,
    website_url: str,
) -> dict[str, Any]:
    source = _normalize_source(website_url)
    if not source:
        return {"error": "Website link is required for Quick Hunter"}

    base_domain = registrable_domain(_host(source))
    if not base_domain:
        return {"error": "Could not parse a valid website domain"}

    main_html = await asyncio.to_thread(safe_fetch, source)
    if not main_html:
        return {"error": "Could not fetch the target website — check the URL and try again"}

    allowed = {base_domain}
    pages = _build_scan_urls(source, main_html)
    email_map: dict[str, str] = {}

    for page_url in pages:
        html = main_html if page_url.rstrip("/") == source.rstrip("/") else await asyncio.to_thread(safe_fetch, page_url)
        if not html:
            continue
        for email in extract_verified_emails(html, allowed):
            email_map.setdefault(email, page_url)

    if not email_map:
        return {
            "error": (
                "No verified emails found on this domain after scanning home, contact, about, and services pages."
            )
        }

    company = company_from_html(main_html, base_domain)
    host = urlparse(source).netloc.replace("www.", "")
    raw_rows: list[dict[str, Any]] = []
    for email, page_url in email_map.items():
        domain = email.rsplit("@", 1)[-1]
        raw_rows.append(
            {
                "id": f"lead-{uuid.uuid4().hex[:10]}",
                "company": company,
                "contact_name": f"{company} Team",
                "email": email,
                "website": source,
                "page_url": page_url,
                "verified_domain": domain,
                "category": category.strip() or "General",
                "city": city.strip(),
                "country": country.strip(),
                "confidence": 0.92 if page_url.rstrip("/") == source.rstrip("/") else 0.86,
            }
        )

    leads = await save_verified_leads(
        source_url=source,
        country=country.strip(),
        city=city.strip(),
        category=category.strip() or "General",
        rows=raw_rows,
    )

    discovery_rows = [
        {
            "id": lead["id"],
            "business_name": lead.get("company") or company,
            "website_url": lead.get("website") or source,
            "email": lead.get("email") or "",
            "domain": lead.get("verified_domain") or base_domain,
            "source": "extract",
        }
        for lead in leads
    ]

    return {
        "status": "success",
        "source": source,
        "domain": host or base_domain,
        "leads": leads,
        "discovery_rows": discovery_rows,
        "branding": {
            "from_name": EVENTTHON_FROM_NAME,
            "from_email": EVENTTHON_FROM_EMAIL,
            "reply_to": EVENTTHON_REPLY_TO,
        },
        "message": f"Saved {len(leads)} verified outreach lead(s) to EventThon Network.",
    }
