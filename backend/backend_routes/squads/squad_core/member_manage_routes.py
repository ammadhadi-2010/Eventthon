from datetime import datetime

from fastapi import APIRouter, Depends

from ..squads_session import assert_actor_id, assert_squad_leader, verify_squads_session
from ..squad_permissions import assert_hub_member
from ..squad_shared import (
    LeavePayload,
    UpdateMemberRolePayload,
    squad_collection,
    get_squad_or_none,
    create_activity_event,
)

router = APIRouter()


@router.post("/{squad_id}/leave")
async def leave_squad(
    squad_id: str,
    payload: LeavePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_member(squad, user)
    if payload.user_id:
        await assert_actor_id(payload.user_id, user)
        await squad_collection.update_one(
            {"_id": squad_id},
            {
                "$pull": {"members": {"id": payload.user_id}},
                "$push": {
                    "activity_feed": create_activity_event(
                        "member_leave",
                        "A member left the squad",
                        payload.name or "Member",
                    )
                },
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
    elif payload.name:
        await squad_collection.update_one(
            {"_id": squad_id},
            {
                "$pull": {"members": {"name": payload.name}},
                "$push": {
                    "activity_feed": create_activity_event(
                        "member_leave",
                        f"{payload.name} left the squad",
                        payload.name,
                    )
                },
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
    else:
        return {"status": "error", "message": "user_id or name required"}
    return {"status": "success", "message": "Left squad successfully"}


@router.put("/{squad_id}/members/{member_id}/role")
async def update_member_role(
    squad_id: str,
    member_id: str,
    payload: UpdateMemberRolePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    leader_id = str(squad.get("leader_id") or "").strip()
    if leader_id:
        await assert_squad_leader(squad, leader_id, user)
    clean_role = (payload.role or "").strip()
    if not clean_role:
        return {"status": "error", "message": "Role required"}
    members = squad.get("members", [])
    updated_member = None
    new_members = []
    for member in members:
        if member.get("id") == member_id:
            updated_member = {**member, "role": clean_role}
            new_members.append(updated_member)
        else:
            new_members.append(member)
    if not updated_member:
        return {"status": "error", "message": "Member not found"}
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$set": {"members": new_members, "updated_at": datetime.utcnow()},
            "$push": {
                "activity_feed": create_activity_event(
                    "role_change",
                    f"{updated_member.get('name', 'Member')} role changed to {clean_role}",
                    updated_member.get("name", "Member"),
                )
            },
        },
    )
    return {"status": "success", "data": updated_member}


@router.delete("/{squad_id}/members/{member_id}")
async def remove_member(
    squad_id: str,
    member_id: str,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    members = squad.get("members", [])
    if not any(member.get("id") == member_id for member in members):
        return {"status": "error", "message": "Member not found"}
    leader_id = str(squad.get("leader_id") or "").strip()
    if leader_id:
        await assert_squad_leader(squad, leader_id, user)
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$pull": {"members": {"id": member_id}},
            "$push": {"activity_feed": create_activity_event("member_remove", "A member was removed from the squad")},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "message": "Member removed"}
