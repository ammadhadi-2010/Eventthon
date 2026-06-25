"""Admin squad management — list, stats, detail, status, update, disband."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import squad_collection
from backend_routes.squads.squad_permissions import hydrate_squad_members
from backend_routes.squads.squad_shared import (
    create_activity_event,
    get_squad_or_none,
    slugify_squad_name,
)

from .squad_format import (
    format_activity_feed,
    normalize_admin_squad_status,
    squad_admin_row,
    squad_stats_payload,
    status_to_db,
)

router = APIRouter(tags=["Admin Squad Management"])


class SquadStatusBody(BaseModel):
    status: str = Field(..., min_length=4, max_length=32)


class SquadUpdateBody(BaseModel):
    squad_name: Optional[str] = Field(None, max_length=160)
    niche: Optional[str] = Field(None, max_length=160)
    description: Optional[str] = Field(None, max_length=2000)


async def _leader_name(members: list, leader_id: str) -> str:
    lid = str(leader_id or "").strip()
    for member in members or []:
        if str(member.get("id") or "") == lid:
            return str(member.get("name") or "Squad Leader")
    for member in members or []:
        if str(member.get("role") or "").lower() in ("admin", "leader"):
            return str(member.get("name") or "Squad Leader")
    if members:
        return str(members[0].get("name") or "Squad Leader")
    return "Squad Leader"


async def _hydrated_squad(squad_id: str) -> Optional[dict]:
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return None
    members = await hydrate_squad_members(squad.get("members", []))
    return {**squad, "members": members}


async def _admin_row(squad: dict) -> dict:
    leader = await _leader_name(squad.get("members") or [], squad.get("leader_id"))
    return squad_admin_row(squad, leader)


@router.get("/squads/stats")
async def squad_admin_stats():
    squads = await squad_collection.find({}).to_list(length=500)
    return {"status": "success", "metrics": squad_stats_payload(squads)}


@router.get("/squads")
async def list_admin_squads(
    q: str = Query("", max_length=120),
    status: str = Query("", max_length=32),
):
    squads = await squad_collection.find({}).sort("created_at", -1).to_list(length=500)
    rows = []
    for squad in squads:
        hydrated = {**squad, "members": await hydrate_squad_members(squad.get("members", []))}
        row = await _admin_row(hydrated)
        if status and row["admin_status"] != status.upper():
            continue
        if q:
            needle = q.strip().lower()
            hay = f"{row['squad_name']} {row['niche']} {row['leader_name']}".lower()
            if needle not in hay:
                continue
        rows.append(row)
    return {"status": "success", "data": rows, "total": len(rows)}


@router.get("/squads/{squad_id}")
async def get_admin_squad_detail(squad_id: str):
    squad = await _hydrated_squad(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    row = await _admin_row(squad)
    row["activity_feed"] = format_activity_feed(squad.get("activity_feed"))
    return {"status": "success", "data": row}


@router.get("/squads/{squad_id}/members")
async def get_admin_squad_members(squad_id: str):
    squad = await _hydrated_squad(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    return {"status": "success", "data": squad.get("members") or []}


@router.patch("/squads/{squad_id}/status")
async def patch_admin_squad_status(squad_id: str, body: SquadStatusBody):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    db_status = status_to_db(body.status)
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"status": db_status, "updated_at": datetime.utcnow()},
            "$push": {
                "activity_feed": create_activity_event(
                    "admin_status",
                    f"Squad status changed to {body.status.upper()}",
                )
            },
        },
    )
    updated = await _hydrated_squad(squad_id)
    return {"status": "success", "data": await _admin_row(updated or squad)}


@router.put("/squads/{squad_id}")
async def update_admin_squad(squad_id: str, body: SquadUpdateBody):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    updates = {}
    if body.squad_name is not None:
        clean = body.squad_name.strip()
        if not clean:
            raise HTTPException(status_code=400, detail="Squad name required")
        updates["squad_name"] = clean
        updates["icon"] = clean[0].upper()
        updates["slug"] = slugify_squad_name(clean)
    if body.niche is not None:
        updates["niche"] = body.niche.strip()
    if body.description is not None:
        updates["description"] = body.description.strip()
    if not updates:
        row = await _admin_row(await _hydrated_squad(squad_id) or squad)
        return {"status": "success", "data": row}
    updates["updated_at"] = datetime.utcnow()
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": updates,
            "$push": {"activity_feed": create_activity_event("squad_info_update", "Squad updated by admin")},
        },
    )
    updated = await _hydrated_squad(squad_id)
    return {"status": "success", "data": await _admin_row(updated or squad)}


@router.delete("/squads/{squad_id}")
async def disband_admin_squad(squad_id: str):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"status": "archived", "updated_at": datetime.utcnow()},
            "$push": {"activity_feed": create_activity_event("squad_archive", "Squad disbanded by admin")},
        },
    )
    return {"status": "success", "message": "Squad disbanded"}
