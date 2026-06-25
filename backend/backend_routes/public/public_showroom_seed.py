"""Seed + upsert public showroom documents (projects, gigs, jobs, squads)."""
from __future__ import annotations

import asyncio
from datetime import datetime

from database import gigs_collection, hub_projects_collection, jobs_collection, squad_collection
from backend_routes.jobs.hub_demo_jobs import DEMO_HUB_JOB_ROWS
from backend_routes.squads.squad_shared import ensure_seed_data
from .public_sanitize import slugify

SHOWROOM_OWNER = "eventthon-public-showroom"
PUBLIC_SITE = "https://eventthon.network"
GITHUB_DEMO = "https://github.com/eventthon"

_seed_lock = asyncio.Lock()
_seeds_ready = False

def _seo_dashboard_project(now: datetime) -> dict:
    return {
        "owner_user_id": SHOWROOM_OWNER,
        "title": "SEO Analytics Dashboard",
        "name": "SEO Analytics Dashboard",
        "short_description": "Real-time SEO metrics dashboard with squad collaboration and public portfolio preview.",
        "description": (
            "Enterprise analytics for marketing squads with live charts, keyword tracking, "
            "backlink monitoring, and export tools."
        ),
        "category": "Web Development",
        "status": "in-review",
        "visibility": "public",
        "showroom_seed": True,
        "public_slug": "seo-analytics-dashboard",
        "tags": ["React", "Node.js", "MongoDB", "SEO", "Chart.js", "Tailwind CSS"],
        "skills_tags": ["React", "Node.js", "MongoDB", "SEO", "Chart.js", "Tailwind CSS"],
        "tech_stack": ["React", "Node.js", "MongoDB", "Chart.js", "Tailwind CSS"],
        "live_preview_url": PUBLIC_SITE,
        "github_url": GITHUB_DEMO,
        "seo_title": "SEO Analytics Dashboard | EventThon Projects",
        "seo_description": "Real-time SEO metrics dashboard with squad collaboration and public portfolio preview.",
        "keywords": ["SEO", "dashboard", "EventThon", "portfolio", "web development"],
        "squad_name": "SEO Masters",
        "license": "MIT",
        "milestone_progress": 75,
        "metrics": [
            {"id": "traffic", "label": "Organic Traffic", "value": "12.4K", "delta": "+18.6% (30 days)", "tone": "green"},
            {"id": "keywords", "label": "Keyword Ranking", "value": "325", "hint": "Top 10 Keywords", "tone": "violet"},
            {"id": "backlinks", "label": "Backlinks", "value": "1.8K", "delta": "+21.3% (30 days)", "tone": "blue"},
            {"id": "seo_score", "label": "SEO Score", "value": "92/100", "hint": "Excellent", "tone": "green"},
            {"id": "performance", "label": "Performance", "value": "98%", "hint": "Core Web Vitals", "tone": "green"},
        ],
        "highlights": [
            {"title": "Built With Modern Stack", "subtitle": "React, Node.js, MongoDB"},
            {"title": "Real-time Analytics", "subtitle": "Live traffic & keyword tracking"},
            {"title": "SEO Optimized & Fast", "subtitle": "98% performance score"},
            {"title": "Team Collaboration", "subtitle": "Squad-based project management"},
            {"title": "Public Portfolio Ready", "subtitle": "Shareable showroom links"},
        ],
        "milestones": [
            {"title": "Dashboard UI Completed", "status": "completed", "progress": 100},
            {"title": "API Integration", "status": "completed", "progress": 100},
            {"title": "SEO Tools Module", "status": "in-progress", "progress": 75},
            {"title": "Public Launch", "status": "pending", "progress": 0},
        ],
        "features": [
            "Real-time SEO metrics tracking",
            "Keyword ranking analysis",
            "Backlink monitoring",
            "Team collaboration tools",
            "Public portfolio preview",
        ],
        "members": [
            {"name": "Sarah Khan", "role": "Owner", "initials": "SK", "online": True, "rating": 4.9, "projects": 12},
            {"name": "Usman Ali", "role": "Admin", "initials": "UA", "online": True, "rating": 4.8, "projects": 8},
            {"name": "Ahmad Hadi", "role": "Member", "initials": "AH", "online": True, "rating": 4.7, "projects": 6},
            {"name": "Bilal Ahmed", "role": "Member", "initials": "BA", "online": False, "rating": 4.6, "projects": 5},
        ],
        "updated_at": now,
    }


def _mobile_app_project(now: datetime) -> dict:
    return {
        "owner_user_id": SHOWROOM_OWNER,
        "title": "EventThon Mobile App",
        "name": "EventThon Mobile App",
        "short_description": "Cross-platform mobile app for verified networking, gigs, and squad coordination.",
        "description": "Native-quality experience for iOS and Android with secure wallet integration.",
        "category": "Mobile Apps",
        "status": "in-progress",
        "visibility": "public",
        "showroom_seed": True,
        "public_slug": "eventthon-mobile-app",
        "skills_tags": ["React Native", "TypeScript", "Firebase"],
        "tech_stack": ["React Native", "TypeScript", "Firebase"],
        "live_preview_url": PUBLIC_SITE,
        "github_url": GITHUB_DEMO,
        "seo_title": "EventThon Mobile App | EventThon Projects",
        "seo_description": "Cross-platform mobile app for verified networking, gigs, and squad coordination.",
        "keywords": ["mobile", "React Native", "EventThon", "app"],
        "featured": True,
        "updated_at": now,
    }


async def upsert_showroom_projects() -> None:
    now = datetime.utcnow()
    for doc in (_seo_dashboard_project(now), _mobile_app_project(now)):
        slug = doc["public_slug"]
        await hub_projects_collection.update_one(
            {"public_slug": slug},
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )


async def upsert_showroom_jobs() -> None:
    rows = [
        *DEMO_HUB_JOB_ROWS,
        {
            "_id": "job-senior-frontend",
            "public_slug": "senior-frontend-developer",
            "title": "Senior Frontend Developer (React)",
            "category": "Development",
            "summary": "Build premium React interfaces for the EventThon global marketplace.",
            "description": "Lead frontend architecture for public showrooms, dashboard shells, and gig checkout flows.",
            "salary_range": "$120K - $160K",
            "compensation_band": {"min": 120, "max": 160},
            "remote": True,
            "location": "Fully Remote",
            "employment_type": "Full-time",
            "company_name": "Doist",
            "company_color": "#6366f1",
            "posted_ago": "2d ago",
            "application_requirements": ["3+ years React", "Portfolio required", "English fluency"],
            "functional_requirements": [
                "5+ years building production React applications.",
                "Expertise with TypeScript, Next.js, and design systems.",
                "Experience shipping accessible, performance-optimized UIs.",
            ],
            "status": "open",
            "visibility": "public",
            "showroom_seed": True,
            "seo_title": "Apply for Senior Frontend Developer (Remote) | EventThon Jobs",
            "seo_description": "Build premium React interfaces for the EventThon global marketplace.",
            "experience_level": "Senior Level",
            "work_mode": "Remote",
            "skills_tags": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
            "keywords": ["remote", "frontend", "EventThon jobs", "development"],
        },
        {
            "_id": "job-product-designer",
            "public_slug": "product-designer-remote",
            "title": "Product Designer",
            "category": "Design",
            "summary": "Lead UI/UX for squad tools and public showroom experiences.",
            "description": "Own end-to-end design for marketplace flows, job boards, and premium dark-glass UI systems.",
            "salary_range": "$90K - $120K",
            "compensation_band": {"min": 90, "max": 120},
            "remote": True,
            "location": "Fully Remote",
            "employment_type": "Full-time",
            "company_name": "HubSpot",
            "company_color": "#f97316",
            "posted_ago": "4d ago",
            "application_requirements": ["Figma expertise", "Design system experience"],
            "functional_requirements": [
                "Strong portfolio of SaaS and marketplace product design.",
                "Experience building component libraries and design tokens.",
                "Collaboration skills for async, remote product squads.",
            ],
            "status": "open",
            "visibility": "public",
            "showroom_seed": True,
            "seo_title": "Apply for Product Designer (Remote) | EventThon Jobs",
            "seo_description": "Lead UI/UX for squad tools and public showroom experiences.",
            "experience_level": "Mid Level",
            "work_mode": "Remote",
            "skills_tags": ["UI/UX", "Figma", "Design Systems"],
            "keywords": ["remote", "design", "EventThon jobs"],
        },
        {
            "_id": "job-fullstack-vercel",
            "public_slug": "fullstack-engineer-vercel",
            "title": "Full Stack Engineer",
            "category": "Development",
            "summary": "Ship edge-ready APIs and showroom pages for the EventThon network.",
            "description": "Work on public SEO endpoints, sanitized payloads, and global marketplace infrastructure.",
            "salary_range": "$130K - $170K",
            "compensation_band": {"min": 130, "max": 170},
            "remote": True,
            "location": "Fully Remote",
            "employment_type": "Full-time",
            "company_name": "Vercel",
            "company_color": "#0f172a",
            "posted_ago": "1w ago",
            "application_requirements": ["Node.js or Python", "MongoDB experience", "Public API design"],
            "functional_requirements": [
                "Experience with FastAPI or similar async Python frameworks.",
                "Comfortable designing public read APIs with strict field allow-lists.",
                "Strong understanding of SEO-friendly public page architecture.",
            ],
            "status": "open",
            "visibility": "public",
            "showroom_seed": True,
            "seo_title": "Apply for Full Stack Engineer (Remote) | EventThon Jobs",
            "seo_description": "Ship edge-ready APIs and showroom pages for the EventThon network.",
            "experience_level": "Mid Level",
            "work_mode": "Remote",
            "skills_tags": ["Node.js", "MongoDB", "API", "TypeScript"],
            "keywords": ["remote", "full stack", "EventThon jobs"],
        },
    ]
    now = datetime.utcnow()
    for doc in rows:
        jid = doc["_id"]
        await jobs_collection.update_one(
            {"_id": jid},
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )


async def upsert_showroom_gig() -> None:
    now = datetime.utcnow()
    seller = {
        "displayName": "Ahmad Hadi",
        "level": "Level 2 Seller",
        "location": "Pakistan",
        "reach": "Worldwide",
        "languages": ["English", "Urdu"],
        "responseTime": "1h response",
    }
    seo_packages = [
        {
            "id": "basic", "name": "Basic", "price": 120,
            "description": "Essential SEO audit with actionable on-page recommendations.",
            "deliveryDays": 5, "revisions": 1,
            "features": ["SEO Audit (Up to 150 Pages)", "On-Page Optimization Report", "Keywords Research (50)"],
        },
        {
            "id": "standard", "name": "Standard", "price": 240,
            "description": "Most popular package with technical fixes and competitor insights.",
            "deliveryDays": 4, "revisions": 3, "popular": True,
            "features": ["Everything in Basic", "Technical SEO Fixes", "Competitor Analysis", "Keywords Research (150)"],
        },
        {
            "id": "premium", "name": "Premium", "price": 450,
            "description": "Full-service SEO strategy with outreach plan and extended support.",
            "deliveryDays": 3, "revisions": 5,
            "features": ["Everything in Standard", "Full Site SEO Strategy", "Backlink Outreach Plan", "30-Day Support"],
        },
    ]
    gigs = [
        {
            "title": "I will do complete SEO audit and boost your website ranking",
            "description": (
                "Professional SEO audit with keyword research, technical fixes, and a prioritized roadmap "
                "to improve rankings on Google. Ideal for startups and global storefronts."
            ),
            "category": "SEO & Marketing",
            "starting_price": 120.0,
            "seller_user_id": "showroom-seller",
            "status": "Published",
            "visibility": "public",
            "showroom_seed": True,
            "public_slug": "logo-brand-kit-design",
            "tags": ["SEO", "Audit", "Keyword Research", "Technical SEO"],
            "skills_tags": ["SEO", "Audit", "Keyword Research", "Technical SEO"],
            "delivery_time": "5 Days",
            "pricing": {"delivery_days": 5},
            "orders": 284,
            "rating": 4.9,
            "packages": seo_packages,
            "seller_profile": seller,
            "deliverables": ["PDF", "XLSX", "DOCX", "MP4"],
            "gallery": [
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            ],
            "live_preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            "seo_title": "Complete SEO Audit & Ranking Boost | EventThon Gigs",
            "seo_description": "Professional SEO audit with keyword research, technical fixes, and fast delivery.",
            "keywords": ["SEO", "audit", "ranking", "EventThon", "marketplace"],
            "updated_at": now,
        },
        {
            "title": "Keyword Research & Content Plan",
            "description": "Data-driven keyword clusters and a 90-day content calendar for organic growth.",
            "category": "SEO & Marketing",
            "starting_price": 89.0,
            "seller_user_id": "showroom-seller",
            "status": "Published",
            "visibility": "public",
            "showroom_seed": True,
            "public_slug": "keyword-research-content-plan",
            "skills_tags": ["SEO", "Content Strategy", "Keywords"],
            "delivery_time": "3 Days",
            "pricing": {"delivery_days": 3},
            "orders": 156,
            "rating": 4.8,
            "seller_profile": seller,
            "updated_at": now,
        },
        {
            "title": "Technical SEO Fix Package",
            "description": "Core Web Vitals, crawl errors, schema markup, and indexation fixes for modern sites.",
            "category": "SEO & Marketing",
            "starting_price": 199.0,
            "seller_user_id": "showroom-seller",
            "status": "Published",
            "visibility": "public",
            "showroom_seed": True,
            "public_slug": "technical-seo-fix-package",
            "skills_tags": ["Technical SEO", "Core Web Vitals", "Schema"],
            "delivery_time": "4 Days",
            "pricing": {"delivery_days": 4},
            "orders": 98,
            "rating": 4.9,
            "seller_profile": seller,
            "updated_at": now,
        },
    ]
    for doc in gigs:
        slug = doc["public_slug"]
        await gigs_collection.update_one(
            {"public_slug": slug},
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )


async def sync_squad_public_fields() -> None:
    await ensure_seed_data()
    async for squad in squad_collection.find(
        {"$or": [{"slug": {"$exists": False}}, {"slug": ""}, {"slug": None}]}
    ):
        name = squad.get("squad_name") or ""
        slug = slugify(name)
        if not slug:
            continue
        patch = {"slug": slug, "updated_at": datetime.utcnow()}
        settings = squad.get("settings") if isinstance(squad.get("settings"), dict) else {}
        if settings.get("publicListing") is not False:
            patch["settings"] = {**settings, "publicListing": True}
        await squad_collection.update_one({"_id": squad["_id"]}, {"$set": patch})


async def _run_seed_sync() -> None:
    await upsert_showroom_projects()
    await upsert_showroom_jobs()
    await upsert_showroom_gig()
    await sync_squad_public_fields()


async def ensure_all_public_seeds(force: bool = False) -> None:
    """Sync demo showroom data once per process (startup). Avoid on every read."""
    global _seeds_ready
    if _seeds_ready and not force:
        return
    async with _seed_lock:
        if _seeds_ready and not force:
            return
        await _run_seed_sync()
        _seeds_ready = True

# Backwards-compatible aliases
ensure_public_jobs = upsert_showroom_jobs
ensure_public_showroom_projects = upsert_showroom_projects
ensure_demo_public_gig = upsert_showroom_gig
