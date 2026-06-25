from datetime import datetime

from fastapi import APIRouter, Depends

from ..squads_session import assert_squad_leader, verify_squads_session
from ..squad_permissions import (
    optional_verify_squads_session,
    assert_hub_read_access,
    assert_hub_member,
    assert_can_create_project,
    assert_projects_enabled,
)
from ..squad_shared import (
    CreateProjectPayload,
    UpdateProjectPayload,
    squad_collection,
    get_squad_or_none,
    create_activity_event,
)
from .project_builders import PROJECT_UPDATE_KEYS, build_new_project_doc

router = APIRouter()


@router.get("/{squad_id}/projects")
async def get_squad_projects(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found", "data": []}
    assert_hub_read_access(squad, user)
    return {"status": "success", "data": squad.get("projects", [])}


@router.post("/{squad_id}/projects")
async def create_squad_project(
    squad_id: str,
    payload: CreateProjectPayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_can_create_project(squad, user)
    clean_title = (payload.title or "").strip()
    if not clean_title:
        return {"status": "error", "message": "Project title required"}
    project = build_new_project_doc(payload)
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$push": {
                "projects": project,
                "activity_feed": create_activity_event(
                    "project_create",
                    f"New project created: {clean_title}",
                    payload.owner or "You",
                ),
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "data": project}


@router.put("/{squad_id}/projects/{project_id}")
async def update_squad_project(
    squad_id: str,
    project_id: str,
    payload: UpdateProjectPayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_member(squad, user)
    assert_projects_enabled(squad)
    projects = squad.get("projects", [])
    existing = next((p for p in projects if p.get("id") == project_id), None)
    if not existing:
        return {"status": "error", "message": "Project not found"}
    updates = {}
    for key in PROJECT_UPDATE_KEYS:
        value = getattr(payload, key)
        if value is not None:
            updates[key] = value
    if "title" in updates:
        updates["title"] = str(updates["title"]).strip()
        if not updates["title"]:
            return {"status": "error", "message": "Project title required"}
    if "progress" in updates:
        updates["progress"] = max(0, min(100, int(updates["progress"])))
    if not updates:
        return {"status": "success", "data": existing}
    new_projects = []
    updated_project = existing
    for project in projects:
        if project.get("id") == project_id:
            updated_project = {**project, **updates}
            new_projects.append(updated_project)
        else:
            new_projects.append(project)
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"projects": new_projects, "updated_at": datetime.utcnow()},
            "$push": {
                "activity_feed": create_activity_event(
                    "project_update",
                    f"Project updated: {updated_project.get('title', 'Untitled')}",
                    updated_project.get("owner", "Member"),
                )
            },
        },
    )
    return {"status": "success", "data": updated_project}


@router.delete("/{squad_id}/projects/{project_id}")
async def delete_squad_project(
    squad_id: str,
    project_id: str,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    leader_id = str(squad.get("leader_id") or "").strip()
    if leader_id:
        await assert_squad_leader(squad, leader_id, user)
    existing = squad.get("projects", [])
    if not any(project.get("id") == project_id for project in existing):
        return {"status": "error", "message": "Project not found"}
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$pull": {"projects": {"id": project_id}},
            "$push": {"activity_feed": create_activity_event("project_delete", "A project was deleted")},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "message": "Project deleted"}
