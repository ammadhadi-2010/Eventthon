"""Admin project management — stats, list, detail, status, update, archive."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import hub_projects_collection
from backend_routes.admin.gig_management import _find_user, _public_profile
from backend_routes.projects.serializers import serialize_project, status_to_label
from backend_routes.admin.project_admin_format import (
    normalize_admin_project_status,
    project_admin_row,
    project_stats_payload,
    project_status_slices,
    project_timeline_payload,
    status_to_db,
)

router = APIRouter(tags=["Admin Project Management"])


class ProjectStatusBody(BaseModel):
    status: str = Field(..., min_length=4, max_length=32)


class ProjectUpdateBody(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    category: Optional[str] = Field(None, max_length=120)
    description: Optional[str] = Field(None, max_length=4000)


def _initials(name: str, fallback: str = "TM") -> str:
    parts = [p for p in str(name or "").strip().split() if p]
    if len(parts) >= 2:
        return f"{parts[0][0]}{parts[1][0]}".upper()
    if parts:
        return parts[0][:2].upper()
    return fallback[:2].upper()


async def _hydrate_team(doc: dict) -> List[dict]:
    members = doc.get("members") or []
    team_out: List[dict] = []
    for member in members:
        if not isinstance(member, dict):
            continue
        user_id = str(member.get("user_id") or "").strip()
        user = await _find_user(user_id) if user_id and not user_id.startswith("seed-") else None
        profile = _public_profile(user, user_id) if user else {}
        name = member.get("name") or profile.get("name") or "Member"
        image = profile.get("imageurl") or profile.get("avatarUrl") or member.get("imageurl") or ""
        team_out.append(
            {
                "name": name,
                "initials": member.get("initials") or _initials(name),
                "imageurl": image,
                "role": member.get("role") or "Member",
            }
        )
    if team_out:
        return team_out
    for token in doc.get("team") or []:
        label = str(token or "TM")
        team_out.append({"name": label, "initials": label[:2].upper(), "imageurl": "", "role": "Member"})
    return team_out


async def _owner_manager(doc: dict) -> dict:
    owner_id = str(doc.get("owner_user_id") or "").strip()
    user = await _find_user(owner_id) if owner_id else None
    if user:
        profile = _public_profile(user, owner_id)
        return {
            "name": profile.get("name") or "Project Manager",
            "imageurl": profile.get("imageurl") or profile.get("avatarUrl") or "",
        }
    return {"name": doc.get("agency") or "Project Manager", "imageurl": ""}


async def _map_row(doc: dict) -> dict:
    team = await _hydrate_team(doc)
    return project_admin_row(doc, team)


@router.get("/projects/stats")
async def admin_project_stats():
    docs = await hub_projects_collection.find({}).to_list(length=2000)
    return {
        "status": "success",
        "metrics": project_stats_payload(docs),
        "timeline": project_timeline_payload(docs),
        "statusSlices": project_status_slices(docs),
    }


@router.get("/projects")
async def list_admin_projects(
    q: str = Query("", max_length=120),
    status: str = Query("", max_length=32),
):
    docs = await hub_projects_collection.find({}).sort("updated_at", -1).to_list(length=500)
    rows = []
    for doc in docs:
        row = await _map_row(doc)
        if status and row["admin_status"].lower() != status.strip().lower():
            continue
        if q:
            needle = q.strip().lower()
            hay = f"{row['name']} {row['category']}".lower()
            if needle not in hay:
                continue
        rows.append(row)
    return {"status": "success", "data": rows, "total": len(rows)}


@router.get("/projects/{project_id}")
async def get_admin_project_detail(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    doc = await hub_projects_collection.find_one({"_id": ObjectId(project_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    row = await _map_row(doc)
    manager = await _owner_manager(doc)
    serialized = serialize_project(dict(doc))
    return {
        "status": "success",
        "data": {
            **row,
            **serialized,
            "manager": manager,
            "detailed_description": serialized.get("detailed_description") or row.get("description") or "",
            "milestones": doc.get("milestones") or [],
            "funding_goal": doc.get("funding_goal") or 0,
            "funding_raised": doc.get("funding_raised") or 0,
        },
    }


@router.patch("/projects/{project_id}/status")
async def patch_admin_project_status(project_id: str, body: ProjectStatusBody):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    oid = ObjectId(project_id)
    doc = await hub_projects_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    db_status = status_to_db(body.status)
    progress = 100 if db_status == "completed" else doc.get("progress", 0)
    await hub_projects_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": db_status,
                "status_label": status_to_label(db_status),
                "progress": progress,
                "updated_at": datetime.utcnow(),
                "updated_label": "Just now",
            }
        },
    )
    updated = await hub_projects_collection.find_one({"_id": oid})
    return {"status": "success", "data": await _map_row(updated)}


@router.put("/projects/{project_id}")
async def update_admin_project(project_id: str, body: ProjectUpdateBody):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    oid = ObjectId(project_id)
    doc = await hub_projects_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    updates = {"updated_at": datetime.utcnow(), "updated_label": "Just now"}
    if body.name is not None:
        updates["name"] = body.name.strip()
        updates["title"] = updates["name"]
    if body.category is not None:
        updates["category"] = body.category.strip()
    if body.description is not None:
        updates["short_description"] = body.description.strip()
        updates["description"] = body.description.strip()
    await hub_projects_collection.update_one({"_id": oid}, {"$set": updates})
    updated = await hub_projects_collection.find_one({"_id": oid})
    return {"status": "success", "data": await _map_row(updated)}


@router.patch("/projects/{project_id}/archive")
async def archive_admin_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")
    oid = ObjectId(project_id)
    doc = await hub_projects_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    await hub_projects_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "visibility": "private",
                "featured": False,
                "status": "on-hold",
                "status_label": status_to_label("on-hold"),
                "updated_at": datetime.utcnow(),
                "updated_label": "Just now",
            }
        },
    )
    updated = await hub_projects_collection.find_one({"_id": oid})
    return {"status": "success", "data": await _map_row(updated)}
