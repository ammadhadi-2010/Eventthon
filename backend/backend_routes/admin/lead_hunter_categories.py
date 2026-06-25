"""Lead Hunter — platform category catalogue (matches frontend serviceCatalog)."""

from __future__ import annotations

from database import gigs_collection, hub_projects_collection, jobs_collection

PRIMARY_PLATFORM_CATEGORIES = [
    "Web Development",
    "AI & Automation",
    "SEO & Marketing",
    "Design & Creative",
    "Writing & Content",
    "Video & Animation",
    "Mobile Development",
    "Business",
    "E-commerce",
    "Social Media",
    "Data Science",
    "Cybersecurity",
    "Cloud & DevOps",
    "Product Management",
    "Sales",
    "Customer Support",
    "Accounting & Finance",
    "Legal Services",
    "Architecture",
    "Translation",
    "Music & Audio",
    "Game Development",
    "Virtual Assistant",
    "Education & Tutoring",
]


async def _distinct_categories(collection, field: str = "category") -> list[str]:
    try:
        rows = await collection.distinct(field)
    except Exception:
        return []
    out: list[str] = []
    for row in rows:
        label = str(row or "").strip()
        if label and label not in out:
            out.append(label)
    return out


async def list_platform_categories() -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for label in PRIMARY_PLATFORM_CATEGORIES:
        if label not in seen:
            seen.add(label)
            merged.append(label)
    for bucket in (
        await _distinct_categories(gigs_collection),
        await _distinct_categories(jobs_collection),
        await _distinct_categories(hub_projects_collection),
    ):
        for label in sorted(bucket, key=str.lower):
            if label not in seen:
                seen.add(label)
                merged.append(label)
    return merged
