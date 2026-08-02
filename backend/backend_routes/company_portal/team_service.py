"""Company team invite + membership mutations."""
from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException

from database import company_invites_collection, company_members_collection, user_collection
from backend_routes.alerts.alert_factory import push_alert

from .portal_resolve import ensure_company_for_user, find_user, primary_owner_key
from .team_audit import write_audit
from .team_email import send_team_invite_email
from .team_members import (
    clear_user_company_link,
    ensure_owner_membership,
    find_active_membership,
    find_member_by_id,
    get_actor_membership,
    list_members,
    serialize_member,
    set_user_company_link,
    user_email,
    user_public_name,
)
from .team_roles import (
    TEAM_ROLES,
    assert_invitable_role,
    can_invite_role,
    has_permission,
    normalize_role,
    permissions_for,
    role_label,
    roles_catalog,
    P_INVITE,
    P_MANAGE_ROLES,
    P_REMOVE_MEMBERS,
    P_SUSPEND_MEMBERS,
    P_TRANSFER_OWNERSHIP,
    P_VIEW_AUDIT,
    P_VIEW_TEAM,
)
from .team_audit import list_audit

INVITE_DAYS = 14


def _frontend_base() -> str:
    return (
        os.getenv("FRONTEND_URL")
        or os.getenv("PUBLIC_APP_URL")
        or "http://localhost:3000"
    ).rstrip("/")


def _serialize_invite(doc: dict) -> dict:
    return {
        "id": str(doc.get("_id") or ""),
        "email": doc.get("email") or "",
        "role": doc.get("role") or "",
        "roleLabel": role_label(doc.get("role") or ""),
        "status": doc.get("status") or "pending",
        "token": doc.get("token") or "",
        "companyId": str(doc.get("company_id") or ""),
        "companyName": doc.get("company_name") or "",
        "invitedBy": doc.get("invited_by_name") or doc.get("invited_by_email") or "",
        "createdAt": str(doc.get("created_at") or ""),
        "expiresAt": str(doc.get("expires_at") or ""),
        "userExists": bool(doc.get("user_exists")),
    }


async def _require_actor(user_id: str):
    """Resolve company via membership or ownership — never invent a company for invitees."""
    from .portal_resolve import resolve_company_for_user
    from .team_members import find_company_by_id

    user = await find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    active = await find_active_membership(user)
    if active:
        company = await find_company_by_id(str(active.get("company_id") or ""))
        if not company:
            raise HTTPException(status_code=404, detail="Company workspace not found.")
        await ensure_owner_membership(company)
        membership = await get_actor_membership(str(company["_id"]), user)
        if not membership or membership.get("status") == "suspended":
            raise HTTPException(status_code=403, detail="You are not an active company member.")
        return user, company, membership

    company = await resolve_company_for_user(user_id)
    if not company:
        role = str(user.get("role") or "").strip().lower()
        if role in ("employer", "company", "admin"):
            company = await ensure_company_for_user(user_id)
        else:
            raise HTTPException(
                status_code=403,
                detail="Join a company through an invitation to access team management.",
            )
    if not company:
        raise HTTPException(status_code=404, detail="Company workspace not found.")
    await ensure_owner_membership(company)
    membership = await get_actor_membership(str(company["_id"]), user)
    if not membership or membership.get("status") == "suspended":
        raise HTTPException(status_code=403, detail="You are not an active company member.")
    return user, company, membership


def _require_perm(membership: dict, permission: str) -> None:
    if not has_permission(membership.get("role") or "", permission):
        raise HTTPException(status_code=403, detail="You do not have permission for this action.")


async def build_team_payload(user_id: str) -> dict:
    user, company, membership = await _require_actor(user_id)
    _require_perm(membership, P_VIEW_TEAM)
    cid = str(company["_id"])
    role = normalize_role(membership.get("role") or "viewer")
    pending = []
    async for doc in company_invites_collection.find(
        {"company_id": cid, "status": "pending"}
    ).sort("created_at", -1):
        pending.append(_serialize_invite(doc))
    audit = await list_audit(cid) if has_permission(role, P_VIEW_AUDIT) else []
    return {
        "companyId": cid,
        "companyName": company.get("name") or "Company",
        "me": serialize_member(membership),
        "permissions": sorted(permissions_for(role)),
        "roles": roles_catalog(),
        "activeMembers": await list_members(cid, "active"),
        "suspendedMembers": await list_members(cid, "suspended"),
        "pendingInvites": pending,
        "auditLogs": audit,
        "canInvite": has_permission(role, P_INVITE),
    }


async def invite_member(user_id: str, email: str, role: str) -> dict:
    user, company, membership = await _require_actor(user_id)
    _require_perm(membership, P_INVITE)
    if not can_invite_role(membership.get("role") or "", role):
        raise HTTPException(status_code=403, detail="Only the Owner can invite members.")
    try:
        role_key = assert_invitable_role(role)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    clean_email = str(email or "").strip().lower()
    if "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if clean_email == user_email(user):
        raise HTTPException(status_code=400, detail="You cannot invite yourself.")

    cid = str(company["_id"])
    existing_member = await company_members_collection.find_one(
        {"company_id": cid, "email": clean_email, "status": {"$in": ["active", "suspended"]}}
    )
    if existing_member:
        raise HTTPException(status_code=400, detail="This person is already a company member.")

    pending = await company_invites_collection.find_one(
        {"company_id": cid, "email": clean_email, "status": "pending"}
    )
    if pending:
        raise HTTPException(status_code=400, detail="An invitation is already pending for this email.")

    target_user = await user_collection.find_one({"email": clean_email})
    token = secrets.token_urlsafe(32)
    now = datetime.utcnow()
    expires = now + timedelta(days=INVITE_DAYS)
    company_name = str(company.get("name") or "Company")
    inviter_name = user_public_name(user, "Owner")
    invite_doc = {
        "company_id": cid,
        "email": clean_email,
        "role": role_key,
        "token": token,
        "status": "pending",
        "user_exists": bool(target_user),
        "invited_by_user_id": str(user.get("_id") or ""),
        "invited_by_email": user_email(user),
        "invited_by_name": inviter_name,
        "company_name": company_name,
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
    }
    result = await company_invites_collection.insert_one(invite_doc)
    invite_doc["_id"] = result.inserted_id

    accept_url = f"{_frontend_base()}/company/invite/{token}"
    signup_url = f"{_frontend_base()}/auth/signin?invite={token}&email={clean_email}"
    try:
        await send_team_invite_email(
            clean_email,
            company_name=company_name,
            inviter_name=inviter_name,
            role_label=role_label(role_key),
            accept_url=accept_url,
            signup_url=signup_url,
            is_existing_user=bool(target_user),
        )
    except Exception:
        # Keep invite even if SMTP fails — in-app path still works for existing users
        pass

    if target_user:
        await push_alert(
            recipient_identifier=clean_email,
            category="company",
            title=f"Invitation to join {company_name}",
            message=f"{inviter_name} invited you as {role_label(role_key)}.",
            details="Accept or decline from the invitation page.",
            actor_name=inviter_name,
            priority="high",
            action_label="Review invite",
            action_url=f"/company/invite/{token}",
            audience="member",
        )

    await write_audit(
        company_id=cid,
        action="invite_sent",
        actor_user_id=str(user.get("_id") or ""),
        actor_email=user_email(user),
        target_email=clean_email,
        meta={"role": role_key},
    )
    return _serialize_invite(invite_doc)


async def list_my_pending_invites(user_id: str) -> list[dict]:
    user = await find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    email = user_email(user)
    if not email:
        return []
    rows = []
    async for doc in company_invites_collection.find(
        {"email": email, "status": "pending"}
    ).sort("created_at", -1):
        rows.append(_serialize_invite(doc))
    return rows


async def get_invite_by_token(token: str) -> Optional[dict]:
    return await company_invites_collection.find_one({"token": str(token or "").strip()})
