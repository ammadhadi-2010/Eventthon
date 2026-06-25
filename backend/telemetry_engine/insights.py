"""Rule-based growth insight generation from telemetry and portfolio signals."""
from __future__ import annotations

from database import (
    gigs_collection,
    hub_projects_collection,
    project_contact_messages_collection,
    squad_collection,
    user_telemetry_log_collection,
)
from telemetry_engine.recommender import compute_user_interests, find_category_affinity

HIGH_DWELL_SECONDS = 90.0
HIGH_CATEGORY_SCORE = 35.0

def _member_keys(user_id: str) -> list[str]:
    uid = str(user_id or "").strip()
    return [] if not uid else list(dict.fromkeys([uid, uid.lower()]))

def _insight(**fields) -> dict:
    return {
        "id": fields["insight_id"],
        "type": fields["insight_type"],
        "priority": fields["priority"],
        "category": fields["category"],
        "title": fields["title"],
        "message": fields["message"],
        "action_label": fields.get("action_label", ""),
        "action_url": fields.get("action_url", ""),
    }

async def _load_portfolio(user_id: str) -> dict:
    keys = _member_keys(user_id)
    owner_filter = {"$or": [{"owner_user_id": key} for key in keys]}
    seller_filter = {"$or": [{"seller_user_id": key} for key in keys]}
    squad_filter = {
        "$or": [
            {"leader_id": {"$in": keys}},
            {"members.id": {"$in": keys}},
            {"members.user_id": {"$in": keys}},
        ]
    }
    projects = await hub_projects_collection.find(owner_filter, {"_id": 1, "title": 1}).limit(12).to_list(12)
    gigs = await gigs_collection.find(seller_filter, {"_id": 1, "title": 1}).limit(12).to_list(12)
    squads = await squad_collection.find(squad_filter, {"_id": 1, "name": 1}).limit(12).to_list(12)
    return {
        "projects": projects,
        "gigs": gigs,
        "squads": squads,
        "project_count": len(projects),
        "gig_count": len(gigs),
        "squad_count": len(squads),
    }

async def _project_dwell_seconds(user_id: str, project_id: str) -> float:
    pid = str(project_id or "").strip()
    if not pid:
        return 0.0
    keys = _member_keys(user_id)
    rows = await user_telemetry_log_collection.find(
        {
            "$and": [
                {"$or": [{"user_id": key} for key in keys]},
                {"endpoint_url": {"$regex": pid, "$options": "i"}},
            ]
        },
        {"time_spent_seconds": 1},
    ).limit(120).to_list(120)
    return round(sum(float(row.get("time_spent_seconds") or 0) for row in rows), 2)

async def _project_headline_rules(user_id: str, portfolio: dict, insights: list[dict]) -> None:
    keys = _member_keys(user_id)
    for project in portfolio.get("projects", []):
        pid = str(project.get("_id") or "")
        dwell = await _project_dwell_seconds(user_id, pid)
        contacts = await project_contact_messages_collection.count_documents(
            {"$or": [{"seller_user_id": key} for key in keys], "project_id": pid}
        )
        if dwell < HIGH_DWELL_SECONDS or contacts > 0:
            continue
        title = str(project.get("title") or "your project")
        insights.append(_insight(
            insight_id=f"project-headline-{pid}",
            insight_type="growth_alert",
            priority="high",
            category="projects",
            title="Project headline optimization",
            message=(
                f"Your project \"{title}\" is receiving high dwell attention but low direct outreach. "
                "Consider updating your headline titles to maximize click rates."
            ),
            action_label="Edit project headline",
            action_url=f"/projects/{pid}",
        ))

def _category_opportunity_rules(interests: dict, portfolio: dict, insights: list[dict]) -> None:
    gigs_row = find_category_affinity(interests, "gigs")
    if gigs_row and gigs_row.get("affinity_score", 0) >= HIGH_CATEGORY_SCORE and portfolio.get("gig_count", 0) == 0:
        insights.append(_insight(
            insight_id="gig-create-opportunity",
            insight_type="opportunity",
            priority="medium",
            category="gigs",
            title="Gig publishing opportunity",
            message="Strong gigs hub attention detected. Publish a gig listing to convert browsing interest into revenue leads.",
            action_label="Create a gig",
            action_url="/gigs/create",
        ))
    squad_row = find_category_affinity(interests, "squads")
    if squad_row and squad_row.get("affinity_score", 0) >= HIGH_CATEGORY_SCORE:
        insights.append(_insight(
            insight_id="squad-matching-alert",
            insight_type="squad_match",
            priority="high",
            category="squads",
            title="Squad collaboration signal",
            message="High squad endpoint activity detected. Explore active squads aligned with your browsing focus.",
            action_label="Browse squads",
            action_url="/squads",
        ))
    jobs_row = find_category_affinity(interests, "jobs")
    if jobs_row and jobs_row.get("affinity_score", 0) >= HIGH_CATEGORY_SCORE:
        insights.append(_insight(
            insight_id="jobs-engagement-alert",
            insight_type="growth_alert",
            priority="medium",
            category="jobs",
            title="Jobs hub engagement",
            message="Sustained jobs browsing detected. Set a job alert or refine filters for faster placement matches.",
            action_label="Open jobs hub",
            action_url="/jobs",
        ))

def _baseline_rules(interests: dict, insights: list[dict]) -> None:
    if interests.get("log_count", 0) == 0:
        insights.append(_insight(
            insight_id="telemetry-bootstrap",
            insight_type="onboarding",
            priority="low",
            category="general",
            title="Telemetry learning phase",
            message="Your behavior tracker is active. Browse projects, gigs, and squads to unlock personalized growth insights.",
            action_label="Explore dashboard",
            action_url="/dashboard",
        ))
        return
    top = interests.get("categories", [])
    if not top:
        return
    leader = top[0]
    insights.append(_insight(
        insight_id="top-interest-snapshot",
        insight_type="profile_signal",
        priority="low",
        category=str(leader.get("category") or "general"),
        title="Primary interest category",
        message=f"Your strongest current affinity is {leader.get('category')} with a score of {leader.get('affinity_score', 0)}.",
        action_label="View recommendations",
        action_url="/dashboard",
    ))

async def generate_growth_insights(user_id: str) -> list[dict]:
    uid = str(user_id or "").strip()
    interests = await compute_user_interests(uid, "")
    portfolio = await _load_portfolio(uid)
    insights: list[dict] = []
    _baseline_rules(interests, insights)
    _category_opportunity_rules(interests, portfolio, insights)
    await _project_headline_rules(uid, portfolio, insights)
    priority_rank = {"high": 0, "medium": 1, "low": 2}
    insights.sort(key=lambda row: priority_rank.get(row.get("priority", "low"), 9))
    return insights
