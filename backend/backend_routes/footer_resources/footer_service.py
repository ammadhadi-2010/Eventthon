"""Footer resource CMS — MongoDB CRUD."""
from __future__ import annotations

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
    "jobTitle",
    "jobLocation",
    "policyVersion",
)


def _serialize(doc: dict) -> dict:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    for key in ("created_at", "updated_at"):
        val = out.get(key)
        if isinstance(val, datetime):
            out[key] = val.isoformat()
    out.setdefault("sidebarOrder", 0)
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
    slug = await _unique_slug(slug_from_title(payload.slug or payload.title))
    doc = _base_doc(payload, slug, now)
    result = await footer_resources_collection.insert_one(doc)
    saved = await footer_resources_collection.find_one({"_id": result.inserted_id})
    return _serialize(saved or {**doc, "_id": result.inserted_id})


async def update_footer_resource(resource_id: str, payload: FooterResourceUpdate) -> dict:
    oid = _parse_oid(resource_id)
    existing = await footer_resources_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Footer resource not found")

    patch: dict[str, Any] = {"updated_at": datetime.utcnow()}
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        patch["title"] = str(data["title"]).strip()
    if "category" in data and data["category"] is not None:
        patch["category"] = data["category"]
        patch["footerBlock"] = footer_block_for(data["category"])
    if "sidebarOrder" in data and data["sidebarOrder"] is not None:
        patch["sidebarOrder"] = int(data["sidebarOrder"])
    for key in _TEXT_KEYS:
        if key in data and data[key] is not None:
            patch[key] = str(data[key]).strip()

    if "slug" in data and data["slug"]:
        patch["slug"] = await _unique_slug(data["slug"], oid)
    elif "title" in patch:
        patch["slug"] = await _unique_slug(patch["title"], oid)

    await footer_resources_collection.update_one({"_id": oid}, {"$set": patch})
    updated = await footer_resources_collection.find_one({"_id": oid})
    return _serialize(updated or existing)


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
