from database import hub_project_saved_collection, hub_projects_collection
from .seed import build_seed_projects, build_seed_saved
from .serializers import serialize_project


def budget_label(bmin: str, bmax: str) -> str:
    try:
        a = float(bmin or 0)
        b = float(bmax or 0)
    except ValueError:
        return ""
    if not a and not b:
        return ""
    if not b or b <= a:
        return f"${int(a):,}"
    return f"${int(a):,} - ${int(b):,}"


async def ensure_seeded(owner_user_id: str) -> None:
    uid = owner_user_id.strip()
    count = await hub_projects_collection.count_documents({"owner_user_id": uid})
    if count > 0:
        return
    docs = build_seed_projects(uid)
    if docs:
        await hub_projects_collection.insert_many(docs)
    project_ids = [
        str(p["_id"])
        async for p in hub_projects_collection.find({"owner_user_id": uid}, {"_id": 1}).limit(3)
    ]
    saved = build_seed_saved(uid, project_ids)
    if saved:
        await hub_project_saved_collection.insert_many(saved)


def tab_counts(rows: list[dict]) -> dict[str, int]:
    all_n = len(rows)
    in_prog = sum(1 for r in rows if r.get("status") in ("in-progress", "in-review"))
    done = sum(1 for r in rows if r.get("status") == "completed")
    hold = sum(1 for r in rows if r.get("status") == "on-hold")
    return {"all": all_n, "in-progress": in_prog, "completed": done, "on-hold": hold}


def compute_kpis(rows: list[dict]) -> list[dict]:
    total = len(rows)
    in_prog = sum(1 for r in rows if r.get("status") in ("in-progress", "in-review"))
    done = sum(1 for r in rows if r.get("status") == "completed")
    hold = sum(1 for r in rows if r.get("status") == "on-hold")
    return [
        {"id": "total", "label": "Total Projects", "value": str(total), "delta": "+20% this month", "tone": "violet"},
        {"id": "progress", "label": "In Progress", "value": str(in_prog), "delta": "+4 this week", "tone": "blue"},
        {"id": "done", "label": "Completed", "value": str(done), "delta": "+3 this week", "tone": "green"},
        {"id": "hold", "label": "On Hold", "value": str(hold), "delta": "-1 this week", "tone": "red"},
    ]


def featured_from_rows(rows: list[dict]) -> list[dict]:
    featured = [r for r in rows if r.get("featured")]
    if not featured:
        featured = rows[:4]
    out = []
    for r in featured[:4]:
        out.append(
            {
                "id": r["id"],
                "title": r.get("title") or r.get("name"),
                "description": r.get("short_description") or r.get("description", ""),
                "agency": r.get("agency", "Studio"),
                "verified": r.get("verified", True),
                "badges": r.get("badges") or ["FEATURED"],
                "progress": r.get("progress", 0),
                "budget": r.get("budget", ""),
                "tasks": r.get("tasks_count", 0),
                "team": r.get("team", []),
                "tone": r.get("icon_tone", "web"),
                "pricing_tiers": r.get("pricing_tiers"),
            }
        )
    return out


def collaboration_row(doc: dict, user_id: str) -> dict:
    owner_name = doc.get("owner_display") or "Owner"
    is_owner = doc.get("owner_user_id") == user_id
    member = next((m for m in doc.get("members", []) if m.get("user_id") == user_id), None)
    role = "Owner - Project Lead" if is_owner else f"Collaborator - {member.get('role', 'Member') if member else 'Member'}"
    return {
        "id": doc["id"],
        "name": doc.get("name") or doc.get("title"),
        "roleLabel": role,
        "roleType": "owner" if is_owner else "collaborator",
        "ownerName": "You" if is_owner else owner_name,
        "ownerInitials": "Y" if is_owner else owner_name[:2].upper(),
        "ownerIsYou": is_owner,
        "team": doc.get("team", []),
        "teamExtra": doc.get("team_extra", 0),
        "progress": doc.get("progress", 0),
        "progressTone": "green" if doc.get("progress", 0) >= 80 else "blue",
        "lastActivity": doc.get("updated_label", ""),
        "iconTone": doc.get("icon_tone", "web"),
        "iconGlyph": doc.get("icon_glyph", ""),
    }


async def load_owner_rows(owner_user_id: str) -> list[dict]:
    uid = owner_user_id.strip()
    await ensure_seeded(uid)
    cursor = hub_projects_collection.find({"owner_user_id": uid}).sort("updated_at", -1)
    return [serialize_project(doc) async for doc in cursor]


_ACTIVITY_TYPES = ("updates", "milestones", "tasks", "comments")
_ACTIVITY_ACTIONS = {
    "updates": "Project updated",
    "milestones": "Milestone completed",
    "tasks": "Task assigned",
    "comments": "Comment added",
}
_ACTIVITY_TONES = ("#8b5cf6", "#22c55e", "#3b82f6", "#06b6d4", "#f59e0b")


def build_activity_feed(rows: list[dict]) -> list[dict]:
    feed = []
    for i, row in enumerate(rows):
        kind = _ACTIVITY_TYPES[i % len(_ACTIVITY_TYPES)]
        feed.append(
            {
                "id": f"af-{row['id']}-{i}",
                "type": kind,
                "projectId": row["id"],
                "project": row.get("title") or row.get("name"),
                "action": _ACTIVITY_ACTIONS[kind],
                "detail": (row.get("short_description") or row.get("description") or "")[:160],
                "time": row.get("updated_label", "Recently"),
                "tone": _ACTIVITY_TONES[i % len(_ACTIVITY_TONES)],
            }
        )
    return feed


def build_top_collaborators(rows: list[dict], owner_user_id: str) -> list[dict]:
    people: dict[str, dict] = {}
    owner_id = owner_user_id.strip()
    for row in rows:
        for contributor in row.get("contributors") or []:
            uid = str(contributor.get("user_id") or "").strip()
            if not uid or uid == owner_id:
                continue
            name = (contributor.get("name") or "Collaborator").strip()
            role = (contributor.get("role") or "collaborator").strip()
            group = "owners" if role == "owner" else "contributors"
            entry = people.setdefault(
                uid,
                {
                    "id": uid,
                    "name": name,
                    "title": role.replace("_", " ").title(),
                    "projects": 0,
                    "contributions": 0,
                    "impact": 72,
                    "rating": 4.6,
                    "group": group,
                },
            )
            entry["projects"] += 1
            entry["contributions"] += 8
            entry["impact"] = min(99, entry["impact"] + 4)
            entry["rating"] = round(min(5.0, entry["rating"] + 0.05), 1)
    ranked = sorted(people.values(), key=lambda item: item["contributions"], reverse=True)
    for idx, item in enumerate(ranked):
        if idx >= 3 and item["group"] == "contributors":
            item["group"] = "rising"
    return ranked
