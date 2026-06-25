from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from database import hub_projects_collection
from .hub_helpers import ensure_seeded
from .hub_schemas import ProjectActionPayload, UpdateProjectPayload
from .projects_session import assert_actor_id, verify_projects_session
from .serializers import map_wizard_status, project_oid, serialize_project, status_to_label

router = APIRouter()


@router.get("/{project_id}")
async def get_project_detail(
    project_id: str,
    owner_user_id: str = Query("", max_length=120),
):
    doc = None
    if ObjectId.is_valid(project_id):
        doc = await hub_projects_collection.find_one({"_id": ObjectId(project_id)})
    if not doc and owner_user_id.strip():
        await ensure_seeded(owner_user_id.strip())
        if ObjectId.is_valid(project_id):
            doc = await hub_projects_collection.find_one({"_id": ObjectId(project_id)})
    if not doc:
        doc = await hub_projects_collection.find_one({"visibility": "public", "title": project_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    row = serialize_project(doc)
    return {
        "status": "success",
        "project": {
            **row,
            "description": row.get("short_description") or row.get("description", ""),
            "detailed_description": row.get("detailed_description")
            or row.get("short_description")
            or row.get("description", ""),
            "tech_stack": row.get("tech_stack") or row.get("skills") or [],
            "experience_level": row.get("experience_level") or "",
            "work_mode": row.get("work_mode") or "",
            "budget_range": row.get("budget") or "",
            "pricing_tiers": row.get("pricing_tiers") or {},
            "selected_template_id": row.get("selected_template_id") or "",
            "agency": row.get("agency", "Studio"),
            "tasks": row.get("tasks_count", 0),
            "tone": row.get("icon_tone", "web"),
            "contributors": row.get("contributors") or [],
        },
    }


@router.patch("/{project_id}")
async def update_project(
    project_id: str,
    payload: UpdateProjectPayload,
    user: dict = Depends(verify_projects_session),
):
    try:
        oid = project_oid(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project id")
    uid = payload.owner_user_id.strip()
    await assert_actor_id(uid, user)
    existing = await hub_projects_collection.find_one({"_id": oid, "owner_user_id": uid})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    updates: dict[str, Any] = {"updated_at": datetime.utcnow(), "updated_label": "Just now"}
    if payload.title is not None:
        updates["title"] = payload.title.strip()
        updates["name"] = updates["title"]
    if payload.status is not None:
        st = (
            map_wizard_status(payload.status)
            if payload.status in ("Planning", "Active", "Paused", "Completed")
            else payload.status
        )
        updates["status"] = st
        updates["status_label"] = status_to_label(st)
    if payload.progress is not None:
        updates["progress"] = payload.progress
    if payload.category is not None:
        updates["category"] = payload.category.strip()
    await hub_projects_collection.update_one({"_id": oid}, {"$set": updates})
    doc = await hub_projects_collection.find_one({"_id": oid})
    return {"status": "success", "project": serialize_project(doc)}


@router.post("/{project_id}/actions")
async def project_action(
    project_id: str,
    payload: ProjectActionPayload,
    user: dict = Depends(verify_projects_session),
):
    try:
        oid = project_oid(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project id")
    uid = payload.owner_user_id.strip()
    await assert_actor_id(uid, user)
    action = payload.action.strip().lower()
    existing = await hub_projects_collection.find_one({"_id": oid, "owner_user_id": uid})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.utcnow()
    if action == "delete":
        await hub_projects_collection.delete_one({"_id": oid})
        return {"status": "success", "message": "Project deleted"}

    updates: dict[str, Any] = {"updated_at": now, "updated_label": "Just now"}
    if action == "duplicate":
        clone = dict(existing)
        clone.pop("_id", None)
        clone["title"] = f"{clone.get('title', 'Project')} (Copy)"
        clone["name"] = clone["title"]
        clone["created_at"] = now
        clone["updated_at"] = now
        clone["updated_label"] = "Just now"
        clone["progress"] = 0
        clone["status"] = "planning"
        clone["status_label"] = status_to_label("planning")
        result = await hub_projects_collection.insert_one(clone)
        doc = await hub_projects_collection.find_one({"_id": result.inserted_id})
        return {"status": "success", "project": serialize_project(doc)}

    if action in ("hold", "on-hold", "pause"):
        updates["status"] = "on-hold"
        updates["status_label"] = status_to_label("on-hold")
    elif action in ("resume", "activate"):
        updates["status"] = "in-progress"
        updates["status_label"] = status_to_label("in-progress")
    elif action == "complete":
        updates["status"] = "completed"
        updates["status_label"] = status_to_label("completed")
        updates["progress"] = 100
    elif action == "archive":
        updates["visibility"] = "private"
        updates["featured"] = False
    else:
        raise HTTPException(status_code=400, detail="Unknown action")

    await hub_projects_collection.update_one({"_id": oid}, {"$set": updates})
    doc = await hub_projects_collection.find_one({"_id": oid})
    return {"status": "success", "project": serialize_project(doc)}
