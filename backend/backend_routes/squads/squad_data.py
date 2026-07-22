from datetime import datetime, timedelta
from typing import Optional
import os
import re
import uuid

from database import squad_collection

from .squad_models import DEFAULT_SQUAD_SETTINGS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SQUAD_UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads", "squads")
os.makedirs(SQUAD_UPLOAD_DIR, exist_ok=True)

SQUAD_LIST_PROJECTION = {
    "_id": 1,
    "squad_name": 1,
    "niche": 1,
    "description": 1,
    "members": 1,
    "projects": 1,
    "efficiency": 1,
    "icon": 1,
    "banner": 1,
    "imageurl": 1,
    "leader_id": 1,
    "settings": 1,
    "slug": 1,
    "created_at": 1,
}

SQUAD_WORKSPACE_PROJECTION = {
    "_id": 1,
    "members": 1,
    "messages": {"$slice": -80},
    "projects": 1,
    "files": 1,
    "activity": 1,
    "activity_feed": {"$slice": -50},
    "trend_7d": 1,
}


def slugify_squad_name(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", str(value or "").strip().lower())
    return text.strip("-")


def normalize_squad_settings(settings: Optional[dict]):
    safe_settings = settings if isinstance(settings, dict) else {}
    return {**DEFAULT_SQUAD_SETTINGS, **safe_settings}


def normalize_member_avatar(member: dict):
    avatar = member.get("imageurl") or member.get("avatar")
    if avatar:
        return avatar
    name_seed = (member.get("name") or "member").replace(" ", "-").lower()
    return f"https://api.dicebear.com/8.x/thumbs/svg?seed={name_seed}"


def resolve_squad_media_url(banner: str | None = None, imageurl: str | None = None) -> str:
    raw = (imageurl or banner or "").strip()
    if raw.startswith("http") or raw.startswith("data:"):
        return raw
    return "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500"


def build_squad_summary(squad: dict):
    members = squad.get("members", [])
    members_count = squad.get("members_count")
    if members_count is None:
        members_count = len(members)
    projects = squad.get("projects", [])
    projects_count = squad.get("projects_count")
    if projects_count is None:
        projects_count = len(projects)
    online_raw = squad.get("online")
    if isinstance(online_raw, int) and not members:
        online = online_raw
    else:
        online = len([m for m in members if m.get("online")])
    return {
        "_id": squad["_id"],
        "squad_name": squad.get("squad_name"),
        "niche": squad.get("niche"),
        "description": squad.get("description"),
        "members_count": int(members_count or 0),
        "online": online,
        "projects_count": int(projects_count or 0),
        "efficiency": squad.get("efficiency", "90%"),
        "icon": squad.get("icon"),
        "banner": squad.get("banner"),
        "imageurl": squad.get("imageurl") or squad.get("banner"),
        "leader_id": squad.get("leader_id"),
        "members": members,
        "settings": normalize_squad_settings(squad.get("settings")),
        "slug": squad.get("slug") or slugify_squad_name(squad.get("squad_name") or ""),
        "created_at": squad.get("created_at"),
    }


async def ensure_squad_slugs():
    """Backfill slug only when missing — avoids scanning every squad on each list request."""
    query = {"$or": [{"slug": {"$exists": False}}, {"slug": ""}, {"slug": None}]}
    async for squad in squad_collection.find(query, {"_id": 1, "squad_name": 1, "slug": 1}):
        slug = slugify_squad_name(squad.get("squad_name") or "")
        if slug:
            await squad_collection.update_one({"_id": squad["_id"]}, {"$set": {"slug": slug}})


async def fetch_squad_workspace_doc(squad_id: str) -> dict | None:
    """One lightweight read for squad hub (no seed scan, capped message history)."""
    return await squad_collection.find_one({"_id": squad_id}, SQUAD_WORKSPACE_PROJECTION)


def iso_now():
    return datetime.utcnow().isoformat()


def create_activity_event(event_type: str, text: str, actor_name: Optional[str] = None, meta: Optional[dict] = None):
    return {
        "id": f"ev-{uuid.uuid4().hex[:10]}",
        "type": event_type,
        "text": text,
        "actor_name": actor_name,
        "meta": meta or {},
        "created_at": iso_now(),
    }


def build_activity_overview(squad: dict):
    projects = squad.get("projects", [])
    messages = squad.get("messages", [])
    files = squad.get("files", [])
    members = squad.get("members", [])
    return [
        {"label": "Projects", "value": len(projects), "color": "#3b82f6"},
        {"label": "Messages", "value": len(messages), "color": "#fb923c"},
        {"label": "Files", "value": len(files), "color": "#f97316"},
        {"label": "Members", "value": len(members), "color": "#fb7185"},
    ]


def build_top_members(squad: dict):
    members = squad.get("members", [])
    activity_feed = squad.get("activity_feed", [])
    if not members:
        return []
    counted = []
    for member in members:
        name = member.get("name", "Member")
        contribution = len([a for a in activity_feed if a.get("actor_name") == name])
        if member.get("online"):
            contribution += 5
        counted.append(
            {
                "id": member.get("id"),
                "name": name,
                "avatar": normalize_member_avatar(member),
                "activities": max(1, contribution),
            }
        )
    counted.sort(key=lambda x: x.get("activities", 0), reverse=True)
    return counted[:5]


def build_trend_7d(activity_feed: list[dict]):
    today = datetime.utcnow().date()
    points = []
    for day_offset in range(6, -1, -1):
        target_day = today - timedelta(days=day_offset)
        count = 0
        for event in activity_feed:
            created_at = event.get("created_at")
            if not created_at:
                continue
            try:
                event_day = datetime.fromisoformat(created_at).date()
            except Exception:
                continue
            if event_day == target_day:
                count += 1
        points.append(count)
    return points


async def get_squad_or_none(squad_id: str):
    return await squad_collection.find_one({"_id": squad_id})


from .squad_seed_data import ensure_seed_data  # noqa: E402,F401
