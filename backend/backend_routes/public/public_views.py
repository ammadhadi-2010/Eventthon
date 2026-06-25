"""Unauthenticated public read endpoints for SEO showroom pages."""
from __future__ import annotations

import asyncio
import re
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from database import gigs_collection, hub_projects_collection, jobs_collection, squad_collection, user_collection
from backend_routes.squads.squad_shared import ensure_seed_data, normalize_squad_settings
from .public_sanitize import (
    public_gig_payload,
    public_job_payload,
    public_project_payload,
    public_squad_payload,
    public_squad_showroom_payload,
    public_user_payload,
    slugify,
    _MOBILE_RE,
)
from .public_marketplace import marketplace_gig_extras, marketplace_job_extras, related_gig_card
from .public_panel import router as showroom_hub_router
from .public_jobs_board import router as jobs_board_router

router = APIRouter(prefix="/public", tags=["Public SEO"])
router.include_router(showroom_hub_router)
router.include_router(jobs_board_router)


def _username_blocked(value: str) -> bool:
    raw = str(value or "").strip()
    if not raw or len(raw) > 80:
        return True
    if _MOBILE_RE.fullmatch(raw):
        return True
    if re.fullmatch(r"[\d+\-\s]{10,20}", raw):
        return True
    return False


async def _find_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    key = username.strip()
    lower = key.lower()
    or_clauses = [
        {"user_id": {"$regex": f"^{re.escape(key)}$", "$options": "i"}},
        {"public_id": {"$regex": f"^{re.escape(key)}$", "$options": "i"}},
    ]
    if lower.startswith("etu-"):
        or_clauses.append({"public_id": {"$regex": f"^{re.escape(key)}$", "$options": "i"}})
    doc = await user_collection.find_one({"$or": or_clauses})
    if doc:
        return doc
    # Email local-part handles only (never return email in payload)
    if re.fullmatch(r"[a-z0-9._-]{2,40}", lower):
        doc = await user_collection.find_one(
            {"email": {"$regex": f"^{re.escape(lower)}@", "$options": "i"}}
        )
    return doc


async def _find_squad_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    await ensure_seed_data()
    raw = (slug or "").strip()
    if not raw:
        return None
    needle = slugify(raw)
    or_clauses: list[dict] = [{"_id": raw}, {"slug": raw}]
    if needle != raw:
        or_clauses.append({"slug": needle})
    name_guess = raw.replace("-", " ").strip()
    if name_guess:
        or_clauses.append({"squad_name": {"$regex": f"^{re.escape(name_guess)}$", "$options": "i"}})
    if ObjectId.is_valid(raw):
        or_clauses.append({"_id": ObjectId(raw)})
    doc = await squad_collection.find_one({"$or": or_clauses})
    if doc:
        return doc
    async for squad in squad_collection.find({}):
        if needle and slugify(squad.get("squad_name") or "") == needle:
            return squad
    return None


async def _find_public_gig(gig_id: str) -> Optional[Dict[str, Any]]:
    raw = (gig_id or "").strip()
    if not raw:
        return None
    needle = slugify(raw)
    or_clauses: list[dict] = [{"public_slug": raw}]
    if needle != raw:
        or_clauses.append({"public_slug": needle})
    if ObjectId.is_valid(raw):
        or_clauses.insert(0, {"_id": ObjectId(raw)})
    published = {"status": {"$regex": "^published$", "$options": "i"}}
    gig = await gigs_collection.find_one({"$and": [published, {"$or": or_clauses}]})
    if not gig:
        name_guess = raw.replace("-", " ").strip()
        if name_guess:
            gig = await gigs_collection.find_one(
                {
                    **published,
                    "title": {"$regex": f"^{re.escape(name_guess)}$", "$options": "i"},
                }
            )
    if not gig:
        return None
    status = str(gig.get("status") or "").strip().lower()
    visibility = str(gig.get("visibility") or "public").strip().lower()
    if status not in {"published", "active"}:
        raise HTTPException(status_code=404, detail="Gig is not publicly available")
    if visibility == "private":
        raise HTTPException(status_code=404, detail="Gig is not publicly available")
    gig["_id"] = str(gig["_id"])
    gig.pop("seller_mobile", None)
    return gig


async def _seller_for_gig(gig: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    sid = str(gig.get("seller_user_id") or "").strip()
    if not sid:
        return None
    if ObjectId.is_valid(sid):
        user = await user_collection.find_one({"_id": ObjectId(sid)})
        if user:
            return user
    return await user_collection.find_one(
        {"$or": [{"user_id": sid}, {"mobile": sid}, {"public_id": sid}]}
    )


@router.get("/health")
async def public_showroom_health():
    return {"status": "success", "module": "public-showroom", "ready": True}


@router.get("/users/{username}")
async def public_user_profile(username: str):
    if _username_blocked(username):        raise HTTPException(status_code=400, detail="Invalid public username")
    doc = await _find_user_by_username(username)
    if not doc:
        raise HTTPException(status_code=404, detail="Public profile not found")
    if doc.get("pref_public_profile") is False:
        raise HTTPException(status_code=403, detail="This profile is not public")
    return {"status": "success", "data": public_user_payload(doc)}


@router.get("/squads/{squad_slug}", dependencies=[])
async def public_squad_profile(squad_slug: str):
    """Public read — no session, cookies, or Authorization required."""
    squad = await _find_squad_by_slug(squad_slug)
    if not squad:
        raise HTTPException(status_code=404, detail="Public squad not found")
    settings = normalize_squad_settings(squad.get("settings"))
    if not settings.get("publicListing", True):
        raise HTTPException(
            status_code=403,
            detail="This squad is not public. Enable Public Listing in Squad Settings to open the showroom.",
        )
    return {"status": "success", "data": public_squad_showroom_payload(squad)}


async def _find_public_project(project_id: str) -> Optional[Dict[str, Any]]:
    raw = (project_id or "").strip()
    if not raw:
        return None
    or_clauses: list[dict] = [{"public_slug": raw}]
    needle = slugify(raw)
    if needle != raw:
        or_clauses.append({"public_slug": needle})
    if ObjectId.is_valid(raw):
        or_clauses.append({"_id": ObjectId(raw)})
    doc = await hub_projects_collection.find_one(
        {"$and": [{"visibility": "public"}, {"$or": or_clauses}]}
    )
    if doc:
        doc["_id"] = str(doc["_id"])
        return doc
    name_guess = raw.replace("-", " ").strip()
    if name_guess:
        doc = await hub_projects_collection.find_one(
            {
                "visibility": "public",
                "title": {"$regex": f"^{re.escape(name_guess)}$", "$options": "i"},
            }
        )
        if doc:
            doc["_id"] = str(doc["_id"])
            return doc
    return None


async def _find_public_job(job_id: str) -> Optional[Dict[str, Any]]:
    raw = (job_id or "").strip()
    if not raw:
        return None
    needle = slugify(raw)
    or_clauses: list[dict] = [{"_id": raw}, {"public_slug": raw}]
    if needle != raw:
        or_clauses.append({"public_slug": needle})
    doc = await jobs_collection.find_one({"$and": [{"visibility": "public"}, {"$or": or_clauses}]})
    if doc:
        return doc
    name_guess = raw.replace("-", " ").strip()
    if name_guess:
        return await jobs_collection.find_one(
            {
                "visibility": "public",
                "title": {"$regex": f"^{re.escape(name_guess)}$", "$options": "i"},
            }
        )
    return None

async def _related_gigs_for(gig: Dict[str, Any], limit: int = 6) -> list:
    current_slug = gig.get("public_slug") or ""
    category = gig.get("category") or ""
    rows = []
    seen = set()
    query = {
        "status": {"$regex": "^published$", "$options": "i"},
        "$or": [{"visibility": "public"}, {"visibility": {"$exists": False}}],
        "public_slug": {"$ne": current_slug},
    }
    if category:
        query["category"] = category
    async for doc in gigs_collection.find(query).sort("orders", -1).limit(limit):
        card = related_gig_card(doc)
        slug = card.get("publicSlug")
        if slug and slug not in seen:
            seen.add(slug)
            rows.append(card)
    if len(rows) < limit:
        async for doc in gigs_collection.find(
            {
                "status": {"$regex": "^published$", "$options": "i"},
                "public_slug": {"$ne": current_slug},
            }
        ).sort("rating", -1).limit(limit * 2):
            card = related_gig_card(doc)
            slug = card.get("publicSlug")
            if slug and slug not in seen:
                seen.add(slug)
                rows.append(card)
            if len(rows) >= limit:
                break
    return rows[:limit]


@router.get("/gigs/{gig_id}", dependencies=[])
async def public_gig_detail(gig_id: str):
    """Public marketplace gig — no auth."""
    gig = await _find_public_gig(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Public gig not found")
    seller, related = await asyncio.gather(_seller_for_gig(gig), _related_gigs_for(gig))
    payload = public_gig_payload(gig, seller)
    seller_name = payload.get("creatorBadge", {}).get("displayName") or "Creator"
    payload.update(marketplace_gig_extras(gig, seller_name))
    payload["relatedGigs"] = related
    if payload.get("creatorBadge"):
        payload["creatorBadge"]["level"] = payload["sellerProfile"].get("level")
    return {"status": "success", "data": payload}

@router.get("/projects/{project_id}", dependencies=[])
async def public_project_detail(project_id: str):
    """Public portfolio project — no auth."""
    doc = await _find_public_project(project_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Public project not found")
    return {"status": "success", "data": public_project_payload(doc)}


@router.get("/jobs/{job_id}", dependencies=[])
async def public_job_detail(job_id: str):
    """Public job board listing — no auth."""
    doc = await _find_public_job(job_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Public job not found")
    payload = public_job_payload(doc)
    payload.update(marketplace_job_extras(doc))
    return {"status": "success", "data": payload}