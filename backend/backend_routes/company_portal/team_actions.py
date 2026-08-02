"""Company team — accept/decline invites and member lifecycle actions."""
from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException

from database import company_invites_collection, company_members_collection, companies_collection
from backend_routes.alerts.alert_factory import push_alert

from .portal_resolve import find_user
from .team_audit import write_audit
from .team_members import (
    clear_user_company_link,
    find_active_membership,
    find_member_by_id,
    serialize_member,
    set_user_company_link,
    user_email,
    user_public_name,
)
from .team_roles import (
    assert_invitable_role,
    has_permission,
    normalize_role,
    role_label,
    P_INVITE,
    P_MANAGE_ROLES,
    P_REMOVE_MEMBERS,
    P_SUSPEND_MEMBERS,
    P_TRANSFER_OWNERSHIP,
)
from .team_service import _require_actor, _require_perm, get_invite_by_token


def _invite_expired(doc: dict) -> bool:
    raw = str(doc.get("expires_at") or "")
    if not raw:
        return False
    try:
        return datetime.fromisoformat(raw.replace("Z", "")) < datetime.utcnow()
    except ValueError:
        return False


async def accept_invite(user_id: str, token: str) -> dict:
    user = await find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Sign in to accept this invitation.")
    email = user_email(user)
    if not email:
        raise HTTPException(status_code=400, detail="Add an email to your account before accepting.")

    invite = await get_invite_by_token(token)
    if not invite or invite.get("status") != "pending":
        raise HTTPException(status_code=404, detail="Invitation not found or already used.")
    if _invite_expired(invite):
        await company_invites_collection.update_one(
            {"_id": invite["_id"]}, {"$set": {"status": "expired"}}
        )
        raise HTTPException(status_code=400, detail="This invitation has expired.")
    if str(invite.get("email") or "").lower() != email:
        raise HTTPException(
            status_code=403,
            detail="Sign in with the invited email address to accept.",
        )

    other = await find_active_membership(user)
    if other and str(other.get("company_id")) != str(invite.get("company_id")):
        raise HTTPException(
            status_code=400,
            detail="You already belong to another company. Leave it before accepting.",
        )

    cid = str(invite["company_id"])
    now = datetime.utcnow().isoformat()
    member = {
        "company_id": cid,
        "user_id": str(user["_id"]),
        "email": email,
        "name": user_public_name(user),
        "imageurl": str(user.get("profile_image_url") or user.get("avatar") or ""),
        "role": invite.get("role") or "viewer",
        "status": "active",
        "joined_at": now,
        "invited_by": invite.get("invited_by_email") or "",
        "created_at": now,
        "updated_at": now,
    }
    result = await company_members_collection.insert_one(member)
    member["_id"] = result.inserted_id
    await company_invites_collection.update_one(
        {"_id": invite["_id"]},
        {"$set": {"status": "accepted", "responded_at": now, "accepted_user_id": str(user["_id"])}},
    )
    await set_user_company_link(user, cid)
    await write_audit(
        company_id=cid,
        action="invite_accepted",
        actor_user_id=str(user["_id"]),
        actor_email=email,
        target_email=email,
        meta={"role": member["role"]},
    )
    if invite.get("invited_by_email"):
        await push_alert(
            recipient_identifier=str(invite["invited_by_email"]),
            category="company",
            title="Invitation accepted",
            message=f"{user_public_name(user)} joined as {role_label(member['role'])}.",
            actor_name=user_public_name(user),
            action_url="/company/dashboard/team",
            audience="employer",
        )
    return serialize_member(member)


async def decline_invite(user_id: str, token: str) -> dict:
    user = await find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Sign in to decline this invitation.")
    email = user_email(user)
    invite = await get_invite_by_token(token)
    if not invite or invite.get("status") != "pending":
        raise HTTPException(status_code=404, detail="Invitation not found or already used.")
    if str(invite.get("email") or "").lower() != email:
        raise HTTPException(status_code=403, detail="This invitation belongs to another email.")
    now = datetime.utcnow().isoformat()
    await company_invites_collection.update_one(
        {"_id": invite["_id"]},
        {"$set": {"status": "declined", "responded_at": now}},
    )
    await write_audit(
        company_id=str(invite["company_id"]),
        action="invite_declined",
        actor_user_id=str(user["_id"]),
        actor_email=email,
        target_email=email,
    )
    return {"status": "declined"}


async def revoke_invite(user_id: str, invite_id: str) -> dict:
    user, company, membership = await _require_actor(user_id)
    role = membership.get("role") or ""
    if not (has_permission(role, P_INVITE) or has_permission(role, P_REMOVE_MEMBERS)):
        raise HTTPException(status_code=403, detail="Not allowed to revoke invites.")
    from bson import ObjectId

    try:
        invite = await company_invites_collection.find_one({"_id": ObjectId(invite_id)})
    except Exception:
        invite = None
    if not invite or str(invite.get("company_id")) != str(company["_id"]):
        raise HTTPException(status_code=404, detail="Invite not found.")
    await company_invites_collection.update_one(
        {"_id": invite["_id"]},
        {"$set": {"status": "revoked", "responded_at": datetime.utcnow().isoformat()}},
    )
    await write_audit(
        company_id=str(company["_id"]),
        action="invite_revoked",
        actor_user_id=str(user["_id"]),
        actor_email=user_email(user),
        target_email=invite.get("email") or "",
    )
    return {"status": "revoked"}


async def change_member_role(user_id: str, member_id: str, role: str) -> dict:
    user, company, membership = await _require_actor(user_id)
    _require_perm(membership, P_MANAGE_ROLES)
    try:
        role_key = assert_invitable_role(role)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    target = await find_member_by_id(member_id)
    if not target or str(target.get("company_id")) != str(company["_id"]):
        raise HTTPException(status_code=404, detail="Member not found.")
    if target.get("role") == "owner":
        raise HTTPException(status_code=400, detail="Owner role cannot be changed here. Use ownership transfer.")
    await company_members_collection.update_one(
        {"_id": target["_id"]},
        {"$set": {"role": role_key, "updated_at": datetime.utcnow().isoformat()}},
    )
    target["role"] = role_key
    await write_audit(
        company_id=str(company["_id"]),
        action="role_changed",
        actor_user_id=str(user["_id"]),
        actor_email=user_email(user),
        target_email=target.get("email") or "",
        target_user_id=target.get("user_id") or "",
        meta={"role": role_key},
    )
    return serialize_member(target)


async def set_member_status(user_id: str, member_id: str, status: str, reason: str = "") -> dict:
    user, company, membership = await _require_actor(user_id)
    _require_perm(membership, P_SUSPEND_MEMBERS)
    if status not in ("active", "suspended"):
        raise HTTPException(status_code=400, detail="Invalid status.")
    target = await find_member_by_id(member_id)
    if not target or str(target.get("company_id")) != str(company["_id"]):
        raise HTTPException(status_code=404, detail="Member not found.")
    if target.get("role") == "owner":
        raise HTTPException(status_code=400, detail="Owner cannot be suspended.")
    patch = {"status": status, "updated_at": datetime.utcnow().isoformat()}
    if status == "suspended":
        patch["suspended_at"] = datetime.utcnow().isoformat()
        patch["suspended_by"] = user_email(user)
        patch["suspend_reason"] = reason
    await company_members_collection.update_one({"_id": target["_id"]}, {"$set": patch})
    target.update(patch)
    await write_audit(
        company_id=str(company["_id"]),
        action="member_suspended" if status == "suspended" else "member_reactivated",
        actor_user_id=str(user["_id"]),
        actor_email=user_email(user),
        target_email=target.get("email") or "",
        meta={"reason": reason},
    )
    return serialize_member(target)


async def remove_member(user_id: str, member_id: str) -> dict:
    user, company, membership = await _require_actor(user_id)
    _require_perm(membership, P_REMOVE_MEMBERS)
    target = await find_member_by_id(member_id)
    if not target or str(target.get("company_id")) != str(company["_id"]):
        raise HTTPException(status_code=404, detail="Member not found.")
    if target.get("role") == "owner":
        raise HTTPException(status_code=400, detail="Owner cannot be removed. Transfer ownership first.")
    await company_members_collection.delete_one({"_id": target["_id"]})
    if target.get("user_id"):
        await clear_user_company_link(str(target["user_id"]), str(company["_id"]))
    await write_audit(
        company_id=str(company["_id"]),
        action="member_removed",
        actor_user_id=str(user["_id"]),
        actor_email=user_email(user),
        target_email=target.get("email") or "",
        target_user_id=target.get("user_id") or "",
    )
    return {"status": "removed"}


async def transfer_ownership(user_id: str, target_member_id: str, confirmation_email: str) -> dict:
    user, company, membership = await _require_actor(user_id)
    _require_perm(membership, P_TRANSFER_OWNERSHIP)
    if user_email(user) != str(confirmation_email or "").strip().lower():
        raise HTTPException(
            status_code=400,
            detail="Type your owner email to confirm ownership transfer.",
        )
    target = await find_member_by_id(target_member_id)
    if not target or str(target.get("company_id")) != str(company["_id"]):
        raise HTTPException(status_code=404, detail="Target member not found.")
    if target.get("status") != "active":
        raise HTTPException(status_code=400, detail="Target member must be active.")
    if target.get("role") == "owner":
        raise HTTPException(status_code=400, detail="Already the owner.")

    now = datetime.utcnow().isoformat()
    new_owner_key = target.get("email") or target.get("user_id")
    await companies_collection.update_one(
        {"_id": company["_id"]},
        {"$set": {"owner_user_id": new_owner_key, "updated_at": now}},
    )
    await company_members_collection.update_one(
        {"_id": membership["_id"]},
        {"$set": {"role": "admin", "updated_at": now}},
    )
    await company_members_collection.update_one(
        {"_id": target["_id"]},
        {"$set": {"role": "owner", "updated_at": now}},
    )
    await write_audit(
        company_id=str(company["_id"]),
        action="ownership_transferred",
        actor_user_id=str(user["_id"]),
        actor_email=user_email(user),
        target_email=target.get("email") or "",
        target_user_id=target.get("user_id") or "",
    )
    return {"status": "transferred", "newOwnerEmail": target.get("email")}
