"""Lead Hunter — MongoDB persistence for verified outreach rows."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from database import lead_hunter_leads_collection


async def save_verified_leads(
    *,
    source_url: str,
    country: str,
    city: str,
    category: str,
    rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if not rows:
        return []
    now = datetime.now(timezone.utc)
    docs: list[dict[str, Any]] = []
    for row in rows:
        lead_id = f"lead-{uuid.uuid4().hex[:10]}"
        doc = {
            "_id": lead_id,
            "id": lead_id,
            "company": row.get("company") or "Partner",
            "contact_name": row.get("contact_name") or f"{row.get('company', 'Partner')} Team",
            "email": row["email"],
            "website": row.get("website") or source_url,
            "category": category or row.get("category") or "General",
            "city": city,
            "country": country,
            "confidence": float(row.get("confidence") or 0.82),
            "source_url": source_url,
            "page_url": row.get("page_url") or source_url,
            "verified_domain": row.get("verified_domain") or "",
            "created_at": now,
            "status": "new",
        }
        docs.append(doc)
    await lead_hunter_leads_collection.insert_many(docs)
    return [{k: v for k, v in d.items() if k != "_id"} for d in docs]
