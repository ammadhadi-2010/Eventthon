from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import hub_projects_collection
from backend_routes.alerts.alert_factory import push_alert
from .chat_context import build_project_chat_context
from .hub_schemas import JoinProjectCollaboratorPayload, SelectHubPackagePayload
from .projects_session import assert_actor_id, verify_projects_session
from .serializers import project_oid, serialize_project

router = APIRouter()


@router.post("/{project_id}/join")
async def join_hub_project(
    project_id: str,
    payload: JoinProjectCollaboratorPayload,
    user: dict = Depends(verify_projects_session),
):
    try:
        oid = project_oid(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project id")
    doc = await hub_projects_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    uid = payload.user_id.strip()
    await assert_actor_id(uid, user)
    contributors = list(doc.get("contributors") or [])
    if any(str(c.get("user_id")) == uid for c in contributors):
        row = serialize_project(doc)
        owner_id = doc.get("owner_user_id") or ""
        return {
            "status": "success",
            "message": "Already a contributor",
            "project": row,
            "messages_route": "/messages",
            "chat_context": build_project_chat_context(
                owner_user_id=owner_id,
                project_id=str(oid),
                project_title=doc.get("title") or "Project",
                bidder_user_id=uid,
            ),
        }
    name = (payload.name or "Collaborator").strip()
    contributors.append(
        {
            "user_id": uid,
            "name": name,
            "avatar": (payload.avatar or "").strip(),
            "role": (payload.role or "collaborator").strip() or "collaborator",
            "joined_at": datetime.utcnow().isoformat(),
        }
    )
    await hub_projects_collection.update_one(
        {"_id": oid},
        {"$set": {"contributors": contributors, "updated_at": datetime.utcnow()}},
    )
    title = doc.get("title") or "Project"
    owner_id = doc.get("owner_user_id") or ""
    if owner_id and owner_id != uid:
        await push_alert(
            recipient_identifier=owner_id,
            category="projects",
            title=f"New collaborator on {title}",
            message=f'{name} requested to collaborate on "{title}".',
            details="Review contributors on the project detail page.",
            actor_name=name,
            action_label="Open Project",
            action_url=f"/projects/{project_id}",
        )
    await push_alert(
        recipient_identifier=uid,
        category="projects",
        title=f"You joined {title}",
        message=f'You are now collaborating on "{title}".',
        details="Your avatar appears on the project card for the workspace.",
        actor_name="EventThon Projects",
        action_label="View Project",
        action_url=f"/projects/{project_id}",
    )
    updated = await hub_projects_collection.find_one({"_id": oid})
    return {
        "status": "success",
        "project": serialize_project(updated),
        "messages_route": "/messages",
        "chat_context": build_project_chat_context(
            owner_user_id=owner_id,
            project_id=str(oid),
            project_title=title,
            bidder_user_id=uid,
            body=f'Joined "{title}" as a collaborator.',
        ),
    }


@router.post("/{project_id}/select-package")
async def select_hub_project_package(
    project_id: str,
    payload: SelectHubPackagePayload,
    user: dict = Depends(verify_projects_session),
):
    try:
        oid = project_oid(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project id")
    doc = await hub_projects_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    uid = payload.user_id.strip()
    await assert_actor_id(uid, user)
    key = (payload.package_key or "standard").strip().lower()
    if key not in ("basic", "standard", "premium"):
        raise HTTPException(status_code=400, detail="Invalid package key")
    package_blob = {
        "key": key,
        "label": (payload.package_label or key.title()).strip(),
        "price": int(payload.price or 0),
        "delivery_days": int(payload.delivery_days or 30),
        "revisions": int(payload.revisions or 2),
    }
    name = (payload.name or "Collaborator").strip()
    contributors = list(doc.get("contributors") or [])
    found = False
    updated_contributors = []
    for row in contributors:
        if str(row.get("user_id")) == uid:
            found = True
            updated_contributors.append(
                {
                    **row,
                    "proposal_status": "confirmed",
                    "selected_package": package_blob,
                    "package_key": key,
                }
            )
        else:
            updated_contributors.append(row)
    if not found:
        updated_contributors.append(
            {
                "user_id": uid,
                "name": name,
                "avatar": (payload.avatar or "").strip(),
                "role": "collaborator",
                "joined_at": datetime.utcnow().isoformat(),
                "proposal_status": "confirmed",
                "selected_package": package_blob,
                "package_key": key,
            }
        )
    await hub_projects_collection.update_one(
        {"_id": oid},
        {"$set": {"contributors": updated_contributors, "updated_at": datetime.utcnow()}},
    )
    title = doc.get("title") or "Project"
    owner_id = doc.get("owner_user_id") or ""
    if owner_id and owner_id != uid:
        await push_alert(
            recipient_identifier=owner_id,
            category="projects",
            title=f"Package proposal on {title}",
            message=(
                f'{name} confirmed the {package_blob["label"]} package '
                f'(${package_blob["price"]:,}, {package_blob["delivery_days"]} days).'
            ),
            details="Review collaboration terms on the project detail page.",
            actor_name=name,
            action_label="Open Project",
            action_url=f"/projects/{project_id}",
        )
    await push_alert(
        recipient_identifier=uid,
        category="projects",
        title=f"Package confirmed for {title}",
        message=f'You locked the {package_blob["label"]} package at ${package_blob["price"]:,}.',
        details="Your proposal status is confirmed on this project.",
        actor_name="EventThon Projects",
        action_label="View Project",
        action_url=f"/projects/{project_id}",
    )
    updated = await hub_projects_collection.find_one({"_id": oid})
    proposal_id = str(ObjectId())
    await hub_projects_collection.update_one(
        {"_id": oid},
        {
            "$push": {
                "proposals": {
                    "proposal_id": proposal_id,
                    "bidder_user_id": uid,
                    "bidder_name": name,
                    "package": package_blob,
                    "status": "submitted",
                    "created_at": datetime.utcnow().isoformat(),
                }
            }
        },
    )
    return {
        "status": "success",
        "proposal_id": proposal_id,
        "project": serialize_project(updated),
        "messages_route": "/messages",
        "chat_context": build_project_chat_context(
            owner_user_id=owner_id,
            project_id=str(oid),
            project_title=title,
            bidder_user_id=uid,
            proposal_id=proposal_id,
            package_label=package_blob["label"],
        ),
    }
