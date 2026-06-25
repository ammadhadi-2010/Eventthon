"""Public showroom panel links + catalog (for dashboard hub)."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Query

from database import gigs_collection, hub_projects_collection, jobs_collection, squad_collection
from backend_routes.squads.squad_shared import normalize_squad_settings
from .public_sanitize import slugify

router = APIRouter(prefix="/showrooms", tags=["Public Showroom Hub"])


def _link_row(
    entity_type: str,
    title: str,
    subtitle: str,
    public_segment: str,
    entity_id: str,
    slug: str,
) -> Dict[str, str]:
    key = slug or entity_id
    return {
        "type": entity_type,
        "title": title,
        "subtitle": subtitle,
        "entityId": entity_id,
        "publicSlug": slug,
        "publicPath": f"/public/{public_segment}/{key}",
        "previewPath": f"/showrooms/{public_segment}/{key}",
    }


async def _collect_projects(owner_user_id: str) -> List[dict]:
    query: dict = {"visibility": "public"}
    if owner_user_id:
        query["owner_user_id"] = owner_user_id
    rows = []
    async for doc in hub_projects_collection.find(query).sort("updated_at", -1).limit(80):
        title = doc.get("title") or doc.get("name") or "Project"
        slug = doc.get("public_slug") or slugify(title)
        rows.append(
            _link_row(
                "Project",
                title,
                f"Portfolio · {doc.get('category') or 'Technology'}",
                "projects",
                str(doc["_id"]),
                slug,
            )
        )
    return rows


async def _collect_gigs(owner_user_id: str) -> List[dict]:
    query = {
        "status": {"$regex": "^published$", "$options": "i"},
        "$or": [{"visibility": "public"}, {"visibility": {"$exists": False}}],
    }
    if owner_user_id:
        query["seller_user_id"] = owner_user_id
    rows = []
    async for doc in gigs_collection.find(query).sort("updated_at", -1).limit(80):
        title = doc.get("title") or "Gig"
        gid = str(doc["_id"])
        slug = doc.get("public_slug") or gid
        rows.append(
            _link_row(
                "Gig",
                title,
                f"Marketplace · {doc.get('category') or 'Service'}",
                "gigs",
                gid,
                slug,
            )
        )
    return rows


async def _collect_jobs(owner_user_id: str) -> List[dict]:
    query: dict = {"visibility": "public"}
    if owner_user_id:
        query["owner_user_id"] = owner_user_id
    rows = []
    async for doc in jobs_collection.find(query).sort("created_at", -1).limit(80):
        title = doc.get("title") or "Job"
        jid = str(doc.get("_id") or "")
        slug = doc.get("public_slug") or slugify(title)
        remote = "Remote" if doc.get("remote") else "On-site"
        rows.append(
            _link_row(
                "Job",
                title,
                f"Jobs · {doc.get('category') or 'General'} · {remote}",
                "jobs",
                jid,
                slug,
            )
        )
    return rows


async def _collect_squads() -> List[dict]:
    rows = []
    async for doc in squad_collection.find({}).sort("created_at", -1).limit(40):
        settings = normalize_squad_settings(doc.get("settings"))
        if not settings.get("publicListing", True):
            continue
        name = doc.get("squad_name") or "Squad"
        sid = str(doc.get("_id") or "")
        slug = doc.get("slug") or slugify(name) or sid
        rows.append(
            _link_row(
                "Squad",
                name,
                f"Squad · {doc.get('niche') or 'Collaboration'}",
                "squads",
                sid,
                slug,
            )
        )
    return rows


@router.get("/panel-links", dependencies=[])
async def showroom_panel_links(owner_user_id: str = Query("", max_length=120)):
    """List public URLs for projects, gigs, jobs, and squads (optional owner filter)."""
    owner = owner_user_id.strip()
    projects = await _collect_projects(owner)
    gigs = await _collect_gigs(owner)
    jobs = await _collect_jobs(owner)
    squads = await _collect_squads()
    items = projects + gigs + jobs + squads
    return {
        "status": "success",
        "ownerUserId": owner or None,
        "total": len(items),
        "items": items,
        "groups": {"projects": projects, "gigs": gigs, "jobs": jobs, "squads": squads},
    }


@router.get("/catalog", dependencies=[])
async def showroom_catalog():
    """Lightweight public catalog for SEO sitemap generators."""
    return await showroom_panel_links()
