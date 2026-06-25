"""Entity-level carousel intelligence for articles, gigs, jobs, and projects."""
from __future__ import annotations

import re

from ai_engine.training import HIGHLIGHT_CONTEXTS, POST_TYPE_TO_CONTEXT
from backend_routes.dashboard.carousel_intel_engine import evaluate_carousel_highlight


def _post_metrics(post: dict) -> dict:
    return {
        "title": str(post.get("title") or post.get("content") or "")[:160],
        "content": str(post.get("content") or "")[:2400],
        "progress_percent": post.get("progress_percent"),
        "achievement_metric": str(post.get("achievement_metric") or ""),
    }


def _article_metrics(article: dict) -> dict:
    return {
        "title": str(article.get("title") or ""),
        "content": str(article.get("content") or "")[:2400],
        "word_count": int(article.get("word_count") or 0),
        "seo_score": int(article.get("seo_score") or 0),
        "reading_time": int(article.get("reading_time") or 0),
    }


def _gig_metrics(gig: dict) -> dict:
    return {
        "title": str(gig.get("title") or ""),
        "description": str(gig.get("description") or "")[:2400],
        "starting_price": float(gig.get("starting_price") or 0),
        "category": str(gig.get("category") or ""),
    }


def _job_metrics(job: dict) -> dict:
    band = job.get("compensation_band") or {}
    return {
        "title": str(job.get("title") or ""),
        "description": str(job.get("description") or job.get("summary") or "")[:2400],
        "salary_min": int(band.get("min") or 0),
        "salary_max": int(band.get("max") or 0),
    }


def _project_metrics(project: dict) -> dict:
    return {
        "title": str(project.get("title") or ""),
        "description": str(project.get("short_description") or project.get("description") or "")[:2400],
        "progress_percent": project.get("progress_percent") or project.get("progress"),
        "budget": _parse_budget_value(project.get("budget")),
        "milestones": len(project.get("milestones") or []),
    }


def _parse_budget_value(raw) -> float:
    text = str(raw or "").lower().replace(",", "")
    nums = re.findall(r"(\d+(?:\.\d+)?)", text)
    if not nums:
        return 0.0
    peak = max(float(num) for num in nums)
    return peak * 1000 if "k" in text else peak


def metrics_for_context(context: str, doc: dict) -> dict:
    ctx = str(context or "").lower()
    if ctx == "article":
        return _article_metrics(doc)
    if ctx == "gig":
        return _gig_metrics(doc)
    if ctx == "job":
        return _job_metrics(doc)
    if ctx == "project":
        return _project_metrics(doc)
    if ctx == "achievement":
        return _post_metrics(doc)
    return {}


async def apply_carousel_intel(doc: dict, context: str | None = None) -> dict:
    if _truthy_flag(doc.get("attach_to_squad")):
        doc["squad_activity_feed"] = True
        doc["is_carousel_update"] = False
        return doc

    ctx = str(context or doc.get("update_type") or "").strip().lower()
    if not ctx:
        post_type = str(doc.get("post_type") or "").upper()
        ctx = POST_TYPE_TO_CONTEXT.get(post_type, "")
    if ctx not in HIGHLIGHT_CONTEXTS:
        doc["is_carousel_update"] = False
        return doc

    metrics = metrics_for_context(ctx, doc)
    doc["update_type"] = ctx
    doc["is_carousel_update"] = await evaluate_carousel_highlight(ctx, metrics)
    return doc


def _truthy_flag(value) -> bool:
    if value is True:
        return True
    return str(value or "").strip().lower() in {"true", "1", "yes", "on"}
