"""Public project feed (GET /api/projects) and wizard create alias."""
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, Query

from database import hub_projects_collection

from .hub_helpers import budget_label, ensure_seeded
from .hub_schemas import CreateProjectPayload
from .projects_session import assert_actor_id, verify_projects_session
from .serializers import explore_card_from_row, map_wizard_status, serialize_project, status_to_label

router = APIRouter(prefix="/projects", tags=["Projects Marketplace"])


@router.get("")
async def list_public_projects(
    q: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    owner_user_id: str = Query("", max_length=120),
):
    """Marketplace feed for Explore grid — GET /api/projects."""
    if owner_user_id.strip():
        await ensure_seeded(owner_user_id.strip())
    query: dict[str, Any] = {"visibility": "public"}
    if q.strip():
        query["$or"] = [
            {"title": {"$regex": q.strip(), "$options": "i"}},
            {"category": {"$regex": q.strip(), "$options": "i"}},
        ]
    total = await hub_projects_collection.count_documents(query)
    cursor = hub_projects_collection.find(query).sort("updated_at", -1).skip(skip).limit(limit)
    projects = [explore_card_from_row(serialize_project(doc)) async for doc in cursor]
    return {"status": "success", "total": total, "projects": projects}


@router.post("/create")
async def create_project_wizard(
    payload: CreateProjectPayload,
    user: dict = Depends(verify_projects_session),
):
    """Post a Project wizard submit — POST /api/projects/create."""
    uid = payload.owner_user_id.strip()
    await assert_actor_id(uid, user)
    now = datetime.utcnow()
    status = map_wizard_status(payload.status)
    budget = budget_label(payload.budget_min, payload.budget_max)
    title = payload.title.strip()
    imageurl = (payload.cover_preview or "").strip()
    doc = {
        "owner_user_id": uid,
        "title": title,
        "name": title,
        "short_description": payload.short_description.strip(),
        "detailed_description": payload.detailed_description.strip(),
        "category": payload.category.strip(),
        "sub_category": payload.sub_category.strip(),
        "tags": [t.strip() for t in payload.tags if t.strip()][:12],
        "status": status,
        "status_label": status_to_label(status),
        "progress": 5 if status == "planning" else 15,
        "budget": budget or "$0",
        "team": [],
        "team_extra": 0,
        "deadline": payload.timeline.strip() or "TBD",
        "updated_label": "Just now",
        "icon_tone": "web",
        "featured": False,
        "visibility": payload.visibility.strip() or "public",
        "agency": "Your Studio",
        "verified": True,
        "badges": ["OPEN"],
        "description": payload.short_description.strip(),
        "tasks_count": len(payload.requirements),
        "objectives": payload.objectives.strip(),
        "deliverables": payload.deliverables.strip(),
        "requirements": payload.requirements,
        "roles_needed": payload.roles_needed,
        "skills": payload.skills,
        "tech_stack": [t.strip() for t in payload.tech_stack if t.strip()][:12]
        or [t.strip() for t in payload.skills if t.strip()][:12],
        "experience_level": payload.experience_level.strip(),
        "work_mode": payload.work_mode.strip(),
        "milestones": payload.milestones,
        "selected_template_id": payload.selected_template_id.strip(),
        "cover_preview": imageurl,
        "imageurl": imageurl,
        "pricing_tiers": payload.pricing_tiers or {},
        "package_features": (payload.pricing_tiers or {}).get("standard", {}).get("features", []),
        "rating": 4.8,
        "reviews_count": 0,
        "members": [],
        "contributors": [
            {
                "user_id": uid,
                "name": "Project Owner",
                "avatar": "",
                "role": "owner",
                "joined_at": now.isoformat(),
            }
        ],
        "proposals": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await hub_projects_collection.insert_one(doc)
    created = await hub_projects_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "project": serialize_project(created)}
