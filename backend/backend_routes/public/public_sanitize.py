"""Field allow-lists and sanitizers for public SEO endpoints."""
from __future__ import annotations

import re
from html import unescape
from typing import Any, Dict, List, Optional

from backend_routes.admin.user_format import format_user_data
from .public_defaults import (
    DEFAULT_PROJECT_FEATURES,
    DEFAULT_PROJECT_HIGHLIGHTS,
    DEFAULT_PROJECT_METRICS,
    DEFAULT_PROJECT_MILESTONES,
)
from .public_project_fields import (
    build_metrics_from_seo,
    build_recent_activity,
    build_seo_metrics,
    normalize_milestone_rows,
    resolve_project_imageurl,
)

_TAG_RE = re.compile(r"<[^>]+>")
_MOBILE_RE = re.compile(r"^\+?\d{10,15}$")
_BASE_URL = "http://127.0.0.1:8000"

_SENSITIVE_USER_KEYS = frozenset(
    {
        "email",
        "mobile",
        "password",
        "wallet_balance",
        "skill_score",
        "id_front",
        "id_back",
        "verification_notes",
        "admin_notes",
        "session_notes",
        "internal_notes",
        "auth_provider",
        "role",
    }
)


def slugify(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", str(value or "").strip().lower())
    return text.strip("-")


def _resolve_media_url(value: Any) -> Optional[str]:
    if not value or not isinstance(value, str):
        return None
    trimmed = value.strip()
    if not trimmed:
        return None
    if trimmed.startswith("http") or trimmed.startswith("data:"):
        return trimmed
    if trimmed.startswith("/"):
        return f"{_BASE_URL}{trimmed}"
    return f"{_BASE_URL}/{trimmed}"


def sanitize_text(raw: Any, max_len: int = 2000) -> str:
    text = unescape(str(raw or ""))
    text = _TAG_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > max_len:
        return text[: max_len - 3].rstrip() + "..."
    return text


def build_seo_fields(
    seo_title: str,
    seo_description: str,
    skills_tags: List[str],
    keywords: List[str],
) -> Dict[str, Any]:
    tags = [str(t).strip() for t in skills_tags if str(t).strip()][:24]
    keys = [str(k).strip() for k in keywords if str(k).strip()][:32]
    return {
        "seo_title": sanitize_text(seo_title, 120),
        "seo_description": sanitize_text(seo_description, 160),
        "skills_tags": tags,
        "keywords": keys,
    }


def _skills_list(doc: Dict[str, Any]) -> List[str]:
    raw = doc.get("top_skills") or doc.get("skills") or []
    out: List[str] = []
    for item in raw if isinstance(raw, list) else []:
        if isinstance(item, str) and item.strip():
            out.append(item.strip())
        elif isinstance(item, dict):
            name = item.get("name") or item.get("skill") or item.get("label")
            if name and str(name).strip():
                out.append(str(name).strip())
    return out[:24]


def _portfolio_links(doc: Dict[str, Any]) -> List[Dict[str, str]]:
    links: List[Dict[str, str]] = []
    for item in doc.get("social_links") or []:
        if not isinstance(item, dict):
            continue
        url = (item.get("url") or item.get("link") or "").strip()
        if not url.startswith("http"):
            continue
        label = (item.get("platform") or item.get("label") or item.get("type") or "Link").strip()
        links.append({"label": label[:60], "url": url[:500]})
    for proj in doc.get("projects") or []:
        if not isinstance(proj, dict):
            continue
        url = (proj.get("url") or proj.get("link") or proj.get("project_url") or "").strip()
        if not url.startswith("http"):
            continue
        title = (proj.get("title") or proj.get("name") or "Portfolio").strip()
        links.append({"label": title[:80], "url": url[:500]})
    return links[:12]


def public_user_payload(doc: Dict[str, Any]) -> Dict[str, Any]:
    safe = format_user_data(dict(doc))
    for key in _SENSITIVE_USER_KEYS:
        safe.pop(key, None)

    fn = (safe.get("first_name") or "").strip()
    ln = (safe.get("last_name") or "").strip()
    display_name = f"{fn} {ln}".strip() or "EventThon Member"
    role = (safe.get("niche") or safe.get("headline") or "Professional").strip()
    handle_src = safe.get("user_id") or safe.get("public_id") or "member"
    handle = str(handle_src).replace(" ", "").lower()[:40]
    if _MOBILE_RE.fullmatch(handle):
        handle = (safe.get("public_id") or "member").lower()

    bio = sanitize_text(safe.get("bio") or safe.get("headline") or "")
    avatar = _resolve_media_url(safe.get("profile_image_url") or safe.get("avatar"))

    return {
        "displayName": display_name,
        "avatar": avatar,
        "dynamicBio": bio,
        "skillsArray": _skills_list(safe),
        "publicPortfolioLinks": _portfolio_links(safe),
        "professionalRole": role,
        "handle": handle,
        "verified": str(safe.get("identity_status") or "").lower() in {"active", "verified"},
    }


def public_squad_payload(squad: Dict[str, Any]) -> Dict[str, Any]:
    members = squad.get("members") or []
    preview = []
    for m in members[:8]:
        if not isinstance(m, dict):
            continue
        preview.append(
            {
                "displayName": sanitize_text(m.get("name") or "Member", 80),
                "avatar": normalize_member_avatar_public(m),
                "role": sanitize_text(m.get("role") or "Member", 40),
            }
        )
    name = sanitize_text(squad.get("squad_name") or "Squad", 120)
    niche = sanitize_text(squad.get("niche") or "Collaboration Squad", 80)
    bio = sanitize_text(squad.get("description") or "")
    tags = [niche] if niche else []
    keywords = squad.get("keywords") if isinstance(squad.get("keywords"), list) else tags + ["squad", "EventThon"]
    seo = build_seo_fields(
        squad.get("seo_title") or f"{name} | EventThon Squads",
        squad.get("seo_description") or bio,
        tags,
        keywords,
    )
    return {
        "displayName": name,
        "avatar": _resolve_media_url(squad.get("banner")) or None,
        "icon": squad.get("icon"),
        "dynamicBio": bio,
        "skillsArray": tags,
        "publicPortfolioLinks": [],
        "professionalRole": niche,
        "memberCount": len(members),
        "membersPreview": preview,
        "squadSlug": squad.get("slug") or slugify(name) or str(squad.get("_id") or ""),
        **seo,
    }


def _squad_project_progress(project: dict) -> int:
    progress = project.get("progress")
    if progress is not None:
        try:
            return max(0, min(100, int(progress)))
        except (TypeError, ValueError):
            pass
    status = str(project.get("status") or "").lower()
    if "complete" in status:
        return 100
    if "hold" in status:
        return 40
    if "plan" in status:
        return 25
    return 65


def _public_squad_members(members: list) -> list:
    rows = []
    for member in members[:12]:
        if not isinstance(member, dict):
            continue
        rows.append(
            {
                "displayName": sanitize_text(member.get("name") or "Member", 80),
                "avatar": normalize_member_avatar_public(member),
                "role": sanitize_text(member.get("role") or "Member", 40),
                "online": bool(member.get("online")),
            }
        )
    return rows


def public_squad_showroom_payload(squad: Dict[str, Any]) -> Dict[str, Any]:
    base = public_squad_payload(squad)
    members = squad.get("members") if isinstance(squad.get("members"), list) else []
    projects = squad.get("projects") if isinstance(squad.get("projects"), list) else []
    files = squad.get("files") if isinstance(squad.get("files"), list) else []
    feed = squad.get("activity_feed") if isinstance(squad.get("activity_feed"), list) else []
    settings = squad.get("settings") if isinstance(squad.get("settings"), dict) else {}
    online = sum(1 for m in members if isinstance(m, dict) and m.get("online"))

    active_projects = []
    for project in projects[:8]:
        if not isinstance(project, dict):
            continue
        tags = project.get("tags") if isinstance(project.get("tags"), list) else []
        active_projects.append(
            {
                "id": str(project.get("id") or ""),
                "title": sanitize_text(project.get("title") or "Project", 120),
                "status": sanitize_text(project.get("status") or "Active", 40),
                "progress": _squad_project_progress(project),
                "owner": sanitize_text(project.get("owner") or "Team", 60),
                "tags": [sanitize_text(t, 30) for t in tags[:3]],
            }
        )

    recent_activity = []
    for item in feed[:8]:
        if not isinstance(item, dict):
            continue
        recent_activity.append(
            {
                "id": str(item.get("id") or len(recent_activity)),
                "text": sanitize_text(item.get("text") or item.get("message") or "Squad activity", 200),
                "actor": sanitize_text(item.get("actor_name") or item.get("actor") or "Member", 80),
                "time": sanitize_text(item.get("time") or item.get("created_at") or "Recently", 40),
            }
        )

    recent_files = []
    for item in files[:8]:
        if not isinstance(item, dict):
            continue
        recent_files.append(
            {
                "id": str(item.get("id") or len(recent_files)),
                "name": sanitize_text(item.get("name") or "File", 120),
                "size": sanitize_text(item.get("size") or "—", 20),
                "uploaded": sanitize_text(item.get("uploaded") or "Recently", 40),
            }
        )

    created = squad.get("created_at")
    created_label = "Recently"
    if created:
        try:
            from datetime import datetime

            if isinstance(created, datetime):
                created_label = created.strftime("%b %d, %Y")
            else:
                created_label = str(created)[:10]
        except Exception:
            pass

    keywords = squad.get("keywords") if isinstance(squad.get("keywords"), list) else []
    about_tags = [sanitize_text(t, 40) for t in keywords[:8]]
    if not about_tags:
        about_tags = [sanitize_text(t, 40) for t in base.get("skillsArray", [])[:6]]

    return {
        **base,
        "isPublic": settings.get("publicListing", True) is not False,
        "createdLabel": created_label,
        "language": sanitize_text(squad.get("language") or "English", 40),
        "countryCode": sanitize_text(squad.get("country_code") or "PK", 8),
        "squadRank": sanitize_text(squad.get("rank") or "Pro", 40),
        "headerStats": {
            "members": len(members),
            "online": online,
            "projects": len(projects),
            "activityScore": sanitize_text(squad.get("efficiency") or "98%", 12),
            "rank": sanitize_text(squad.get("rank") or "Pro", 40),
        },
        "tabCounts": {
            "projects": len(projects),
            "members": len(members),
            "discussions": max(28, len(feed) * 3),
            "files": len(files) or 15,
        },
        "aboutTags": about_tags,
        "activeProjects": active_projects,
        "recentActivity": recent_activity,
        "recentFiles": recent_files,
        "members": _public_squad_members(members),
        "activityTrend": squad.get("trend_7d") if isinstance(squad.get("trend_7d"), list) else [30, 38, 35, 54, 62, 48, 70],
        "overview": {
            "level": sanitize_text(squad.get("rank") or "Pro", 40),
            "xpCurrent": int(squad.get("xp_current") or 2450),
            "xpGoal": int(squad.get("xp_goal") or 5000),
            "goals": [
                "Complete 10 Projects",
                "Reach 50 Members",
                "Maintain 90% Activity",
            ],
        },
        "squadStats": [
            {"label": "Total Members", "value": str(len(members)), "delta": "+18 this month"},
            {"label": "Active Members", "value": str(online), "delta": "+12 this month"},
            {"label": "Total Projects", "value": str(len(projects)), "delta": "+3 this month"},
            {"label": "Total Discussions", "value": str(max(28, len(feed) * 4)), "delta": "+8 this month"},
            {"label": "Files Shared", "value": str(len(files) or 15), "delta": "+5 this month"},
            {"label": "Activity Score", "value": sanitize_text(squad.get("efficiency") or "98%"), "delta": "Excellent"},
        ],
    }


def normalize_member_avatar_public(member: dict) -> str:
    avatar = member.get("avatar")
    resolved = _resolve_media_url(avatar) if avatar else None
    if resolved:
        return resolved
    seed = sanitize_text(member.get("name") or "member", 40).replace(" ", "-").lower()
    return f"https://api.dicebear.com/8.x/thumbs/svg?seed={seed}"


def public_gig_payload(gig: Dict[str, Any], seller: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    title = sanitize_text(gig.get("title") or "Gig", 140)
    category = sanitize_text(gig.get("category") or "Service", 80)
    description = sanitize_text(gig.get("description") or "", 5000)
    tags = [str(t).strip() for t in (gig.get("skills_tags") or gig.get("tags") or []) if str(t).strip()][:12]
    pricing = gig.get("pricing") if isinstance(gig.get("pricing"), dict) else {}
    delivery_days = pricing.get("delivery_days") or gig.get("delivery_days") or 3
    delivery_duration = sanitize_text(gig.get("delivery_time") or f"{delivery_days} Days", 40)
    price = float(gig.get("starting_price") or 0)

    gallery_links = []
    cover = None
    for item in gig.get("gallery") or []:
        url = item if isinstance(item, str) else (item.get("url") if isinstance(item, dict) else None)
        resolved = _resolve_media_url(url) if url else None
        if resolved:
            if not cover:
                cover = resolved
            gallery_links.append({"label": "Gallery", "url": resolved})

    preview = (gig.get("live_preview_url") or gig.get("cover_preview") or gig.get("thumbnail") or "").strip()
    if preview and not preview.startswith("http"):
        preview = _resolve_media_url(preview) or preview
    if not cover and preview.startswith("http"):
        cover = preview

    imageurl = cover or (preview if preview.startswith("http") else "")

    seller_name = "Creator"
    seller_avatar = None
    seller_verified = False
    if seller:
        seller_public = public_user_payload(seller)
        seller_name = seller_public["displayName"]
        seller_avatar = seller_public["avatar"]
        seller_verified = seller_public.get("verified", False)

    keywords = gig.get("keywords") or tags + [category, "freelance", "marketplace", "EventThon"]
    seo = build_seo_fields(
        gig.get("seo_title") or f"{title} | Global Freelance Marketplace | EventThon",
        gig.get("seo_description") or description,
        tags,
        keywords if isinstance(keywords, list) else list(keywords),
    )

    delivery_meter = min(100, max(10, int((5 / max(delivery_days, 1)) * 20)))

    return {
        "displayName": title,
        "gigTitle": title,
        "imageurl": imageurl,
        "avatar": cover,
        "previewImageUrl": imageurl,
        "dynamicBio": description,
        "serviceDescription": description,
        "skillsArray": tags,
        "publicPortfolioLinks": gallery_links,
        "professionalRole": category,
        "startingPrice": price,
        "globalPricing": f"${price:,.0f}",
        "deliveryDuration": delivery_duration,
        "deliveryDays": int(delivery_days),
        "deliveryMeter": delivery_meter,
        "rating": float(gig.get("rating") or 0),
        "orders": int(gig.get("orders") or 0),
        "creatorBadge": {
            "displayName": seller_name,
            "avatar": seller_avatar,
            "verified": seller_verified,
        },
        "seller": {"displayName": seller_name, "avatar": seller_avatar},
        "gigId": str(gig.get("_id") or ""),
        "publicSlug": gig.get("public_slug") or slugify(title),
        **seo,
    }


def public_project_payload(doc: Dict[str, Any]) -> Dict[str, Any]:
    title = sanitize_text(doc.get("title") or doc.get("name") or "Project", 140)
    summary = sanitize_text(doc.get("short_description") or doc.get("description") or "", 2000)
    tags = [
        str(t).strip()
        for t in (doc.get("skills_tags") or doc.get("tech_stack") or doc.get("tags") or [])
        if str(t).strip()
    ][:16]
    keywords = doc.get("keywords") if isinstance(doc.get("keywords"), list) else tags + ["EventThon", "portfolio", "project"]
    seo = build_seo_fields(
        doc.get("seo_title") or f"{title} | EventThon Projects",
        doc.get("seo_description") or summary,
        tags,
        keywords,
    )
    preview = (doc.get("live_preview_url") or doc.get("cover_preview") or "").strip()
    if preview and not preview.startswith("http"):
        preview = _resolve_media_url(preview) or preview

    members = []
    for member in doc.get("members") or []:
        if not isinstance(member, dict):
            continue
        members.append(
            {
                "displayName": sanitize_text(member.get("name") or "Member", 80),
                "role": sanitize_text(member.get("role") or "Contributor", 40),
                "initials": sanitize_text(member.get("initials") or "", 4),
                "online": bool(member.get("online")),
                "rating": float(member.get("rating") or 4.8),
                "projectCount": int(member.get("projects") or 0),
            }
        )

    slug = doc.get("public_slug") or slugify(title)
    github = (doc.get("github_url") or doc.get("githubUrl") or "").strip()
    if github and not github.startswith("http"):
        github = _resolve_media_url(github) or github
    created = doc.get("created_at")
    updated = doc.get("updated_at")
    created_label = created.strftime("%b %d, %Y") if hasattr(created, "strftime") else "—"
    updated_label = updated.strftime("%b %d, %Y") if hasattr(updated, "strftime") else "—"
    highlights = doc.get("highlights") or DEFAULT_PROJECT_HIGHLIGHTS
    milestones = normalize_milestone_rows(doc.get("milestones") or DEFAULT_PROJECT_MILESTONES)
    features = doc.get("features") or DEFAULT_PROJECT_FEATURES
    portfolio = _portfolio_links(doc)
    if github:
        portfolio = [{"label": "GitHub", "url": github}] + [p for p in portfolio if "github" not in p.get("url", "").lower()]

    live = preview if preview.startswith("http") else ""
    imageurl = resolve_project_imageurl(doc, preview, _resolve_media_url)
    seo_metrics = build_seo_metrics(doc, doc.get("metrics") or DEFAULT_PROJECT_METRICS)
    metrics = build_metrics_from_seo(seo_metrics)
    recent_activity = build_recent_activity(doc, milestones)
    milestone_progress = int(doc.get("milestone_progress") or seo_metrics["performance_percentage"] or 75)

    return {
        "projectId": str(doc.get("_id") or ""),
        "publicSlug": slug,
        "projectName": title,
        "summary": summary,
        "longDescription": sanitize_text(doc.get("description") or summary, 4000),
        "features": [sanitize_text(f, 200) for f in features if f][:8],
        "techStackTags": tags,
        "livePreviewUrl": live,
        "visitSiteUrl": live or doc.get("visit_site_url") or "",
        "imageurl": imageurl,
        "imageUrl": imageurl,
        "previewImageUrl": imageurl,
        "githubUrl": github,
        "teamMembers": members,
        "category": sanitize_text(doc.get("category") or "Technology", 80),
        "metrics": metrics,
        "seo_metrics": seo_metrics,
        "performance_percentage": seo_metrics["performance_percentage"],
        "highlights": highlights,
        "milestones": milestones,
        "recentActivity": recent_activity,
        "squadName": sanitize_text(doc.get("squad_name") or "EventThon Squad", 80),
        "license": sanitize_text(doc.get("license") or "MIT", 40),
        "visibility": "Public",
        "createdLabel": created_label,
        "updatedLabel": updated_label,
        "milestoneProgress": milestone_progress,
        "publicPortfolioLinks": portfolio,
        **seo,
    }


def public_job_payload(doc: Dict[str, Any]) -> Dict[str, Any]:
    title = sanitize_text(doc.get("title") or "Role", 140)
    category = sanitize_text(doc.get("category") or "General", 60)
    summary = sanitize_text(doc.get("summary") or doc.get("description") or "", 2000)
    tags = [str(t).strip() for t in (doc.get("skills_tags") or doc.get("tags") or []) if str(t).strip()][:16]
    keywords = doc.get("keywords") if isinstance(doc.get("keywords"), list) else tags + ["remote", "jobs", "EventThon"]
    remote = bool(doc.get("remote", True))
    seo = build_seo_fields(
        doc.get("seo_title") or f"Apply for {title} (Remote) | EventThon Jobs",
        doc.get("seo_description") or summary,
        tags,
        keywords,
    )
    requirements = [
        sanitize_text(r, 240) for r in (doc.get("application_requirements") or doc.get("requirements") or []) if r
    ][:12]

    salary = sanitize_text(doc.get("salary_range") or doc.get("salary") or "Competitive", 60)

    return {
        "jobId": str(doc.get("_id") or ""),
        "publicSlug": doc.get("public_slug") or slugify(title),
        "jobTitle": title,
        "category": category,
        "remote": remote,
        "salaryRange": salary,
        "compensationBand": {"min": 90, "max": 160, "label": salary},
        "summary": summary,
        "applicationRequirements": requirements,
        **seo,
    }
