"""Footer resource CMS — MongoDB CRUD."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import HTTPException

from database import footer_resources_collection

from .footer_schemas import (
    SIDEBAR_SORT_CATEGORIES,
    FooterResourceCreate,
    FooterResourceUpdate,
    footer_block_for,
    slug_from_title,
)

_TEXT_KEYS = (
    "content",
    "imageurl",
    "videourl",
    "excerpt",
    "readTime",
    "authorName",
    "authorAvatarUrl",
    "externalUrl",
    "pricingLabel",
    "pricingPrice",
    "pricingFeatures",
    "contactEmail",
    "contactPhone",
    "contactLocation",
    "contactHours",
    "jobTitle",
    "jobLocation",
    "policyVersion",
    "aboutJourney",
    "aboutTeam",
    "aboutFeedJourney",
    "aboutFeedTeam",
)


def _bare_eventthon_role(raw: str) -> str:
    text = str(raw or "").strip()
    return re.sub(r"\s*@\s*eventthon\s*$", "", text, flags=re.IGNORECASE).strip()


def _normalize_careers_payload_dict(
    data: dict[str, Any],
    category: str | None = None,
    *,
    apply_defaults: bool = False,
) -> dict[str, Any]:
    """Keep Careers rows aligned with public /company/careers (EventThon hiring only)."""
    cat = str(category or data.get("category") or "").strip()
    if cat != "Careers":
        return data
    out = dict(data)
    if "jobTitle" in out or "title" in out or apply_defaults:
        role = _bare_eventthon_role(str(out.get("jobTitle") or out.get("title") or ""))
        if role:
            out["jobTitle"] = role
            out["title"] = role
    if apply_defaults or "jobLocation" in out:
        location = str(out.get("jobLocation") or "").strip()
        out["jobLocation"] = location or "Remote · Worldwide"
    if apply_defaults or "excerpt" in out:
        dept = str(out.get("excerpt") or "").strip()
        out["excerpt"] = dept or "Engineering"
    return out


def _normalize_cms_payload_dict(
    data: dict[str, Any],
    category: str | None = None,
    *,
    apply_defaults: bool = False,
) -> dict[str, Any]:
    """Category-specific cleanup for Docs, Guides, Privacy, and Terms."""
    cat = str(category or data.get("category") or "").strip()
    out = dict(data)

    if cat == "Documentation":
        topic = slug_from_title(str(out.get("pricingLabel") or out.get("slug") or out.get("title") or ""))
        if topic:
            out["pricingLabel"] = topic
        if apply_defaults and not str(out.get("title") or "").strip():
            out["title"] = topic.replace("-", " ").title() if topic else "Documentation"

    elif cat == "Guides":
        category_id = slug_from_title(str(out.get("pricingLabel") or "getting-started"))
        out["pricingLabel"] = category_id or "getting-started"
        icon = str(out.get("jobTitle") or "").strip().lower()
        if apply_defaults or "jobTitle" in out:
            out["jobTitle"] = icon or "book"
        if apply_defaults or "pricingPrice" in out:
            steps = str(out.get("pricingPrice") or "").strip()
            out["pricingPrice"] = steps or "5"
        if apply_defaults or "excerpt" in out:
            level = str(out.get("excerpt") or "").strip()
            out["excerpt"] = level or "Beginner"

    elif cat == "Tutorials":
        category_id = slug_from_title(str(out.get("pricingLabel") or "getting-started"))
        out["pricingLabel"] = category_id or "getting-started"
        if apply_defaults or "pricingPrice" in out:
            lessons = str(out.get("pricingPrice") or "").strip()
            out["pricingPrice"] = lessons or "3"
        if apply_defaults or "excerpt" in out:
            level = str(out.get("excerpt") or "").strip()
            out["excerpt"] = level or "Beginner"
        if apply_defaults or "readTime" in out:
            duration = str(out.get("readTime") or "").strip()
            out["readTime"] = duration or "10:00"

    elif cat == "Blog":
        category_id = slug_from_title(str(out.get("pricingLabel") or "platform-updates"))
        out["pricingLabel"] = category_id or "platform-updates"
        if apply_defaults or "excerpt" in out:
            label = str(out.get("excerpt") or "").strip()
            out["excerpt"] = label or "Platform Updates"
        if apply_defaults or "readTime" in out:
            read = str(out.get("readTime") or "").strip()
            out["readTime"] = read or "5 min read"
        if apply_defaults or "authorName" in out:
            author = str(out.get("authorName") or "").strip()
            out["authorName"] = author or "EventThon Team"

    elif cat == "Case Studies":
        category_id = slug_from_title(str(out.get("pricingLabel") or "business"))
        out["pricingLabel"] = category_id or "business"
        if apply_defaults or "excerpt" in out:
            label = str(out.get("excerpt") or "").strip()
            out["excerpt"] = label or "Business"
        if apply_defaults or "readTime" in out:
            read = str(out.get("readTime") or "").strip()
            out["readTime"] = read or "6 min read"
        if apply_defaults or "authorName" in out:
            author = str(out.get("authorName") or "").strip()
            out["authorName"] = author or "EventThon Team"

    elif cat == "Help Center":
        if apply_defaults and not str(out.get("title") or "").strip():
            out["title"] = "How can we help you?"
        if apply_defaults or "excerpt" in out:
            excerpt = str(out.get("excerpt") or "").strip()
            out["excerpt"] = excerpt or "Find answers for account, squads, gigs, wallet, and more."

    elif cat == "Community":
        if apply_defaults and not str(out.get("title") or "").strip():
            out["title"] = "Community"
        if apply_defaults or "excerpt" in out:
            excerpt = str(out.get("excerpt") or "").strip()
            out["excerpt"] = excerpt or "Connect, learn and grow with the EventThon community."
        if apply_defaults or "externalUrl" in out:
            url = str(out.get("externalUrl") or "").strip()
            out["externalUrl"] = url or "https://discord.com/invite/eventthon"

    elif cat == "Footer Brand":
        if apply_defaults and not str(out.get("title") or "").strip():
            out["title"] = "EventThon"
        if apply_defaults or "excerpt" in out:
            excerpt = str(out.get("excerpt") or "").strip()
            out["excerpt"] = excerpt or "Connect. Collaborate. Create Impact."

    elif cat in {"Privacy Policy", "Terms of Service"}:
        if apply_defaults or "policyVersion" in out:
            version = str(out.get("policyVersion") or "").strip()
            out["policyVersion"] = version or "May 24, 2026"
        if apply_defaults and not str(out.get("title") or "").strip():
            out["title"] = cat

    return out


def _slug_source_for(category: str, payload: dict[str, Any]) -> str:
    cat = str(category or "").strip()
    if cat == "Careers" and payload.get("jobTitle"):
        return str(payload["jobTitle"])
    if cat == "Documentation" and payload.get("pricingLabel"):
        return str(payload["pricingLabel"])
    if cat == "Guides":
        return str(payload.get("slug") or payload.get("title") or "")
    if cat == "Tutorials":
        return str(payload.get("slug") or payload.get("title") or "")
    if cat == "Blog":
        return str(payload.get("slug") or payload.get("title") or "")
    if cat == "Case Studies":
        return str(payload.get("slug") or payload.get("title") or "")
    if cat in {"Privacy Policy", "Terms of Service"}:
        return slug_from_title(cat)
    return str(payload.get("slug") or payload.get("title") or "")


def _serialize(doc: dict) -> dict:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    for key in ("created_at", "updated_at"):
        val = out.get(key)
        if isinstance(val, datetime):
            out[key] = val.isoformat()
    out.setdefault("aboutJourney", "[]")
    out.setdefault("aboutTeam", "[]")
    out.setdefault("aboutFeedJourney", "1")
    out.setdefault("aboutFeedTeam", "1")
    out.setdefault("contactLocation", "")
    out.setdefault("contactHours", "")
    out["footerBlock"] = footer_block_for(str(out.get("category") or ""))
    return out


async def _unique_slug(base: str, exclude_id: ObjectId | None = None) -> str:
    slug = slug_from_title(base)
    candidate = slug
    suffix = 2
    while True:
        query: dict[str, Any] = {"slug": candidate}
        if exclude_id:
            query["_id"] = {"$ne": exclude_id}
        exists = await footer_resources_collection.find_one(query)
        if not exists:
            return candidate
        candidate = f"{slug}-{suffix}"
        suffix += 1


def _base_doc(payload: FooterResourceCreate, slug: str, now: datetime) -> dict:
    doc = {
        "category": payload.category,
        "title": payload.title.strip(),
        "slug": slug,
        "footerBlock": footer_block_for(payload.category),
        "sidebarOrder": int(payload.sidebarOrder or 0),
        "created_at": now,
        "updated_at": now,
    }
    for key in _TEXT_KEYS:
        doc[key] = str(getattr(payload, key) or "").strip()
    return doc


def _sort_rows(rows: list[dict], category: str) -> list[dict]:
    cat = str(category or "").strip()
    if cat in SIDEBAR_SORT_CATEGORIES:
        return sorted(rows, key=lambda row: (row.get("sidebarOrder", 0), row.get("title", "")))
    return rows


async def get_footer_resources(category: str = "", footer_block: str = "") -> list[dict]:
    query: dict[str, Any] = {}
    cat = str(category or "").strip()
    block = str(footer_block or "").strip().lower()
    if cat:
        query["category"] = cat
    elif block in {"resources", "company"}:
        query["footerBlock"] = block
    sort_key = [("sidebarOrder", 1), ("updated_at", -1)] if cat in SIDEBAR_SORT_CATEGORIES else [("updated_at", -1)]
    cursor = footer_resources_collection.find(query).sort(sort_key).limit(200)
    rows = [_serialize(doc) async for doc in cursor]
    if block in {"resources", "company"} and not cat:
        rows = [row for row in rows if row.get("footerBlock") == block]
    return _sort_rows(rows, cat)


async def create_footer_resource(payload: FooterResourceCreate) -> dict:
    now = datetime.utcnow()
    raw = _normalize_careers_payload_dict(payload.model_dump(), payload.category, apply_defaults=True)
    raw = _normalize_cms_payload_dict(raw, payload.category, apply_defaults=True)
    normalized = FooterResourceCreate(**raw)
    slug_source = _slug_source_for(normalized.category, normalized.model_dump())
    slug = await _unique_slug(slug_from_title(slug_source))
    doc = _base_doc(normalized, slug, now)
    result = await footer_resources_collection.insert_one(doc)
    saved = await footer_resources_collection.find_one({"_id": result.inserted_id})
    return _serialize(saved or {**doc, "_id": result.inserted_id})


async def update_footer_resource(resource_id: str, payload: FooterResourceUpdate) -> dict:
    oid = _parse_oid(resource_id)
    existing = await footer_resources_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Footer resource not found")

    patch: dict[str, Any] = {"updated_at": datetime.utcnow()}
    merged_category = str(payload.category or existing.get("category") or "")
    data = _normalize_careers_payload_dict(
        payload.model_dump(exclude_unset=True),
        category=merged_category,
        apply_defaults=False,
    )
    data = _normalize_cms_payload_dict(data, merged_category, apply_defaults=False)
    if "title" in data and data["title"] is not None:
        patch["title"] = str(data["title"]).strip()
    if "category" in data and data["category"] is not None:
        patch["category"] = data["category"]
        patch["footerBlock"] = footer_block_for(data["category"])
        merged_category = str(data["category"])
    if "sidebarOrder" in data and data["sidebarOrder"] is not None:
        patch["sidebarOrder"] = int(data["sidebarOrder"])
    for key in _TEXT_KEYS:
        if key in data and data[key] is not None:
            patch[key] = str(data[key]).strip()

    # Careers: keep title + slug tied to jobTitle when present
    if merged_category == "Careers":
        role = _bare_eventthon_role(str(patch.get("jobTitle") or existing.get("jobTitle") or patch.get("title") or ""))
        if role:
            patch["jobTitle"] = role
            patch["title"] = role

    if "slug" in data and data["slug"]:
        patch["slug"] = await _unique_slug(data["slug"], oid)
    elif merged_category == "Documentation" and "pricingLabel" in patch:
        patch["slug"] = await _unique_slug(str(patch["pricingLabel"]), oid)
    elif "title" in patch or (merged_category == "Careers" and "jobTitle" in patch):
        slug_base = patch.get("jobTitle") if merged_category == "Careers" else patch.get("title")
        if slug_base:
            patch["slug"] = await _unique_slug(str(slug_base), oid)

    await footer_resources_collection.update_one({"_id": oid}, {"$set": patch})
    updated = await footer_resources_collection.find_one({"_id": oid})
    return _serialize(updated or existing)


async def _seed_row_exists(row: dict[str, Any]) -> bool:
    cat = str(row.get("category") or "").strip()
    if cat in {"Privacy Policy", "Terms of Service"}:
        return bool(await footer_resources_collection.find_one({"category": cat}))
    if cat == "Documentation":
        topic = str(row.get("pricingLabel") or "").strip()
        return bool(
            await footer_resources_collection.find_one(
                {"category": cat, "$or": [{"pricingLabel": topic}, {"slug": topic}]}
            )
        )
    if cat == "Guides":
        title = str(row.get("title") or "").strip()
        return bool(await footer_resources_collection.find_one({"category": cat, "title": title}))
    if cat == "Tutorials":
        title = str(row.get("title") or "").strip()
        return bool(await footer_resources_collection.find_one({"category": cat, "title": title}))
    if cat == "Blog":
        title = str(row.get("title") or "").strip()
        return bool(await footer_resources_collection.find_one({"category": cat, "title": title}))
    if cat == "Case Studies":
        title = str(row.get("title") or "").strip()
        return bool(await footer_resources_collection.find_one({"category": cat, "title": title}))
    if cat == "Help Center":
        return bool(await footer_resources_collection.find_one({"category": cat}))
    if cat == "Community":
        return bool(await footer_resources_collection.find_one({"category": cat}))
    if cat == "Footer Brand":
        return bool(await footer_resources_collection.find_one({"category": cat}))
    return False


async def seed_footer_defaults(*, force: bool = False) -> dict:
    """Insert default Privacy / Terms / Docs / Guides rows when missing (or force refresh)."""
    from .footer_seed import build_seed_rows

    created: list[dict] = []
    skipped: list[str] = []
    replaced: list[str] = []

    for row in build_seed_rows():
        label = f"{row['category']}:{row.get('pricingLabel') or row.get('title')}"
        exists = await _seed_row_exists(row)
        if exists and not force:
            skipped.append(label)
            continue
        if exists and force:
            cat = row["category"]
            if cat in {"Privacy Policy", "Terms of Service"}:
                await footer_resources_collection.delete_many({"category": cat})
            elif cat == "Documentation":
                topic = str(row.get("pricingLabel") or "")
                await footer_resources_collection.delete_many(
                    {"category": cat, "$or": [{"pricingLabel": topic}, {"slug": topic}]}
                )
            elif cat == "Guides":
                await footer_resources_collection.delete_many(
                    {"category": cat, "title": str(row.get("title") or "")}
                )
            elif cat == "Tutorials":
                await footer_resources_collection.delete_many(
                    {"category": cat, "title": str(row.get("title") or "")}
                )
            elif cat == "Blog":
                await footer_resources_collection.delete_many(
                    {"category": cat, "title": str(row.get("title") or "")}
                )
            elif cat == "Case Studies":
                await footer_resources_collection.delete_many(
                    {"category": cat, "title": str(row.get("title") or "")}
                )
            elif cat == "Help Center":
                await footer_resources_collection.delete_many({"category": cat})
            elif cat == "Community":
                await footer_resources_collection.delete_many({"category": cat})
            elif cat == "Footer Brand":
                await footer_resources_collection.delete_many({"category": cat})
            replaced.append(label)
        payload = FooterResourceCreate(**row)
        created.append(await create_footer_resource(payload))

    return {
        "createdCount": len(created),
        "skippedCount": len(skipped),
        "replacedCount": len(replaced),
        "skipped": skipped,
        "replaced": replaced,
        "created": created,
    }


async def delete_footer_resource(resource_id: str) -> dict:
    oid = _parse_oid(resource_id)
    result = await footer_resources_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Footer resource not found")
    return {"deleted": True, "id": resource_id}


def _parse_oid(resource_id: str) -> ObjectId:
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(status_code=400, detail="Invalid footer resource id")
    return ObjectId(resource_id)
