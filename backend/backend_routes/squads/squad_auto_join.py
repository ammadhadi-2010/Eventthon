"""Auto-join authenticated users to public squads for chat/actions."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import HTTPException

from .squad_permissions import is_squad_member, squad_is_private, resolve_session_user_id
from .squad_shared import squad_collection, normalize_member_avatar, create_activity_event


def _member_from_user(user: dict) -> dict:
    uid = resolve_session_user_id(user) or f"m-{uuid.uuid4().hex[:8]}"
    name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Member"
    image = user.get("imageurl") or user.get("profile_image_url") or user.get("avatar")
    row = {
        "id": uid,
        "name": name,
        "email": user.get("email"),
        "mobile": user.get("mobile"),
        "role": "Member",
        "online": True,
        "invite_status": "accepted",
        "avatar": normalize_member_avatar({"name": name, "imageurl": image}),
    }
    if image:
        row["imageurl"] = image
    return row


async def ensure_hub_member(squad: dict, user: dict) -> None:
    if is_squad_member(squad, user):
        return
    if squad_is_private(squad):
        raise HTTPException(status_code=403, detail="Squad membership required")
    member = _member_from_user(user)
    squad_id = squad["_id"]
    name = member["name"]
    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$push": {
                "members": member,
                "activity_feed": create_activity_event(
                    "member_join",
                    f"{name} joined the squad",
                    name,
                ),
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    squad.setdefault("members", []).append(member)
