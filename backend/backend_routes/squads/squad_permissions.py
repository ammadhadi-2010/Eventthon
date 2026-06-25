"""Squad hub authorization, settings enforcement, and member hydration."""
from __future__ import annotations

from fastapi import HTTPException, Header

from database import user_collection
from .squads_session import verify_squads_session, user_session_ids, assert_squad_leader
from .squad_shared import normalize_squad_settings, normalize_member_avatar


async def optional_verify_squads_session(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict | None:
    email_h = (x_user_email or "").strip().lower()
    mobile_h = (x_user_mobile or "").strip()
    if not email_h and not mobile_h:
        return None
    try:
        return await verify_squads_session(x_user_email=x_user_email, x_user_mobile=x_user_mobile)
    except HTTPException:
        return None


def resolve_session_user_id(user: dict | None) -> str:
    if not user:
        return ""
    for key in ("_id", "user_id"):
        val = str(user.get(key) or "").strip()
        if val:
            return val
    return ""


def _member_matches_user(member: dict, user: dict | None) -> bool:
    if not user or not member:
        return False
    allowed = user_session_ids(user)
    mid = str(member.get("id") or "").strip()
    if mid and mid in allowed:
        return True
    email = str(member.get("email") or "").strip().lower()
    mobile = str(member.get("mobile") or "").strip()
    name = str(member.get("name") or "").strip().lower()
    user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip().lower()
    if email and email in allowed:
        return True
    if mobile and mobile in allowed:
        return True
    if name and user_name and name == user_name:
        return True
    return False


def find_member(squad: dict, user: dict | None) -> dict | None:
    if not squad or not user:
        return None
    for member in squad.get("members") or []:
        if _member_matches_user(member, user):
            return member
    return None


def is_squad_leader(squad: dict, user: dict | None) -> bool:
    if not squad or not user:
        return False
    uid = resolve_session_user_id(user)
    leader = str(squad.get("leader_id") or "").strip()
    return bool(uid and leader and uid == leader)


def is_squad_member(squad: dict, user: dict | None) -> bool:
    if is_squad_leader(squad, user):
        return True
    member = find_member(squad, user)
    if not member:
        return False
    status = str(member.get("invite_status") or "accepted").lower()
    return status in ("accepted", "", "active")


def squad_is_private(squad: dict) -> bool:
    settings = normalize_squad_settings(squad.get("settings"))
    return not bool(settings.get("publicListing", True))


def assert_hub_member(squad: dict, user: dict | None) -> None:
    if not is_squad_member(squad, user):
        raise HTTPException(status_code=403, detail="Squad membership required")


def assert_hub_read_access(squad: dict, user: dict | None) -> None:
    if squad.get("status") == "archived" and not is_squad_member(squad, user):
        raise HTTPException(status_code=404, detail="Squad not found")
    if squad_is_private(squad) and not is_squad_member(squad, user):
        raise HTTPException(status_code=403, detail="Private squad — members only")


async def assert_can_manage_settings(squad: dict, user: dict) -> None:
    leader_id = str(squad.get("leader_id") or "").strip()
    if leader_id:
        await assert_squad_leader(squad, leader_id, user)


def assert_chat_enabled(squad: dict) -> None:
    settings = normalize_squad_settings(squad.get("settings"))
    if not settings.get("enableChat", True):
        raise HTTPException(status_code=403, detail="Squad chat is disabled")


def assert_projects_enabled(squad: dict) -> None:
    settings = normalize_squad_settings(squad.get("settings"))
    if not settings.get("enableProjects", True):
        raise HTTPException(status_code=403, detail="Squad projects are disabled")


def assert_can_create_project(squad: dict, user: dict) -> None:
    assert_hub_member(squad, user)
    assert_projects_enabled(squad)
    if is_squad_leader(squad, user):
        return
    settings = normalize_squad_settings(squad.get("settings"))
    member = find_member(squad, user)
    role = str(member.get("role") or "").lower() if member else ""
    if settings.get("adminProjectCreate"):
        if role == "admin":
            return
        raise HTTPException(status_code=403, detail="Only squad admins can create projects")
    return


async def assert_can_invite(squad: dict, user: dict) -> None:
    """Only squad leader may invite members (matches hub UI)."""
    leader_id = str(squad.get("leader_id") or "").strip()
    if not leader_id:
        raise HTTPException(status_code=403, detail="Squad leader required to invite")
    await assert_squad_leader(squad, leader_id, user)
    settings = normalize_squad_settings(squad.get("settings"))
    if not settings.get("inviteOthers", True) and not is_squad_leader(squad, user):
        raise HTTPException(status_code=403, detail="Inviting members is disabled")


def build_live_activity_kpis(squad: dict) -> list[dict]:
    members = squad.get("members") or []
    messages = squad.get("messages") or []
    active = len([m for m in members if m.get("online")])
    return [
        {"id": "a-messages", "label": "Messages", "value": len(messages), "change": "+0%"},
        {"id": "a-members", "label": "New Members", "value": len(members), "change": "+0%"},
        {"id": "a-active", "label": "Active Users", "value": active, "change": "+0%"},
    ]


async def hydrate_squad_members(members: list) -> list:
    if not members:
        return []
    from bson import ObjectId

    object_ids = []
    mobile_keys: list[str] = []
    email_keys: list[str] = []

    for member in members:
        mid = str(member.get("id") or "").strip()
        if len(mid) == 24:
            try:
                object_ids.append(ObjectId(mid))
            except Exception:
                pass
        elif mid:
            mobile_keys.append(mid)

        mobile = str(member.get("mobile") or "").strip()
        if mobile:
            mobile_keys.append(mobile)

        email = str(member.get("email") or "").strip().lower()
        if email:
            email_keys.append(email)

    users_by_id: dict[str, dict] = {}
    if object_ids:
        async for doc in user_collection.find({"_id": {"$in": object_ids}}):
            users_by_id[str(doc.get("_id"))] = doc

    users_by_mobile: dict[str, dict] = {}
    unique_mobiles = list({m for m in mobile_keys if m})
    if unique_mobiles:
        async for doc in user_collection.find({"mobile": {"$in": unique_mobiles}}):
            mob = str(doc.get("mobile") or "").strip()
            if mob:
                users_by_mobile[mob] = doc

    users_by_email: dict[str, dict] = {}
    unique_emails = list({e for e in email_keys if e})
    if unique_emails:
        async for doc in user_collection.find({"email": {"$in": unique_emails}}):
            em = str(doc.get("email") or "").strip().lower()
            if em:
                users_by_email[em] = doc

    def apply_user_doc(row: dict, user_doc: dict) -> None:
        row["email"] = user_doc.get("email") or row.get("email")
        row["mobile"] = user_doc.get("mobile") or row.get("mobile")
        image = (
            user_doc.get("profile_image_url")
            or user_doc.get("imageurl")
            or user_doc.get("avatar")
        )
        if image:
            row["imageurl"] = image
            row["profile_image_url"] = image
            row["avatar"] = normalize_member_avatar(row)
        full_name = f"{user_doc.get('first_name', '')} {user_doc.get('last_name', '')}".strip()
        if full_name:
            row["name"] = full_name

    hydrated = []
    for member in members:
        row = dict(member)
        row["avatar"] = normalize_member_avatar(row)
        uid = str(row.get("id") or "").strip()
        user_doc = users_by_id.get(uid)
        if not user_doc and uid:
            user_doc = users_by_mobile.get(uid)
        if not user_doc:
            mobile = str(row.get("mobile") or "").strip()
            if mobile:
                user_doc = users_by_mobile.get(mobile)
        if not user_doc:
            email = str(row.get("email") or "").strip().lower()
            if email:
                user_doc = users_by_email.get(email)
        if user_doc:
            apply_user_doc(row, user_doc)
        hydrated.append(row)
    return hydrated
