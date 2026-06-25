from fastapi import APIRouter, Depends

from ..squad_permissions import (
    optional_verify_squads_session,
    assert_hub_read_access,
    build_live_activity_kpis,
    hydrate_squad_members,
    is_squad_member,
)
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


async def fetch_all_squads(user: dict | None = None):
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
    squads = await squad_collection.aggregate(pipeline).to_list(length=_LIST_LIMIT)
    summaries = [build_squad_summary(squad) for squad in squads]
    if user:
        mine = []
        others = []
        for squad, summary in zip(squads, summaries):
            if is_squad_member(squad, user):
                mine.append(summary)
            else:
                others.append(summary)
        return mine + others
    return summaries


@router.get("/all")
async def get_all_squads(user: dict | None = Depends(optional_verify_squads_session)):
    return await fetch_all_squads(user)


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
