from fastapi import APIRouter, Depends, HTTPException, Query

from ..squad_permissions import (
    optional_verify_squads_session,
    assert_hub_read_access,
    build_live_activity_kpis,
    find_member,
    hydrate_squad_members,
    is_pending_squad_invite,
    is_squad_member,
)
from ..squads_session import verify_squads_session
from ..squad_shared import (
    squad_collection,
    ensure_seed_data,
    get_squad_or_none,
    build_squad_summary,
    build_activity_overview,
    build_top_members,
)

router = APIRouter()

_LIST_LIMIT = 100


async def _load_squad_docs():
    await ensure_seed_data()
    pipeline = [
        {"$match": {"status": {"$ne": "archived"}}},
        {
            "$addFields": {
                "members_count": {"$size": {"$ifNull": ["$members", []]}},
                "projects_count": {"$size": {"$ifNull": ["$projects", []]}},
                "online": {
                    "$size": {
                        "$filter": {
                            "input": {"$ifNull": ["$members", []]},
                            "as": "member",
                            "cond": {"$eq": ["$$member.online", True]},
                        }
                    }
                },
                "members": {
                    "$map": {
                        "input": {"$ifNull": ["$members", []]},
                        "as": "member",
                        "in": {
                            "id": "$$member.id",
                            "name": "$$member.name",
                            "email": "$$member.email",
                            "mobile": "$$member.mobile",
                            "role": "$$member.role",
                            "online": "$$member.online",
                            "invite_status": "$$member.invite_status",
                        },
                    }
                },
                "projects": [],
            }
        },
        {
            "$project": {
                "_id": 1,
                "squad_name": 1,
                "niche": 1,
                "description": 1,
                "efficiency": 1,
                "icon": 1,
                "banner": 1,
                "imageurl": 1,
                "leader_id": 1,
                "settings": 1,
                "slug": 1,
                "created_at": 1,
                "members": 1,
                "members_count": 1,
                "projects_count": 1,
                "online": 1,
            }
        },
        {"$sort": {"created_at": -1}},
        {"$limit": _LIST_LIMIT},
    ]
    return await squad_collection.aggregate(pipeline).to_list(length=_LIST_LIMIT)


def _partition_squads(squads: list, user: dict | None):
    summaries = [build_squad_summary(squad) for squad in squads]
    if not user:
        return {
            "all": summaries,
            "mine": [],
            "invites": [],
            "counts": {"all": len(summaries), "mine": 0, "invites": 0},
        }
    mine = []
    invites = []
    others = []
    for squad, summary in zip(squads, summaries):
        if is_pending_squad_invite(squad, user):
            invites.append({**summary, "membership": "pending"})
        elif is_squad_member(squad, user):
            mine.append({**summary, "membership": "member"})
        else:
            others.append({**summary, "membership": "public"})
    all_rows = mine + invites + others
    return {
        "all": all_rows,
        "mine": mine,
        "invites": invites,
        "counts": {
            "all": len(all_rows),
            "mine": len(mine),
            "invites": len(invites),
        },
    }


async def fetch_all_squads(user: dict | None = None):
    squads = await _load_squad_docs()
    partitioned = _partition_squads(squads, user)
    if user:
        return partitioned["mine"] + partitioned["invites"] + [
            row for row in partitioned["all"] if row.get("membership") == "public"
        ]
    return partitioned["all"]


async def fetch_squads_hub(user: dict | None = None, scope: str = "all"):
    squads = await _load_squad_docs()
    partitioned = _partition_squads(squads, user)
    key = (scope or "all").strip().lower()
    if key == "mine":
        rows = partitioned["mine"]
    elif key in ("invites", "invite"):
        rows = partitioned["invites"]
    else:
        rows = partitioned["all"]
    return {
        "status": "success",
        "scope": key if key in ("mine", "invites", "invite") else "all",
        "squads": rows,
        "counts": partitioned["counts"],
        "total": len(rows),
    }


@router.get("/invites/mine")
async def list_my_squad_invites(user: dict = Depends(verify_squads_session)):
    payload = await fetch_squads_hub(user, scope="invites")
    return {
        "status": "success",
        "invites": payload["squads"],
        "total": payload["total"],
    }


@router.get("/all")
async def get_all_squads(
    scope: str = Query("all"),
    user: dict | None = Depends(optional_verify_squads_session),
):
    return await fetch_squads_hub(user, scope=scope)


@router.get("/{squad_id}/invite-preview")
async def get_squad_invite_preview(
    squad_id: str,
    user: dict = Depends(verify_squads_session),
):
    """Preview a squad before accepting an invite — About, projects, members, stats."""
    squad = await get_squad_or_none(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    if not is_pending_squad_invite(squad, user) and not is_squad_member(squad, user):
        raise HTTPException(status_code=403, detail="Only invited users can preview this squad.")

    members = await hydrate_squad_members(squad.get("members", []))
    accepted = [
        m
        for m in members
        if str(m.get("invite_status") or "accepted").lower() in ("accepted", "", "active")
    ]
    invite_row = find_member(squad, user) or {}
    summary = build_squad_summary({**squad, "members": accepted})
    projects = list(squad.get("projects") or [])[:6]
    live = {**squad, "members": accepted}
    return {
        "status": "success",
        "data": {
            **summary,
            "description": squad.get("description") or "",
            "invite_role": invite_row.get("role") or "Member",
            "invite_status": invite_row.get("invite_status") or "pending",
            "membership": "pending" if is_pending_squad_invite(squad, user) else "member",
            "projects": [
                {
                    "id": p.get("id") or p.get("_id"),
                    "title": p.get("title") or p.get("name") or "Project",
                    "status": p.get("status") or "Active",
                    "progress": p.get("progress"),
                    "tags": p.get("tags") or [],
                }
                for p in projects
                if isinstance(p, dict)
            ],
            "top_members": build_top_members(live)[:6],
            "activity_overview": build_activity_overview(live),
            "rating": squad.get("rating") or squad.get("average_rating") or None,
            "times_hired": squad.get("times_hired") or 0,
            "success_rate": squad.get("success_rate") or squad.get("efficiency"),
            "can_accept": is_pending_squad_invite(squad, user),
        },
    }


@router.get("/{squad_id}/workspace")
async def get_squad_workspace(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    """Single payload for squad hub — one DB round-trip, capped messages."""
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_read_access(squad, user)
    messages = list(squad.get("messages") or [])[-80:]
    feed = list(squad.get("activity_feed") or [])[-50:]
    feed.reverse()
    members = await hydrate_squad_members(squad.get("members", []))
    live_squad = {**squad, "members": members, "messages": messages}
    return {
        "status": "success",
        "data": {
            "messages": messages,
            "members": members,
            "projects": squad.get("projects", []),
            "files": squad.get("files", []),
            "activity": build_live_activity_kpis(live_squad),
            "activity_feed": feed,
            "activity_overview": build_activity_overview(live_squad),
            "top_members": build_top_members(live_squad),
        },
    }


@router.get("/{squad_id}")
async def get_squad_detail(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"error": "Squad not found"}
    assert_hub_read_access(squad, user)
    members = await hydrate_squad_members(squad.get("members", []))
    hydrated_squad = {**squad, "members": members}
    detail = build_squad_summary(hydrated_squad)
    detail["projects"] = squad.get("projects", [])
    detail["files"] = squad.get("files", [])
    detail["activity"] = build_live_activity_kpis(hydrated_squad)
    detail["trend_7d"] = squad.get("trend_7d", [0, 0, 0, 0, 0, 0, 0])
    detail["activity_feed"] = list(squad.get("activity_feed") or [])[-50:]
    return detail
