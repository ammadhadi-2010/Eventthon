"""Load AI-flagged carousel highlights from platform collections."""
from __future__ import annotations

from datetime import datetime

from database import gigs_collection, hub_projects_collection, jobs_collection, post_collection
from backend_routes.dashboard.articles.article_config import article_collection


def _iso(value) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value or "")


def _title_from_content(content: str, fallback: str) -> str:
    line = str(content or "").strip().split("\n", 1)[0].strip()
    if not line:
        return fallback
    return line[:120]


def _normalize_row(
    *,
    row_id: str,
    update_type: str,
    title: str,
    message: str,
    created_at,
    imageurl: str = "",
    author_name: str = "EventThon Member",
    author_title: str = "Member",
    action_url: str = "",
    progress_percent=None,
    achievement_metric: str = "",
) -> dict:
    return {
        "id": row_id,
        "update_type": update_type,
        "title": title or "Platform update",
        "message": message or "",
        "imageurl": imageurl,
        "author_name": author_name,
        "author_title": author_title,
        "author_imageurl": imageurl,
        "created_at": _iso(created_at),
        "action_url": action_url,
        "likes_count": 0,
        "comments_count": 0,
        "progress_percent": progress_percent,
        "achievement_metric": achievement_metric,
    }


def _normalize_post(doc: dict) -> dict:
    content = str(doc.get("content") or "")
    update_type = str(doc.get("update_type") or doc.get("post_type") or "article").lower()
    if update_type == "win":
        update_type = "achievement"
    return _normalize_row(
        row_id=str(doc.get("_id") or ""),
        update_type=update_type,
        title=_title_from_content(content, "Network highlight"),
        message=content[:240],
        created_at=doc.get("created_at"),
        imageurl=str(doc.get("imageurl") or ""),
        author_name=str(doc.get("author_name") or "EventThon Member"),
        author_title=str(doc.get("author_title") or "Member"),
        progress_percent=doc.get("progress_percent"),
        achievement_metric=str(doc.get("achievement_metric") or ""),
    )


def _normalize_article(doc: dict) -> dict:
    return _normalize_row(
        row_id=str(doc.get("_id") or ""),
        update_type="article",
        title=str(doc.get("title") or "Article highlight"),
        message=str(doc.get("excerpt") or doc.get("content") or "")[:240],
        created_at=doc.get("created_at"),
        imageurl=str(doc.get("imageurl") or doc.get("cover_image") or ""),
        author_name=str(doc.get("author_name") or "EventThon Member"),
        author_title=str(doc.get("author_title") or "Author"),
        action_url=f"/article/{doc.get('slug') or ''}",
    )


def _normalize_gig(doc: dict) -> dict:
    return _normalize_row(
        row_id=str(doc.get("_id") or ""),
        update_type="gig",
        title=str(doc.get("title") or "Gig highlight"),
        message=str(doc.get("description") or "")[:240],
        created_at=doc.get("created_at"),
        imageurl=str(doc.get("imageurl") or ""),
        action_url=f"/gigs/{doc.get('_id')}",
    )


def _normalize_job(doc: dict) -> dict:
    return _normalize_row(
        row_id=str(doc.get("_id") or ""),
        update_type="job",
        title=str(doc.get("title") or "Job highlight"),
        message=str(doc.get("summary") or doc.get("description") or "")[:240],
        created_at=doc.get("created_at"),
    )


def _normalize_hub_project(doc: dict) -> dict:
    return _normalize_row(
        row_id=str(doc.get("_id") or ""),
        update_type="project",
        title=str(doc.get("title") or "Project highlight"),
        message=str(doc.get("short_description") or doc.get("description") or "")[:240],
        created_at=doc.get("created_at"),
        imageurl=str(doc.get("imageurl") or doc.get("cover_preview") or ""),
        action_url=f"/projects/{doc.get('_id')}",
    )


async def fetch_carousel_highlights(limit: int = 40) -> list[dict]:
    per_source = max(8, limit // 5)
    rows: list[dict] = []

    posts = await post_collection.find({"is_carousel_update": True}).sort("created_at", -1).to_list(length=per_source)
    rows.extend(_normalize_post(doc) for doc in posts)

    articles = await article_collection.find(
        {"is_carousel_update": True, "status": "published"}
    ).sort("created_at", -1).to_list(length=per_source)
    rows.extend(_normalize_article(doc) for doc in articles)

    gigs = await gigs_collection.find(
        {"is_carousel_update": True, "status": {"$in": ["Published", "published"]}}
    ).sort("created_at", -1).to_list(length=per_source)
    rows.extend(_normalize_gig(doc) for doc in gigs)

    jobs = await jobs_collection.find({"is_carousel_update": True}).sort("created_at", -1).to_list(length=per_source)
    rows.extend(_normalize_job(doc) for doc in jobs)

    projects = await hub_projects_collection.find({"is_carousel_update": True}).sort("created_at", -1).to_list(length=per_source)
    rows.extend(_normalize_hub_project(doc) for doc in projects)

    rows.sort(key=lambda item: item.get("created_at") or "", reverse=True)
    deduped: list[dict] = []
    seen: set[str] = set()
    for row in rows:
        row_id = str(row.get("id") or "")
        if not row_id or row_id in seen:
            continue
        seen.add(row_id)
        deduped.append(row)
        if len(deduped) >= limit:
            break
    return deduped
