from datetime import datetime
import uuid

from fastapi import APIRouter, Depends

from backend_routes.alerts.alert_factory import push_alert

from ..squads_chat_context import build_squad_invite_chat_context
from ..squads_session import assert_actor_id, assert_squad_leader, verify_squads_session
from ..squad_permissions import assert_can_invite, hydrate_squad_members, resolve_session_user_id
from ..squad_shared import (
    InvitePayload,
    InviteRespondPayload,
    squad_collection,
    get_squad_or_none,
    normalize_member_avatar,
    create_activity_event,
)

router = APIRouter()


@router.post("/{squad_id}/invite")
async def invite_squad_member(
    squad_id: str,
    payload: InvitePayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    await assert_can_invite(squad, user)
    clean_name = (payload.name or "").strip()
    if not clean_name:
        return {"status": "error", "message": "Member name required"}
    member_id = (payload.invitee_user_id or "").strip() or f"m-{uuid.uuid4().hex[:8]}"
    clean_role = payload.role or "Member"
    inviter_id = (payload.invited_by or resolve_session_user_id(user)).strip()
    hydrated = await hydrate_squad_members([{"id": member_id, "name": clean_name}])
    profile = hydrated[0] if hydrated else {}
    new_member = {
        "id": member_id,
        "name": profile.get("name") or clean_name,
        "email": profile.get("email"),
        "mobile": profile.get("mobile"),
        "role": clean_role,
        "online": False,
        "invite_status": "pending",
        "invited_by": inviter_id,
        "avatar": profile.get("avatar") or normalize_member_avatar({"name": clean_name}),
    }
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$push": {
                "members": new_member,
                "activity_feed": create_activity_event(
                    "member_invite",
                    f"{clean_name} was invited to the squad",
                    clean_name,
                ),
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    squad_name = squad.get("squad_name") or "Squad"
    leader_id = str(squad.get("leader_id") or inviter_id or "").strip()
    if member_id and leader_id and member_id != leader_id:
        await push_alert(
            recipient_identifier=member_id,
            category="squad",
            title=f"Squad invitation: {squad_name}",
            message=f"You were invited to join \"{squad_name}\" as {clean_role}.",
            details="Open Squads to accept or discuss in Messages.",
            actor_name=clean_name,
            action_label="View Squad",
            action_url=f"/squads?squad={squad_id}",
        )
    ctx = build_squad_invite_chat_context(
        squad_id=str(squad_id),
        squad_name=squad_name,
        leader_user_id=leader_id,
        invitee_user_id=member_id,
        invitee_name=clean_name,
        role=clean_role,
    )
    return {
        "status": "success",
        "data": new_member,
        "messages_route": "/messages",
        "chat_context": ctx,
    }


@router.post("/approve")
async def approve_squad_invite(
    squad_id: str,
    member_mobile: str,
    action: str,
    user: dict = Depends(verify_squads_session),
):
    """Accept or reject a pending squad invitation (by member id or mobile)."""
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    leader_id = str(squad.get("leader_id") or "").strip()
    if leader_id:
        await assert_squad_leader(squad, leader_id, user)
    key = (member_mobile or "").strip()
    if not key:
        return {"status": "error", "message": "member_mobile required"}
    members = squad.get("members", [])
    target = next(
        (m for m in members if str(m.get("mobile") or "") == key or str(m.get("id") or "") == key),
        None,
    )
    if not target:
        return {"status": "error", "message": "Member not found"}
    member_id = target.get("id")
    if action == "approve":
        new_members = []
        for member in members:
            if member.get("id") == member_id:
                updated = {**member, "invite_status": "accepted", "online": True}
                new_members.append(updated)
            else:
                new_members.append(member)
        await squad_collection.update_one(
            {"_id": squad_id},
            {"$set": {"members": new_members, "updated_at": datetime.utcnow()}},
        )
        return {"status": "success", "message": "Invitation accepted"}
    if action == "reject":
        await squad_collection.update_one(
            {"_id": squad_id},
            {
                "$pull": {"members": {"id": member_id}},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
        return {"status": "success", "message": "Invitation declined"}
    return {"status": "error", "message": "action must be approve or reject"}


@router.post("/{squad_id}/invites/respond")
async def respond_squad_invite(
    squad_id: str,
    payload: InviteRespondPayload,
    user: dict = Depends(verify_squads_session),
):
    """Invitee accepts or declines their own squad invitation."""
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    uid = (payload.user_id or resolve_session_user_id(user)).strip()
    if not uid:
        return {"status": "error", "message": "user_id required"}
    await assert_actor_id(uid, user)
    members = squad.get("members", [])
    target = next((m for m in members if str(m.get("id") or "") == uid), None)
    if not target:
        return {"status": "error", "message": "Invitation not found"}
    action = str(payload.action or "").strip().lower()
    if action == "accept":
        new_members = []
        for member in members:
            if str(member.get("id") or "") == uid:
                new_members.append({**member, "invite_status": "accepted", "online": True})
            else:
                new_members.append(member)
        await squad_collection.update_one(
            {"_id": squad_id},
            {
                "$set": {"members": new_members, "updated_at": datetime.utcnow()},
                "$push": {
                    "activity_feed": create_activity_event(
                        "member_join",
                        f"{target.get('name', 'Member')} joined the squad",
                        target.get("name", "Member"),
                    )
                },
            },
        )
        return {"status": "success", "message": "Invitation accepted"}
    if action in ("reject", "decline"):
        await squad_collection.update_one(
            {"_id": squad_id},
            {
                "$pull": {"members": {"id": uid}},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
        return {"status": "success", "message": "Invitation declined"}
    return {"status": "error", "message": "action must be accept or reject"}
