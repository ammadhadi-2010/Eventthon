"""Company team management HTTP routes."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .team_actions import (
    accept_invite,
    change_member_role,
    decline_invite,
    remove_member,
    revoke_invite,
    set_member_status,
    transfer_ownership,
)
from .team_service import (
    build_team_payload,
    get_invite_by_token,
    invite_member,
    list_my_pending_invites,
)
from .team_roles import role_label

router = APIRouter(prefix="/company-portal/team", tags=["Company Team"])


class InviteBody(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=180)
    role: str = Field(..., min_length=3, max_length=40)


class UserTokenBody(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)


class RoleBody(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    role: str = Field(..., min_length=3, max_length=40)


class SuspendBody(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    reason: str = Field("", max_length=300)


class TransferBody(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    target_member_id: str = Field(..., min_length=2, max_length=64)
    confirmation_email: str = Field(..., min_length=5, max_length=180)


@router.get("")
async def team_overview(user_id: str):
    data = await build_team_payload(user_id)
    return {"status": "success", "data": data}


@router.post("/invite")
async def team_invite(body: InviteBody):
    data = await invite_member(body.user_id, body.email, body.role)
    return {"status": "success", "data": data, "message": "Invitation sent."}


@router.get("/invites/mine")
async def team_invites_mine(user_id: str):
    data = await list_my_pending_invites(user_id)
    return {"status": "success", "data": data}


@router.get("/invites/{token}")
async def team_invite_preview(token: str):
    invite = await get_invite_by_token(token)
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    return {
        "status": "success",
        "data": {
            "email": invite.get("email"),
            "role": invite.get("role"),
            "roleLabel": role_label(invite.get("role") or ""),
            "companyName": invite.get("company_name"),
            "invitedBy": invite.get("invited_by_name"),
            "inviteStatus": invite.get("status"),
            "userExists": bool(invite.get("user_exists")),
            "token": invite.get("token"),
        },
    }


@router.post("/invites/{token}/accept")
async def team_invite_accept(token: str, body: UserTokenBody):
    data = await accept_invite(body.user_id, token)
    return {"status": "success", "data": data, "message": "You joined the company team."}


@router.post("/invites/{token}/decline")
async def team_invite_decline(token: str, body: UserTokenBody):
    data = await decline_invite(body.user_id, token)
    return {"status": "success", "data": data}


@router.post("/invites/{invite_id}/revoke")
async def team_invite_revoke(invite_id: str, body: UserTokenBody):
    data = await revoke_invite(body.user_id, invite_id)
    return {"status": "success", "data": data}


@router.post("/members/{member_id}/role")
async def team_member_role(member_id: str, body: RoleBody):
    data = await change_member_role(body.user_id, member_id, body.role)
    return {"status": "success", "data": data}


@router.post("/members/{member_id}/suspend")
async def team_member_suspend(member_id: str, body: SuspendBody):
    data = await set_member_status(body.user_id, member_id, "suspended", body.reason)
    return {"status": "success", "data": data}


@router.post("/members/{member_id}/unsuspend")
async def team_member_unsuspend(member_id: str, body: UserTokenBody):
    data = await set_member_status(body.user_id, member_id, "active")
    return {"status": "success", "data": data}


@router.post("/members/{member_id}/remove")
async def team_member_remove(member_id: str, body: UserTokenBody):
    data = await remove_member(body.user_id, member_id)
    return {"status": "success", "data": data}


@router.post("/transfer-ownership")
async def team_transfer(body: TransferBody):
    data = await transfer_ownership(body.user_id, body.target_member_id, body.confirmation_email)
    return {"status": "success", "data": data, "message": "Ownership transferred."}
