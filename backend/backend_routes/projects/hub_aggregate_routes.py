"""Static project hub paths — must register before /{project_id} routes."""

from fastapi import APIRouter, Query

from database import hub_projects_collection
from .hub_helpers import (
    build_activity_feed,
    build_top_collaborators,
    compute_kpis,
    ensure_seeded,
    load_owner_rows,
)
from .serializers import serialize_project

router = APIRouter(prefix="/projects", tags=["Projects Hub"])


def _milestone_label(item) -> str:
    if isinstance(item, str):
        return item.strip() or "Milestone"
    if isinstance(item, dict):
        return str(item.get("title") or item.get("name") or item.get("milestone") or "Milestone").strip()
    return "Milestone"


@router.get("/funding")
async def list_funding(owner_user_id: str = Query(..., min_length=2, max_length=120)):
    await ensure_seeded(owner_user_id.strip())
    cursor = hub_projects_collection.find({"owner_user_id": owner_user_id.strip()}).limit(6)
    campaigns = []
    async for doc in cursor:
        row = serialize_project(doc)
        goal = float(doc.get("funding_goal") or 10000)
        raised = float(doc.get("funding_raised") or goal * 0.4)
        campaigns.append(
            {
                "id": row["id"],
                "title": row.get("title"),
                "goal": f"${int(goal):,}",
                "raised": f"${int(raised):,}",
                "raisedPct": min(100, int((raised / goal) * 100)) if goal else 0,
                "backers": len(row.get("team", [])) * 3 + 2,
                "status": "active" if row.get("status") != "completed" else "completed",
                "endsIn": "12 days",
            }
        )
    return {"status": "success", "campaigns": campaigns}


@router.get("/milestones")
async def list_milestones(owner_user_id: str = Query(..., min_length=2, max_length=120)):
    rows_raw = await load_owner_rows(owner_user_id)
    rows = []
    project_options = [{"id": r["id"], "label": r.get("title") or r.get("name")} for r in rows_raw[:12]]
    cursor = hub_projects_collection.find({"owner_user_id": owner_user_id.strip()}).limit(8)
    async for doc in cursor:
        row = serialize_project(doc)
        project_title = row.get("title") or row.get("name") or "Project"
        milestone_items = doc.get("milestones") or ["Kickoff", "MVP", "Launch"]
        for idx, item in enumerate(milestone_items[:3]):
            label = _milestone_label(item)
            rows.append(
                {
                    "id": f"{row['id']}-m{idx}",
                    "projectId": row["id"],
                    "milestone": label,
                    "title": label,
                    "project": project_title,
                    "projectName": project_title,
                    "dueDate": row.get("deadline", "TBD"),
                    "status": "done" if row.get("progress", 0) > (idx + 1) * 30 else "pending",
                    "progress": min(100, row.get("progress", 0)),
                }
            )
    return {"status": "success", "rows": rows, "project_options": project_options}


@router.get("/reports")
async def get_reports(owner_user_id: str = Query(..., min_length=2, max_length=120)):
    rows = await load_owner_rows(owner_user_id)
    kpis = compute_kpis(rows)
    return {
        "status": "success",
        "overview": {
            "kpis": kpis,
            "progress_slices": [
                {"label": "Completed", "value": sum(1 for r in rows if r.get("status") == "completed"), "tone": "green"},
                {
                    "label": "In Progress",
                    "value": sum(1 for r in rows if r.get("status") in ("in-progress", "in-review")),
                    "tone": "blue",
                },
                {"label": "On Hold", "value": sum(1 for r in rows if r.get("status") == "on-hold"), "tone": "red"},
            ],
        },
        "team": {"members": build_top_collaborators(rows, owner_user_id)[:8]},
        "financials": {
            "budget_total": sum(
                float("".join(ch for ch in str(r.get("budget") or "0") if ch.isdigit()) or 0) for r in rows
            ),
            "campaigns": len(rows),
        },
    }


@router.get("/activity")
async def list_activity(owner_user_id: str = Query(..., min_length=2, max_length=120)):
    rows = await load_owner_rows(owner_user_id)
    feed = build_activity_feed(rows)
    projects = [{"id": r["id"], "label": r.get("title") or r.get("name")} for r in rows]
    return {"status": "success", "feed": feed, "projects": projects}


@router.get("/top-collaborators")
async def list_top_collaborators(owner_user_id: str = Query(..., min_length=2, max_length=120)):
    rows = await load_owner_rows(owner_user_id)
    collaborators = build_top_collaborators(rows, owner_user_id)
    return {"status": "success", "collaborators": collaborators}
