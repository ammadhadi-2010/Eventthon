from datetime import datetime

from fastapi import APIRouter, Depends

from ..squads_session import verify_squads_session
from ..squad_permissions import (
    optional_verify_squads_session,
    assert_hub_read_access,
    assert_can_manage_settings,
    build_live_activity_kpis,
)
from ..squad_shared import (
    squad_collection,
    get_squad_or_none,
    create_activity_event,
    build_trend_7d,
    build_activity_overview,
    build_top_members,
)

router = APIRouter()


@router.get("/{squad_id}/activity")
async def get_squad_activity(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found", "data": []}
    assert_hub_read_access(squad, user)
    feed = squad.get("activity_feed", [])
    trend = build_trend_7d(feed) if feed else squad.get("trend_7d", [0, 0, 0, 0, 0, 0, 0])
    return {
        "status": "success",
        "data": build_live_activity_kpis(squad),
        "feed": feed[-50:][::-1],
        "overview": build_activity_overview(squad),
        "top_members": build_top_members(squad),
        "trend_7d": trend,
    }


@router.post("/{squad_id}/archive")
async def archive_squad(squad_id: str, user: dict = Depends(verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await assert_can_manage_settings(squad, user)
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"status": "archived", "updated_at": datetime.utcnow()},
            "$push": {"activity_feed": create_activity_event("squad_archive", "Squad was archived")},
        },
    )
    return {"status": "success", "message": "Squad archived"}


@router.delete("/{squad_id}")
async def delete_squad(squad_id: str, user: dict = Depends(verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await assert_can_manage_settings(squad, user)
    await squad_collection.delete_one({"_id": squad_id})
    return {"status": "success", "message": "Squad deleted"}
