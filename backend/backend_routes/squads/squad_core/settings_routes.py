from datetime import datetime

from fastapi import APIRouter, Depends

from ..squads_session import verify_squads_session
from ..squad_permissions import optional_verify_squads_session, assert_hub_read_access, assert_can_manage_settings
from ..squad_shared import (
    UpdateSquadInfoPayload,
    UpdateSquadSettingsPayload,
    squad_collection,
    get_squad_or_none,
    build_squad_summary,
    normalize_squad_settings,
    create_activity_event,
    slugify_squad_name,
)

router = APIRouter()


@router.get("/{squad_id}/settings")
async def get_squad_settings(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found", "data": normalize_squad_settings(None)}
    assert_hub_read_access(squad, user)
    settings = normalize_squad_settings(squad.get("settings"))
    return {"status": "success", "data": settings}


@router.put("/{squad_id}/settings")
async def update_squad_settings(
    squad_id: str,
    payload: UpdateSquadSettingsPayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await assert_can_manage_settings(squad, user)
    settings = normalize_squad_settings(payload.settings)
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"settings": settings, "updated_at": datetime.utcnow()},
            "$push": {"activity_feed": create_activity_event("settings_update", "Squad settings were updated")},
        },
    )
    return {"status": "success", "data": settings}


@router.put("/{squad_id}/info")
async def update_squad_info(
    squad_id: str,
    payload: UpdateSquadInfoPayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await assert_can_manage_settings(squad, user)
    updates = {}
    if payload.squad_name is not None:
        clean_name = payload.squad_name.strip()
        if not clean_name:
            return {"status": "error", "message": "Squad name required"}
        updates["squad_name"] = clean_name
        updates["icon"] = clean_name[0].upper()
        updates["slug"] = slugify_squad_name(clean_name)
    if payload.niche is not None:
        updates["niche"] = payload.niche.strip()
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if not updates:
        return {"status": "success", "data": build_squad_summary(squad)}

    updates["updated_at"] = datetime.utcnow()
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": updates,
            "$push": {"activity_feed": create_activity_event("squad_info_update", "Squad information was updated")},
        },
    )
    updated = await get_squad_or_none(squad_id)
    return {"status": "success", "data": build_squad_summary(updated)}
