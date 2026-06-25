"""Default hub projects seeded per owner on first API access."""
from datetime import datetime, timedelta

from .serializers import status_to_label


def _ago(hours: int) -> str:
    if hours < 1:
        return "Just now"
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days < 7:
        return f"{days}d ago"
    return f"{days // 7}w ago"


def build_seed_projects(owner_user_id: str) -> list[dict]:
    now = datetime.utcnow()
    rows = [
        {
            "name": "AI Content Generator",
            "category": "AI & Machine Learning",
            "status": "in-progress",
            "progress": 65,
            "budget": "$6,500",
            "team": ["SK", "UA"],
            "team_extra": 0,
            "deadline": "May 30, 2025",
            "icon_tone": "ai",
            "featured": False,
            "visibility": "private",
        },
        {
            "name": "SEO Analytics Dashboard",
            "category": "Web Development",
            "status": "in-review",
            "progress": 90,
            "budget": "$8,200",
            "team": ["BA", "HM"],
            "team_extra": 0,
            "deadline": "Jun 12, 2025",
            "icon_tone": "seo",
            "featured": True,
            "visibility": "public",
            "agency": "RankForge",
            "badges": ["TRENDING"],
        },
        {
            "name": "EventThon Mobile App",
            "category": "Mobile Apps",
            "status": "in-progress",
            "progress": 60,
            "budget": "$22,000",
            "team": ["SK", "UA", "BA"],
            "team_extra": 0,
            "deadline": "Jul 1, 2025",
            "icon_tone": "mobile",
            "featured": True,
            "visibility": "public",
            "agency": "EventThon Core",
            "badges": ["HOT"],
        },
        {
            "name": "ET Coin Wallet",
            "category": "Blockchain",
            "status": "in-progress",
            "progress": 80,
            "budget": "$15,800",
            "team": ["UA", "AM"],
            "team_extra": 0,
            "deadline": "Jun 20, 2025",
            "icon_tone": "wallet",
            "featured": True,
            "visibility": "public",
            "agency": "EventThon Finance",
            "badges": ["FEATURED"],
        },
        {
            "name": "Marketing Campaign Hub",
            "category": "Marketing",
            "status": "on-hold",
            "progress": 35,
            "budget": "$4,200",
            "team": ["HM"],
            "team_extra": 0,
            "deadline": "Aug 5, 2025",
            "icon_tone": "marketing",
            "featured": False,
            "visibility": "private",
        },
        {
            "name": "Squad Portal Redesign",
            "category": "Design & Creative",
            "status": "completed",
            "progress": 100,
            "budget": "$9,600",
            "team": ["SK", "AM"],
            "team_extra": 0,
            "deadline": "Apr 18, 2025",
            "icon_tone": "design",
            "featured": False,
            "visibility": "private",
        },
        {
            "name": "Game Matchmaking API",
            "category": "Game Development",
            "status": "completed",
            "progress": 100,
            "budget": "$11,300",
            "team": ["BA", "UA"],
            "team_extra": 0,
            "deadline": "Mar 30, 2025",
            "icon_tone": "games",
            "featured": False,
            "visibility": "private",
        },
        {
            "name": "Freelancer CRM Lite",
            "category": "Web Development",
            "status": "on-hold",
            "progress": 20,
            "budget": "$3,800",
            "team": ["SK"],
            "team_extra": 0,
            "deadline": "Sep 10, 2025",
            "icon_tone": "web",
            "featured": False,
            "visibility": "private",
        },
    ]
    members_seed = [
        {"user_id": "seed-sarah", "name": "Sarah Khan", "role": "Developer", "initials": "SK"},
        {"user_id": "seed-usman", "name": "Usman Ali", "role": "Analyst", "initials": "UA"},
    ]
    docs = []
    for idx, row in enumerate(rows):
        created = now - timedelta(hours=idx * 5 + 2)
        title = row["name"]
        docs.append(
            {
                "owner_user_id": owner_user_id,
                "title": title,
                "name": title,
                "short_description": f"Collaborative work on {title}.",
                "category": row["category"],
                "status": row["status"],
                "status_label": status_to_label(row["status"]),
                "progress": row["progress"],
                "budget": row["budget"],
                "team": row["team"],
                "team_extra": row.get("team_extra", 0),
                "deadline": row["deadline"],
                "updated_label": _ago(idx * 3 + 2),
                "icon_tone": row["icon_tone"],
                "featured": row.get("featured", False),
                "visibility": row.get("visibility", "private"),
                "agency": row.get("agency", "Your Studio"),
                "verified": True,
                "badges": row.get("badges", []),
                "description": f"Enterprise delivery for {title}.",
                "tasks_count": 12 + idx,
                "tags": [],
                "members": members_seed if idx < 4 else [],
                "milestones": [],
                "funding_goal": 10000 + idx * 1500,
                "funding_raised": 4000 + idx * 800,
                "created_at": created,
                "updated_at": created,
            }
        )
    return docs


def build_seed_saved(user_id: str, project_ids: list[str]) -> list[dict]:
    now = datetime.utcnow()
    titles = [
        ("AI Image Generator", "AI & ML", "Pixel Studio", "PS", "ai", "🖼"),
        ("Smart Task Manager", "Web Dev", "Taskify Team", "TT", "web", "✓"),
        ("NFT Marketplace", "Blockchain", "Chain Labs", "CL", "wallet", "◆"),
    ]
    rows = []
    for idx, (title, cat, owner, initials, tone, glyph) in enumerate(titles):
        pid = project_ids[idx] if idx < len(project_ids) else ""
        rows.append(
            {
                "user_id": user_id,
                "project_id": pid,
                "title": title,
                "category": cat,
                "owner_name": owner,
                "owner_initials": initials,
                "icon_tone": tone,
                "icon_glyph": glyph,
                "saved_on_label": (now - timedelta(days=idx * 3)).strftime("%b %d, %Y"),
                "created_at": now - timedelta(days=idx * 3),
            }
        )
    return rows
