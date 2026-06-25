from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from database import hub_project_reviews_collection, hub_project_saved_collection, hub_projects_collection
from .hub_helpers import (
    collaboration_row,
    compute_kpis,
    ensure_seeded,
    featured_from_rows,
    tab_counts,
)
from .hub_schemas import SaveProjectPayload
from .projects_session import assert_actor_id, verify_projects_session
from .serializers import explore_card_from_row, serialize_project, serialize_saved

router = APIRouter()


@router.get("/hub")
async def get_projects_hub(owner_user_id: str = Query(..., min_length=2, max_length=120)):
    uid = owner_user_id.strip()
    await ensure_seeded(uid)
    cursor = hub_projects_collection.find({"owner_user_id": uid}).sort("updated_at", -1)
    rows = [serialize_project(doc) async for doc in cursor]
    counts = tab_counts(rows)
    return {
        "status": "success",
        "kpis": compute_kpis(rows),
        "budget_summary": {"label": "Total Budget", "value": "$48.6K", "delta": "+32% this month"},
        "featured": featured_from_rows(rows),
        "table_rows": rows,
        "table_tabs": [
            {"id": "all", "label": "All Projects", "count": counts["all"]},
            {"id": "in-progress", "label": "In Progress", "count": counts["in-progress"]},
            {"id": "completed", "label": "Completed", "count": counts["completed"]},
            {"id": "on-hold", "label": "On Hold", "count": counts["on-hold"]},
        ],
        "menu_counts": {
            "my-projects": counts["all"],
            "collaborations": max(1, counts["all"] + 4),
            "saved": await hub_project_saved_collection.count_documents({"user_id": uid}),
            "funding": 4,
            "reviews": max(3, await hub_project_reviews_collection.count_documents({"owner_user_id": uid})),
        },
        "activity": [
            {
                "id": f"a{i}",
                "project": r.get("name"),
                "action": "Project updated",
                "time": r.get("updated_label"),
                "tone": "#6366f1",
            }
            for i, r in enumerate(rows[:5])
        ],
    }


@router.get("/my")
async def list_my_projects(
    owner_user_id: str = Query(..., min_length=2, max_length=120),
    tab: str = Query("all"),
):
    uid = owner_user_id.strip()
    await ensure_seeded(uid)
    cursor = hub_projects_collection.find({"owner_user_id": uid}).sort("updated_at", -1)
    rows = [serialize_project(doc) async for doc in cursor]
    if tab == "in-progress":
        rows = [r for r in rows if r.get("status") in ("in-progress", "in-review")]
    elif tab == "completed":
        rows = [r for r in rows if r.get("status") == "completed"]
    elif tab == "on-hold":
        rows = [r for r in rows if r.get("status") == "on-hold"]
    all_rows = [serialize_project(doc) async for doc in hub_projects_collection.find({"owner_user_id": uid})]
    counts = tab_counts(all_rows)
    return {"status": "success", "rows": rows, "tab_counts": counts}


@router.get("/explore")
async def explore_projects(
    owner_user_id: str = Query("", max_length=120),
    q: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
):
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


@router.get("/collaborations")
async def list_collaborations(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = user_id.strip()
    await ensure_seeded(uid)
    owned = [serialize_project(doc) async for doc in hub_projects_collection.find({"owner_user_id": uid})]
    member_rows = [serialize_project(doc) async for doc in hub_projects_collection.find({"members.user_id": uid})]
    seen = set()
    rows = []
    for doc in owned + member_rows:
        if doc["id"] in seen:
            continue
        seen.add(doc["id"])
        rows.append(collaboration_row(doc, uid))
    return {"status": "success", "rows": rows}


@router.get("/saved")
async def list_saved_projects(user_id: str = Query(..., min_length=2, max_length=120)):
    uid = user_id.strip()
    await ensure_seeded(uid)
    cursor = hub_project_saved_collection.find({"user_id": uid}).sort("created_at", -1)
    rows = [serialize_saved(doc) async for doc in cursor]
    return {"status": "success", "rows": rows}


@router.post("/saved")
async def save_project(payload: SaveProjectPayload, user: dict = Depends(verify_projects_session)):
    uid = payload.user_id.strip()
    await assert_actor_id(uid, user)
    pid = payload.project_id.strip()
    existing = await hub_project_saved_collection.find_one({"user_id": uid, "project_id": pid})
    if existing:
        return {"status": "success", "row": serialize_saved(existing)}
    now = datetime.utcnow()
    doc = {
        "user_id": uid,
        "project_id": pid,
        "title": payload.title.strip(),
        "category": payload.category.strip(),
        "owner_name": payload.owner_name.strip(),
        "owner_initials": payload.owner_initials.strip()[:8],
        "icon_tone": payload.icon_tone.strip(),
        "icon_glyph": payload.icon_glyph.strip(),
        "saved_on_label": now.strftime("%b %d, %Y"),
        "created_at": now,
    }
    result = await hub_project_saved_collection.insert_one(doc)
    saved = await hub_project_saved_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "row": serialize_saved(saved)}


@router.delete("/saved/{saved_id}")
async def unsave_project(saved_id: str, user_id: str = Query(..., min_length=2, max_length=120)):
    if not ObjectId.is_valid(saved_id):
        raise HTTPException(status_code=400, detail="Invalid saved id")
    result = await hub_project_saved_collection.delete_one(
        {"_id": ObjectId(saved_id), "user_id": user_id.strip()}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved project not found")
    return {"status": "success", "deleted": True}
