"""Lead Hunter — scrape pipeline: filter links, verify emails, build lead rows."""

from __future__ import annotations

import asyncio
import uuid
from typing import Any
from urllib.parse import urlparse

from .lead_hunter_fetch import safe_fetch
from .lead_hunter_parser import (
    company_from_domain,
    extract_verified_emails,
    filter_scrape_links,
    registrable_domain,
    _host,
)
from .lead_hunter_store import save_verified_leads

EVENTTHON_FROM_NAME = "EventThon Network"
EVENTTHON_FROM_EMAIL = "outreach@eventthon.network"
EVENTTHON_REPLY_TO = "support@eventthon.network"


def _normalize_source(url: str) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    return raw if "://" in raw else f"https://{raw}"


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
    pages = filter_scrape_links(source, main_html)
    html_chunks = [main_html]
    for page_url in pages[1:4]:
        html = await asyncio.to_thread(safe_fetch, page_url)
        if html:
            html_chunks.append(html)

    email_map: dict[str, str] = {}
    for chunk, page_url in zip(html_chunks, pages[: len(html_chunks)]):
        for email in extract_verified_emails(chunk, allowed):
            email_map.setdefault(email, page_url)

    if not email_map:
        return {
            "error": (
                "No outreach-ready emails found on this domain. "
                "Only verified domain-matched contact addresses are saved."
            )
        }

    raw_rows: list[dict[str, Any]] = []
    host = urlparse(source).netloc.replace("www.", "")
    company = company_from_domain(base_domain)
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
                "confidence": 0.88 if page_url == source else 0.82,
            }
        )

    leads = await save_verified_leads(
        source_url=source,
        country=country.strip(),
        city=city.strip(),
        category=category.strip() or "General",
        rows=raw_rows,
    )

    return {
        "status": "success",
        "source": source,
        "domain": host or base_domain,
        "leads": leads,
        "branding": {
            "from_name": EVENTTHON_FROM_NAME,
            "from_email": EVENTTHON_FROM_EMAIL,
            "reply_to": EVENTTHON_REPLY_TO,
        },
        "message": f"Saved {len(leads)} verified outreach lead(s) to EventThon Network.",
    }
