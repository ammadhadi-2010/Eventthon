"""Admin gig roster — stats, list, status, delete."""
from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import gigs_collection
from backend_routes.gigs.gig_serialize import serialize_gig
from backend_routes.admin.gig_management import _find_user, _public_profile
from backend_routes.admin.gig_admin_format import (
    gig_admin_row,
    gig_stats_payload,
    normalize_admin_gig_status,
    status_to_db,
)

router = APIRouter(tags=["Admin Gig List"])


class AdminGigStatusBody(BaseModel):
    status: str = Field(..., min_length=4, max_length=32)


async def _seller_for_gig(doc: dict) -> dict:
    seller_id = str(doc.get("seller_user_id") or "").strip()
    user = await _find_user(seller_id) if seller_id else None
    profile = _public_profile(user, seller_id)
    image = profile.get("avatarUrl") or profile.get("imageurl") or ""
    return {**profile, "imageurl": image, "avatarUrl": image}


async def _map_row(doc: dict) -> dict:
    serialized = serialize_gig(doc)
    seller = await _seller_for_gig(serialized)
    return gig_admin_row(serialized, seller)


@router.get("/gigs/stats")
async def admin_gig_stats():
    docs = await gigs_collection.find({}).to_list(length=1000)
    return {"status": "success", "metrics": gig_stats_payload(docs)}


@router.get("/gigs")
async def admin_list_gigs(
    q: str = Query("", max_length=120),
    status: str = Query("", max_length=32),
):
    docs = await gigs_collection.find({}).sort("created_at", -1).to_list(length=500)
    rows = []
    for doc in docs:
        row = await _map_row(doc)
        if status and row["admin_status"] != status.upper():
            continue
        if q:
            needle = q.strip().lower()
            seller_name = str(row.get("seller", {}).get("name") or "").lower()
            hay = f"{row['title']} {row['category']} {seller_name}".lower()
            if needle not in hay:
                continue
        rows.append(row)
    return {"status": "success", "data": rows, "total": len(rows)}


@router.patch("/gigs/{gig_id}/admin-status")
async def admin_patch_gig_status(gig_id: str, body: AdminGigStatusBody):
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    oid = ObjectId(gig_id)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    db_status = status_to_db(body.status)
    await gigs_collection.update_one(
        {"_id": oid},
        {"$set": {"status": db_status, "updated_at": datetime.utcnow()}},
    )
    updated = await gigs_collection.find_one({"_id": oid})
    return {"status": "success", "data": await _map_row(updated)}


@router.delete("/gigs/{gig_id}/admin")
async def admin_delete_gig(gig_id: str):
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    oid = ObjectId(gig_id)
    result = await gigs_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gig not found")
    return {"status": "success", "message": "Gig deleted"}
