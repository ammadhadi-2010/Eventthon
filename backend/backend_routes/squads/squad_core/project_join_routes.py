from datetime import datetime

from fastapi import APIRouter, Depends

from backend_routes.alerts.alert_factory import push_alert

from ..squads_session import assert_actor_id, verify_squads_session
from ..squad_permissions import assert_hub_member, assert_projects_enabled, resolve_session_user_id
from ..squad_shared import (
    JoinProjectPayload,
    SelectPackagePayload,
    squad_collection,
    get_squad_or_none,
    create_activity_event,
)
from .project_builders import upsert_contributor_package

router = APIRouter()


@router.post("/{squad_id}/projects/{project_id}/join")
async def join_squad_project(
    squad_id: str,
    project_id: str,
    payload: JoinProjectPayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_member(squad, user)
    assert_projects_enabled(squad)
    uid = (payload.user_id or resolve_session_user_id(user)).strip()
    if not uid:
        return {"status": "error", "message": "User id required"}
    await assert_actor_id(uid, user)
    projects = squad.get("projects", [])
    existing = next((p for p in projects if p.get("id") == project_id), None)
    if not existing:
        return {"status": "error", "message": "Project not found"}
    contributors = list(existing.get("contributors") or [])
    if any(str(c.get("user_id")) == uid for c in contributors):
        return {"status": "success", "message": "Already a contributor", "data": existing}
    member_name = (payload.name or "Squad Member").strip()
    contributor = {
        "user_id": uid,
        "name": member_name,
        "avatar": (payload.avatar or "").strip(),
        "role": (payload.role or "collaborator").strip() or "collaborator",
        "joined_at": datetime.utcnow().isoformat(),
    }
    contributors.append(contributor)
    updated_project = {**existing, "contributors": contributors}
    new_projects = [updated_project if p.get("id") == project_id else p for p in projects]
    squad_name = squad.get("squad_name") or "Squad"
    project_title = updated_project.get("title") or "Project"
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"projects": new_projects, "updated_at": datetime.utcnow()},
            "$push": {
                "activity_feed": create_activity_event(
                    "project_join",
                    f'{member_name} joined project "{project_title}"',
                    member_name,
                )
            },
        },
    )
    leader_id = squad.get("leader_id") or ""
    if leader_id and leader_id != uid:
        await push_alert(
            recipient_identifier=leader_id,
            category="projects",
            title=f"New collaborator on {project_title}",
            message=f"{member_name} joined the project \"{project_title}\" in {squad_name}.",
            details="Open the squad Projects tab to review contributors and assign tasks.",
            actor_name=member_name,
            action_label="Open Squad",
            action_url="/squads",
        )
    await push_alert(
        recipient_identifier=uid,
        category="projects",
        title=f"You joined {project_title}",
        message=f"You are now collaborating on \"{project_title}\" in {squad_name}.",
        details="Your profile appears on the project card for the whole squad.",
        actor_name="EventThon Projects",
        action_label="View Project",
        action_url="/squads",
    )
    return {"status": "success", "data": updated_project}


@router.post("/{squad_id}/projects/{project_id}/select-package")
async def select_squad_project_package(
    squad_id: str,
    project_id: str,
    payload: SelectPackagePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_member(squad, user)
    assert_projects_enabled(squad)
    uid = (payload.user_id or resolve_session_user_id(user)).strip()
    if not uid:
        return {"status": "error", "message": "User id required"}
    await assert_actor_id(uid, user)
    key = (payload.package_key or "standard").strip().lower()
    if key not in ("basic", "standard", "premium"):
        return {"status": "error", "message": "Invalid package key"}
    projects = squad.get("projects", [])
    existing = next((p for p in projects if p.get("id") == project_id), None)
    if not existing:
        return {"status": "error", "message": "Project not found"}
    package_blob = {
        "key": key,
        "label": (payload.package_label or key.title()).strip(),
        "price": int(payload.price or 0),
        "delivery_days": int(payload.delivery_days or 30),
        "revisions": int(payload.revisions or 2),
    }
    member_name = (payload.name or "Squad Member").strip()
    contributors = upsert_contributor_package(
        list(existing.get("contributors") or []),
        uid,
        member_name,
        (payload.avatar or "").strip(),
        package_blob,
    )
    updated_project = {**existing, "contributors": contributors}
    new_projects = [updated_project if p.get("id") == project_id else p for p in projects]
    squad_name = squad.get("squad_name") or "Squad"
    project_title = updated_project.get("title") or "Project"
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"projects": new_projects, "updated_at": datetime.utcnow()},
            "$push": {
                "activity_feed": create_activity_event(
                    "package_select",
                    f'{member_name} selected the {package_blob["label"]} package on "{project_title}"',
                    member_name,
                )
            },
        },
    )
    leader_id = squad.get("leader_id") or ""
    if leader_id and leader_id != uid:
        await push_alert(
            recipient_identifier=leader_id,
            category="projects",
            title=f"Package proposal on {project_title}",
            message=(
                f'{member_name} confirmed the {package_blob["label"]} package '
                f'(${package_blob["price"]:,}, {package_blob["delivery_days"]} days, '
                f'{package_blob["revisions"]} revisions).'
            ),
            details="Review the collaboration terms in the squad Projects tab.",
            actor_name=member_name,
            action_label="Open Squad",
            action_url="/squads",
        )
    await push_alert(
        recipient_identifier=uid,
        category="projects",
        title=f"Package confirmed for {project_title}",
        message=(
            f'You locked the {package_blob["label"]} package at ${package_blob["price"]:,} '
            f'with a {package_blob["delivery_days"]}-day timeline.'
        ),
        details="Your proposal status is confirmed on this project.",
        actor_name="EventThon Projects",
        action_label="View Project",
        action_url="/squads",
    )
    return {"status": "success", "data": updated_project}
