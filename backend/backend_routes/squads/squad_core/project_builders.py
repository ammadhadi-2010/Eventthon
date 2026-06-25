from datetime import datetime
import uuid

from ..squad_shared import CreateProjectPayload, slugify_squad_name

PROJECT_UPDATE_KEYS = [
    "title",
    "status",
    "owner",
    "due_date",
    "progress",
    "tags",
    "description",
    "tech_stack",
    "github_url",
    "live_url",
    "tasks_total",
    "tasks_completed",
    "showroom_views",
    "public_slug",
    "budget_min",
    "budget_max",
    "timeline",
    "detailed_description",
    "pricing_tiers",
    "milestones",
    "experience_level",
    "work_mode",
    "selected_template_id",
    "category",
    "sub_category",
    "cover_preview",
    "objectives",
    "deliverables",
    "requirements",
    "roles_needed",
    "skills",
    "project_type",
    "team_size",
    "start_date",
    "wizard_snapshot",
]


def build_new_project_doc(payload: CreateProjectPayload) -> dict:
    clean_title = (payload.title or "").strip()
    progress = payload.progress
    if progress is not None:
        progress = max(0, min(100, int(progress)))
    tags = payload.tags or []
    tech_stack = payload.tech_stack or tags
    tasks_total = payload.tasks_total if payload.tasks_total is not None else max(8, len(tags) * 2)
    tasks_completed = payload.tasks_completed
    if tasks_completed is None and progress is not None:
        tasks_completed = max(0, min(tasks_total, int(round((progress / 100) * tasks_total))))
    return {
        "id": f"p-{uuid.uuid4().hex[:8]}",
        "title": clean_title,
        "status": payload.status or "Active",
        "owner": payload.owner or "You",
        "due_date": payload.due_date,
        "progress": progress,
        "tags": tags,
        "description": (payload.description or "").strip() or None,
        "tech_stack": tech_stack,
        "github_url": (payload.github_url or "").strip() or None,
        "live_url": (payload.live_url or "").strip() or None,
        "tasks_total": tasks_total,
        "tasks_completed": tasks_completed if tasks_completed is not None else 0,
        "showroom_views": payload.showroom_views if payload.showroom_views is not None else 0,
        "public_slug": (payload.public_slug or slugify_squad_name(clean_title) or "").strip() or None,
        "budget_min": payload.budget_min,
        "budget_max": payload.budget_max,
        "timeline": (payload.timeline or "").strip() or None,
        "detailed_description": (payload.detailed_description or "").strip() or None,
        "pricing_tiers": payload.pricing_tiers or {},
        "milestones": payload.milestones or [],
        "experience_level": (payload.experience_level or "").strip() or None,
        "work_mode": (payload.work_mode or "").strip() or None,
        "selected_template_id": (payload.selected_template_id or "").strip() or None,
        "category": (payload.category or "").strip() or None,
        "sub_category": (payload.sub_category or "").strip() or None,
        "cover_preview": (payload.cover_preview or "").strip() or None,
        "objectives": (payload.objectives or "").strip() or None,
        "deliverables": (payload.deliverables or "").strip() or None,
        "requirements": payload.requirements or [],
        "roles_needed": payload.roles_needed or [],
        "skills": payload.skills or [],
        "project_type": (payload.project_type or "").strip() or None,
        "team_size": (payload.team_size or "").strip() or None,
        "start_date": (payload.start_date or "").strip() or None,
        "wizard_snapshot": payload.wizard_snapshot or {},
        "contributors": [
            {
                "user_id": (payload.owner or "owner")[:120],
                "name": payload.owner or "Owner",
                "avatar": "",
                "role": "owner",
                "joined_at": datetime.utcnow().isoformat(),
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
    }


def upsert_contributor_package(contributors, uid, name, avatar, package_blob):
    out = []
    found = False
    for row in contributors:
        if str(row.get("user_id")) == uid:
            found = True
            out.append(
                {
                    **row,
                    "name": name or row.get("name"),
                    "avatar": avatar or row.get("avatar", ""),
                    "proposal_status": "confirmed",
                    "selected_package": package_blob,
                    "package_key": package_blob["key"],
                }
            )
        else:
            out.append(row)
    if not found:
        out.append(
            {
                "user_id": uid,
                "name": name or "Member",
                "avatar": avatar or "",
                "role": "collaborator",
                "joined_at": datetime.utcnow().isoformat(),
                "proposal_status": "confirmed",
                "selected_package": package_blob,
                "package_key": package_blob["key"],
            }
        )
    return out
