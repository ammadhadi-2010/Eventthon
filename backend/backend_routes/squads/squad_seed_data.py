from datetime import datetime

from database import squad_collection

from .squad_data import (
    create_activity_event,
    normalize_member_avatar,
    normalize_squad_settings,
)


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
            "files": [{"id": "f1", "name": "On-Page-SEO-Checklist.pdf", "size": "2.4 MB"}],
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
