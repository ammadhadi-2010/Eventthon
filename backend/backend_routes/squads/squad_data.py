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


async def ensure_seed_data():
    count = await squad_collection.count_documents({})
    if count > 0:
        return
    seed_docs = [
        {
            "_id": "1",
            "slug": "seo-masters",
            "squad_name": "SEO Masters",
            "niche": "SEO & Marketing Squad",
            "description": "A squad for SEO experts and marketers to share knowledge, strategies and grow together.",
            "efficiency": "94%",
            "icon": "🔍",
            "banner": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
            "leader_id": "seed-admin",
            "members": [
                {"id": "u1", "name": "Ammad S.", "role": "Admin", "online": True, "avatar": normalize_member_avatar({"name": "Ammad S."})},
                {"id": "u2", "name": "Sarah Khan", "role": "Moderator", "online": True, "avatar": normalize_member_avatar({"name": "Sarah Khan"})},
                {"id": "u3", "name": "Usman Ali", "role": "Member", "online": True, "avatar": normalize_member_avatar({"name": "Usman Ali"})},
            ],
            "messages": [
                {"id": "m1", "type": "text", "text": "Let's share our SEO wins of the week.", "sender": "Ammad S.", "time": "10:30 AM", "reactions": [{"emoji": "👍", "count": 12}]},
            ],
            "projects": [
                {"id": "p1", "title": "SEO Analytics Dashboard", "status": "In Progress", "owner": "Sarah Khan", "progress": 75, "tags": ["SEO", "Analytics"]},
                {"id": "p2", "title": "Content Strategy Plan", "status": "In Progress", "owner": "Usman Ali", "progress": 60, "tags": ["Content", "Strategy"]},
                {"id": "p3", "title": "AI Content Generator", "status": "Planning", "owner": "Ammad S.", "progress": 25, "tags": ["AI", "Content"]},
            ],
            "files": [
                {"id": "f1", "name": "On-Page-SEO-Checklist.pdf", "size": "2.4 MB"},
            ],
            "activity": [
                {"id": "a1", "label": "Messages", "value": 256, "change": "+24%"},
                {"id": "a2", "label": "New Members", "value": 32, "change": "+12%"},
                {"id": "a3", "label": "Active Users", "value": 89, "change": "+18%"},
            ],
            "activity_feed": [
                create_activity_event("project_update", "Sarah Khan updated the project SEO Analytics Dashboard", "Sarah Khan"),
                create_activity_event("file_upload", "Usman Ali uploaded a file Keyword-Research-Guide.pdf", "Usman Ali"),
                create_activity_event("task_complete", "Hira Saeed completed a task in Content Strategy Plan", "Hira Saeed"),
                create_activity_event("project_create", "Ammad S. created a new project AI Content Generator", "Ammad S."),
                create_activity_event("member_join", "Bilal Ahmed joined the squad", "Bilal Ahmed"),
            ],
            "trend_7d": [30, 38, 35, 54, 62, 48, 70],
            "settings": normalize_squad_settings(None),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "_id": "2",
            "squad_name": "Web Dev Warriors",
            "niche": "Web Development Squad",
            "description": "Full-stack developers building the future of EventThon.",
            "efficiency": "88%",
            "icon": "</>",
            "banner": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500",
            "leader_id": "seed-dev-admin",
            "members": [
                {"id": "u11", "name": "Ali Raza", "role": "Admin", "online": True, "avatar": normalize_member_avatar({"name": "Ali Raza"})},
                {"id": "u12", "name": "Mina Noor", "role": "Moderator", "online": False, "avatar": normalize_member_avatar({"name": "Mina Noor"})},
            ],
            "messages": [],
            "projects": [{"id": "p3", "title": "Design System Upgrade", "status": "Active", "owner": "Ali Raza"}],
            "files": [{"id": "f3", "name": "API-Architecture.png", "size": "3.1 MB"}],
            "activity": [
                {"id": "a4", "label": "Messages", "value": 112, "change": "+9%"},
                {"id": "a5", "label": "New Members", "value": 9, "change": "+4%"},
                {"id": "a6", "label": "Active Users", "value": 37, "change": "+11%"},
            ],
            "activity_feed": [
                create_activity_event("project_update", "Ali Raza updated the project Design System Upgrade", "Ali Raza"),
                create_activity_event("member_join", "Mina Noor joined the squad", "Mina Noor"),
            ],
            "trend_7d": [20, 24, 33, 30, 45, 39, 52],
            "settings": normalize_squad_settings(None),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
    ]
    await squad_collection.insert_many(seed_docs)


async def get_squad_or_none(squad_id: str):
    return await squad_collection.find_one({"_id": squad_id})
