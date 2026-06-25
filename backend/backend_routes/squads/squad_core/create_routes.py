from datetime import datetime
import uuid

from fastapi import APIRouter, Depends

from backend_routes.company_portal.verification_gate import ensure_company_posting_unlocked

from ..squads_session import assert_actor_id, verify_squads_session
from ..squad_shared import (
    CreateSquadPayload,
    squad_collection,
    ensure_seed_data,
    build_squad_summary,
    normalize_member_avatar,
    normalize_squad_settings,
    slugify_squad_name,
    resolve_squad_media_url,
)

router = APIRouter()


async def create_squad_impl(payload: CreateSquadPayload, user: dict):
    leader_id = (payload.leader_id or "").strip()
    if leader_id:
        await assert_actor_id(leader_id, user)
    await ensure_company_posting_unlocked(leader_id, feature="squads")
    clean_name = (payload.name or "").strip()
    if not clean_name:
        return {"status": "error", "message": "Squad name required"}
    await ensure_seed_data()
    squad_id = uuid.uuid4().hex[:8]
    leader_name = (payload.leader_name or "You").strip() or "You"
    description = (payload.description or f"{clean_name} community for collaboration and growth.").strip()
    category = (payload.category or "Custom Squad").strip()
    privacy = (payload.privacy or "public").strip().lower()
    is_public = privacy != "private"
    merged_settings = normalize_squad_settings(payload.settings)
    merged_settings["publicListing"] = is_public if payload.settings is None else merged_settings.get("publicListing", is_public)

    members = [
        {
            "id": payload.leader_id or f"user-{uuid.uuid4().hex[:6]}",
            "name": leader_name,
            "role": "Admin",
            "online": True,
            "avatar": normalize_member_avatar({"name": leader_name}),
        }
    ]
    for invite in payload.invited_members or []:
        clean_invite = (invite.name or "").strip()
        if not clean_invite or clean_invite == leader_name:
            continue
        members.append(
            {
                "id": f"m-{uuid.uuid4().hex[:8]}",
                "name": clean_invite,
                "role": invite.role or "Member",
                "online": False,
                "invited_by": payload.leader_id,
                "avatar": normalize_member_avatar({"name": clean_invite}),
            }
        )

    banner = resolve_squad_media_url(payload.banner, payload.imageurl)

    doc = {
        "_id": squad_id,
        "squad_name": clean_name,
        "niche": category,
        "description": description,
        "efficiency": "100%",
        "icon": clean_name[0].upper(),
        "banner": banner,
        "imageurl": banner,
        "slug": slugify_squad_name(clean_name),
        "leader_id": payload.leader_id,
        "status": "draft" if payload.is_draft else "active",
        "members": members,
        "messages": [],
        "projects": [],
        "files": [],
        "activity": [
            {"id": f"a-{uuid.uuid4().hex[:5]}", "label": "Messages", "value": 0, "change": "+0%"},
            {"id": f"a-{uuid.uuid4().hex[:5]}", "label": "New Members", "value": len(members), "change": "+0%"},
            {"id": f"a-{uuid.uuid4().hex[:5]}", "label": "Active Users", "value": 1, "change": "+0%"},
        ],
        "trend_7d": [0, 0, 0, 0, 0, 0, 0],
        "settings": merged_settings,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await squad_collection.insert_one(doc)
    return {"status": "success", "data": build_squad_summary(doc)}


@router.post("/create")
async def create_squad(
    payload: CreateSquadPayload,
    user: dict = Depends(verify_squads_session),
):
    return await create_squad_impl(payload, user)
