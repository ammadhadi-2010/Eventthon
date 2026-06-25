"""Admin elite rank CRUD."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pymongo import ASCENDING

from database import rank_collection

from .rank_schemas import RankCreateBody, RankUpdateBody, rank_id_from_code
from .rank_seed import ELITE_DEFAULT_RANKS, LEGACY_RANK_IDS
from backend_routes.ranks.rank_badge_meta import theme_for_code

router = APIRouter(tags=["Admin Rank Management"])

RANK_ORDER = ["E-1", "E-2", "E-3", "E-4", "E-5", "E-6"]


def _next_rank_meta(rank_code: str) -> tuple[str | None, str | None]:
    try:
        idx = RANK_ORDER.index(rank_code)
    except ValueError:
        return None, None
    if idx >= len(RANK_ORDER) - 1:
        return None, None
    nxt = ELITE_DEFAULT_RANKS[idx + 1]
    return nxt.get("rankCode"), nxt.get("rankName")


def _vip_benefit_preview(doc: dict[str, Any]) -> str:
    code = str(doc.get("rankCode") or "").strip()
    benefits = str(doc.get("benefits") or "").strip()
    if not benefits:
        return f"{code}: No benefit copy configured."
    return f"{code}: {benefits}"


class RankStatusBody(BaseModel):
    status: str = Field(..., pattern="^(active|inactive)$")


def _serialize_rank(doc: dict[str, Any]) -> dict[str, Any]:
    icon_url = str(doc.get("iconUrl") or "").strip()
    emoji = str(doc.get("icon") or "⭐")
    rank_code = doc.get("rankCode") or ""
    next_code, next_name = _next_rank_meta(rank_code)
    theme = theme_for_code(rank_code)
    return {
        "id": doc.get("rank_id") or str(doc.get("_id", "")),
        "rankCode": rank_code,
        "rankName": doc.get("rankName") or doc.get("name") or "Rank",
        "name": doc.get("rankName") or doc.get("name") or "Rank",
        "minPoints": int(doc.get("minPoints") or 0),
        "minDealsRequired": int(doc.get("minDealsRequired") or 0),
        "minStarRating": float(doc.get("minStarRating") or 0),
        "iconUrl": icon_url,
        "icon": emoji if not icon_url else emoji,
        "featureOnFrontlineDashboard": bool(doc.get("featureOnFrontlineDashboard")),
        "benefits": doc.get("benefits") or "",
        "vipBenefitPreview": _vip_benefit_preview(doc),
        "nextRankCode": next_code,
        "nextRankName": next_name,
        "badgeTier": theme.get("badgeTier"),
        "themeId": theme.get("themeId"),
        "ribbonText": theme.get("ribbonText"),
        "starCount": theme.get("starCount"),
        "status": (doc.get("status") or "inactive").lower(),
        "users": int(doc.get("users") or 0),
        "createdOn": doc.get("createdOn") or datetime.utcnow().strftime("%Y-%m-%d"),
        "updatedOn": doc.get("updatedOn") or datetime.utcnow().strftime("%Y-%m-%d"),
    }


async def _sync_matrix_ranks() -> None:
    now = datetime.utcnow().strftime("%Y-%m-%d")
    await rank_collection.delete_many({"rank_id": {"$in": list(LEGACY_RANK_IDS)}})
    for seed in ELITE_DEFAULT_RANKS:
        rid = seed["rank_id"]
        existing = await rank_collection.find_one({"rank_id": rid})
        doc = dict(seed)
        if existing:
            doc["users"] = int(existing.get("users") or 0)
            doc["createdOn"] = existing.get("createdOn") or doc["createdOn"]
        doc["updatedOn"] = now
        await rank_collection.update_one({"rank_id": rid}, {"$set": doc}, upsert=True)


async def _ensure_seed() -> None:
    await _sync_matrix_ranks()


def _doc_from_body(body: RankCreateBody, *, rank_id: str, existing: dict | None = None) -> dict[str, Any]:
    now = datetime.utcnow().strftime("%Y-%m-%d")
    icon_url = str(body.iconUrl or "").strip()
    emoji = (existing or {}).get("icon") or "⭐"
    return {
        "rank_id": rank_id,
        "rankCode": body.rankCode,
        "rankName": body.rankName.strip(),
        "name": body.rankName.strip(),
        "minPoints": int(body.minPoints),
        "minDealsRequired": int(body.minDealsRequired),
        "minStarRating": float(body.minStarRating),
        "iconUrl": icon_url,
        "icon": emoji,
        "featureOnFrontlineDashboard": bool(body.featureOnFrontlineDashboard),
        "benefits": str(body.benefits or "").strip(),
        "status": body.status,
        "users": int((existing or {}).get("users") or 0),
        "createdOn": (existing or {}).get("createdOn") or now,
        "updatedOn": now,
    }


async def _assert_unique_name(rank_name: str, exclude_id: str | None = None) -> None:
    query: dict[str, Any] = {"$or": [{"rankName": rank_name}, {"name": rank_name}]}
    if exclude_id:
        query["rank_id"] = {"$ne": exclude_id}
    exists = await rank_collection.find_one(query)
    if exists:
        raise HTTPException(status_code=409, detail="Rank name must be unique.")


@router.get("/ranks")
async def list_ranks():
    await _ensure_seed()
    docs = await rank_collection.find({}).sort([("minPoints", ASCENDING), ("rankCode", ASCENDING)]).to_list(length=200)
    return {"rows": [_serialize_rank(d) for d in docs]}


@router.get("/ranks/{rank_id}")
async def get_rank_detail(rank_id: str):
    await _ensure_seed()
    doc = await rank_collection.find_one({"rank_id": rank_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Rank not found")
    return {"rank": _serialize_rank(doc)}


@router.post("/ranks")
async def create_rank(body: RankCreateBody):
    rank_id = rank_id_from_code(body.rankCode)
    if await rank_collection.find_one({"rank_id": rank_id}):
        raise HTTPException(status_code=409, detail="Rank code already exists.")
    await _assert_unique_name(body.rankName.strip())
    doc = _doc_from_body(body, rank_id=rank_id)
    await rank_collection.insert_one(doc)
    return {"status": "success", "rank": _serialize_rank(doc)}


@router.put("/ranks/{rank_id}")
async def put_rank(rank_id: str, body: RankUpdateBody):
    doc = await rank_collection.find_one({"rank_id": rank_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Rank not found")
    await _assert_unique_name(body.rankName.strip(), exclude_id=rank_id)
    patch = _doc_from_body(body, rank_id=rank_id, existing=doc)
    await rank_collection.update_one({"_id": doc["_id"]}, {"$set": patch})
    fresh = await rank_collection.find_one({"_id": doc["_id"]})
    return {"status": "success", "rank": _serialize_rank(fresh or patch)}


@router.patch("/ranks/{rank_id}")
async def patch_rank_legacy(rank_id: str, body: RankUpdateBody):
    return await put_rank(rank_id, body)


@router.patch("/ranks/{rank_id}/status")
async def update_rank_status(rank_id: str, body: RankStatusBody):
    doc = await rank_collection.find_one({"rank_id": rank_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Rank not found")
    await rank_collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"status": body.status.lower(), "updatedOn": datetime.utcnow().strftime("%Y-%m-%d")}},
    )
    fresh = await rank_collection.find_one({"_id": doc["_id"]})
    return {"status": "success", "rank": _serialize_rank(fresh)}
