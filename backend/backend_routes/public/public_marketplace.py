"""Marketplace payload builders for public gig & job showrooms."""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from .public_marketplace_defaults import (
    APPLICATION_FLOW_STEPS,
    BOARD_TRUST_BADGES,
    DEFAULT_FUNCTIONAL_REQUIREMENTS,
    DEFAULT_SELLER_PROFILE,
    GIG_DELIVERABLES,
    GIG_TRUST_BADGES,
    JOB_BOARD_FILTERS,
    JOB_BOARD_STATS,
    REMOTE_BENEFIT_TAGS,
    build_gig_packages,
    build_gig_reviews,
)
from .public_sanitize import sanitize_text, slugify


def parse_compensation_band(salary_range: str, fallback: Optional[dict] = None) -> dict:
    label = sanitize_text(salary_range or "Competitive", 60)
    fb = fallback or {"min": 90, "max": 160}
    match = re.search(r"(\d+)\s*k?\s*[-–]\s*\$?\s*(\d+)", label, re.I)
    if match:
        return {"min": int(match.group(1)), "max": int(match.group(2)), "label": label}
    return {"min": fb.get("min", 90), "max": fb.get("max", 160), "label": label}


def _is_seo_gig(gig: dict) -> bool:
    blob = f"{gig.get('category', '')} {gig.get('title', '')}".lower()
    return "seo" in blob


def _tier_features(raw: Any) -> List[str]:
    if isinstance(raw, list):
        return [sanitize_text(item, 120) for item in raw if str(item).strip()][:12]
    if isinstance(raw, str) and raw.strip():
        return [sanitize_text(line, 120) for line in raw.splitlines() if line.strip()][:12]
    return []


def packages_from_pricing_tiers(gig: dict) -> Optional[list]:
    pricing = gig.get("pricing") if isinstance(gig.get("pricing"), dict) else {}
    tiers = pricing.get("pricing_tiers")
    if not isinstance(tiers, dict) or not tiers:
        return None
    fallback_days = int(pricing.get("delivery_days") or gig.get("delivery_days") or 5)
    fallback_revisions = int(pricing.get("revisions_included") or 1)
    rows = []
    for tier_id, label in (("basic", "Basic"), ("standard", "Standard"), ("premium", "Premium")):
        row = tiers.get(tier_id)
        if not isinstance(row, dict):
            continue
        features = _tier_features(row.get("features") or pricing.get("package_features"))
        rows.append(
            {
                "id": tier_id,
                "name": label,
                "price": int(float(row.get("price") or 0)),
                "description": sanitize_text(
                    row.get("description") or f"{label} package with scoped deliverables.",
                    160,
                ),
                "deliveryDays": int(row.get("deliveryDays") or row.get("delivery_days") or fallback_days),
                "revisions": int(row.get("revisions") or fallback_revisions),
                "popular": tier_id == "standard",
                "features": features or [f"{label} deliverables"],
            }
        )
    return rows or None


def marketplace_gig_extras(gig: dict, seller_name: str) -> dict:
    pricing = gig.get("pricing") if isinstance(gig.get("pricing"), dict) else {}
    days = int(pricing.get("delivery_days") or gig.get("delivery_days") or 5)
    base = float(gig.get("starting_price") or 120)
    packages = gig.get("packages") if isinstance(gig.get("packages"), list) and gig.get("packages") else None
    if not packages:
        packages = packages_from_pricing_tiers(gig)
    if not packages:
        packages = build_gig_packages(base, days, _is_seo_gig(gig))
    reviews = gig.get("reviews") if isinstance(gig.get("reviews"), list) and gig.get("reviews") else None
    if not reviews:
        reviews = build_gig_reviews(seller_name)
    seller_profile = gig.get("seller_profile") if isinstance(gig.get("seller_profile"), dict) else {}
    profile = {**DEFAULT_SELLER_PROFILE, **seller_profile}
    if seller_name and seller_name != "Creator":
        profile["displayName"] = seller_name
    return {
        "packages": packages,
        "reviews": reviews,
        "deliverables": gig.get("deliverables") or GIG_DELIVERABLES,
        "trustBadges": GIG_TRUST_BADGES,
        "sellerProfile": profile,
        "breadcrumbCategory": sanitize_text(gig.get("category") or "Marketplace", 80),
    }


def _gig_cover_url(gig: dict) -> str:
    from .public_sanitize import _resolve_media_url

    for item in gig.get("gallery") or []:
        url = item if isinstance(item, str) else (item.get("url") if isinstance(item, dict) else None)
        resolved = _resolve_media_url(url) if url else None
        if resolved:
            return resolved
    preview = str(gig.get("cover_preview") or gig.get("thumbnail") or gig.get("live_preview_url") or "").strip()
    if preview.startswith("http"):
        return preview
    return _resolve_media_url(preview) or ""


def related_gig_card(gig: dict) -> dict:
    title = sanitize_text(gig.get("title") or "Gig", 140)
    slug = gig.get("public_slug") or slugify(title)
    price = float(gig.get("starting_price") or 0)
    seller = gig.get("seller_profile") if isinstance(gig.get("seller_profile"), dict) else {}
    cover = _gig_cover_url(gig)
    return {
        "title": title,
        "publicSlug": slug,
        "startingPrice": price,
        "sellerName": seller.get("displayName") or DEFAULT_SELLER_PROFILE["displayName"],
        "rating": float(gig.get("rating") or 4.9),
        "publicPath": f"/public/gigs/{slug}",
        "imageurl": cover,
    }


def marketplace_job_extras(doc: dict) -> dict:
    band_doc = doc.get("compensation_band") if isinstance(doc.get("compensation_band"), dict) else {}
    salary = doc.get("salary_range") or doc.get("salary") or "Competitive"
    band = parse_compensation_band(str(salary), band_doc)
    func_req = doc.get("functional_requirements") or DEFAULT_FUNCTIONAL_REQUIREMENTS
    remote_tags = doc.get("remote_benefits") or REMOTE_BENEFIT_TAGS
    return {
        "companyName": sanitize_text(doc.get("company_name") or "EventThon Global", 80),
        "companyColor": str(doc.get("company_color") or "#6366f1")[:20],
        "employmentType": sanitize_text(doc.get("employment_type") or "Full-time", 40),
        "location": sanitize_text(doc.get("location") or ("Fully Remote" if doc.get("remote", True) else "Hybrid"), 80),
        "postedAgo": sanitize_text(doc.get("posted_ago") or "Recently", 30),
        "functionalRequirements": [sanitize_text(r, 240) for r in func_req if r][:8],
        "remoteBenefits": [sanitize_text(t, 60) for t in remote_tags if t][:8],
        "applicationFlow": doc.get("application_flow") or APPLICATION_FLOW_STEPS,
        "compensationBand": band,
    }


def public_job_listing_card(doc: dict) -> dict:
    slug = doc.get("public_slug") or slugify(doc.get("title") or "job")
    jid = str(doc.get("_id") or "")
    extras = marketplace_job_extras(doc)
    tags = [str(t).strip() for t in (doc.get("skills_tags") or doc.get("tags") or []) if str(t).strip()][:6]
    return {
        "jobId": jid,
        "publicSlug": slug,
        "title": sanitize_text(doc.get("title") or "Role", 140),
        "entityId": jid,
        "publicPath": f"/public/jobs/{slug}",
        "companyName": extras["companyName"],
        "companyColor": extras["companyColor"],
        "postedAgo": extras["postedAgo"],
        "salary": extras["compensationBand"]["label"],
        "location": extras["location"],
        "employmentType": extras["employmentType"],
        "skills": tags,
        "remote": bool(doc.get("remote", True)),
        "category": sanitize_text(doc.get("category") or "General", 60),
    }


def public_jobs_board_payload(jobs: List[dict]) -> dict:
    cards = [public_job_listing_card(j) for j in jobs]
    return {
        "stats": JOB_BOARD_STATS,
        "filters": JOB_BOARD_FILTERS,
        "trustBadges": BOARD_TRUST_BADGES,
        "remoteBenefits": REMOTE_BENEFIT_TAGS,
        "applicationFlow": APPLICATION_FLOW_STEPS,
        "summary": {"jobsFound": len(cards), "avgSalary": JOB_BOARD_STATS[3]["value"]},
        "jobs": cards,
    }
