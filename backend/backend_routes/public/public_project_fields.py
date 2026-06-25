"""Normalize project showroom fields for public API payloads."""
from __future__ import annotations

from typing import Any

from .public_defaults import DEFAULT_PROJECT_MILESTONES

DEFAULT_RECENT_ACTIVITY = [
    {"title": "Initial repository seed active", "detail": "Project scaffold published to showroom", "status": "completed"},
    {"title": "SEO audit initialized", "detail": "Baseline keyword and traffic tracking enabled", "status": "completed"},
    {"title": "Analytics snapshot synced", "detail": "Performance and ranking metrics refreshed", "status": "in-progress"},
    {"title": "Collaboration channel opened", "detail": "Squad contributors can request access", "status": "pending"},
]


def resolve_project_imageurl(doc: dict, preview: str, resolve_media) -> str:
    for key in ("imageurl", "cover_image", "cover_preview", "banner"):
        raw = str(doc.get(key) or "").strip()
        if not raw:
            continue
        if raw.startswith("http"):
            return raw
        resolved = resolve_media(raw)
        if resolved:
            return resolved
    return preview if preview.startswith("http") else ""


def normalize_milestone_rows(raw: Any) -> list[dict]:
    rows: list[dict] = []
    for item in raw or []:
        if isinstance(item, str):
            label = item.strip()
            if not label:
                continue
            rows.append({"title": label, "description": label, "status": "pending", "progress": 0})
            continue
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or item.get("label") or "Milestone").strip()
        status = str(item.get("status") or "pending").strip().lower()
        rows.append(
            {
                "title": title,
                "description": str(item.get("description") or title).strip(),
                "status": status,
                "progress": int(item.get("progress") or 0),
            }
        )
    return rows or list(DEFAULT_PROJECT_MILESTONES)


def build_seo_metrics(doc: dict, metrics: list[dict]) -> dict:
    raw = doc.get("seo_metrics") if isinstance(doc.get("seo_metrics"), dict) else {}
    lookup = {str(m.get("id") or ""): m for m in metrics if isinstance(m, dict)}

    def pick(metric_id: str, fallback_key: str, default: str) -> str:
        if raw.get(fallback_key):
            return str(raw[fallback_key])
        row = lookup.get(metric_id) or {}
        return str(row.get("value") or default)

    performance = int(doc.get("performance_percentage") or raw.get("performance_percentage") or 98)
    return {
        "organic_traffic": pick("traffic", "organic_traffic", "12.4K"),
        "keyword_ranking": pick("keywords", "keyword_ranking", "325"),
        "backlinks": pick("backlinks", "backlinks", "1.8K"),
        "seo_score": pick("seo_score", "seo_score", "92/100"),
        "performance_percentage": performance,
    }


def build_metrics_from_seo(seo_metrics: dict) -> list[dict]:
    return [
        {"id": "traffic", "label": "Organic Traffic", "value": seo_metrics["organic_traffic"], "delta": "+18.6% (30 days)", "tone": "green", "barPercent": 78},
        {"id": "keywords", "label": "Keyword Ranking", "value": seo_metrics["keyword_ranking"], "hint": "Top 10 Keywords", "tone": "violet", "barPercent": 65},
        {"id": "backlinks", "label": "Backlinks", "value": seo_metrics["backlinks"], "delta": "+21.3% (30 days)", "tone": "blue", "barPercent": 72},
        {"id": "seo_score", "label": "SEO Score", "value": seo_metrics["seo_score"], "hint": "Excellent", "tone": "green", "barPercent": 92},
        {"id": "performance", "label": "Performance", "value": f"{seo_metrics['performance_percentage']}%", "hint": "Core Web Vitals", "tone": "green", "barPercent": seo_metrics["performance_percentage"]},
    ]


def build_recent_activity(doc: dict, milestones: list[dict]) -> list[dict]:
    feed = doc.get("recent_activity") or doc.get("activity_log") or []
    rows: list[dict] = []
    for item in feed:
        if isinstance(item, str) and item.strip():
            rows.append({"title": item.strip(), "detail": item.strip(), "status": "completed"})
            continue
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or item.get("text") or item.get("message") or "Project activity").strip()
        rows.append(
            {
                "title": title,
                "detail": str(item.get("detail") or item.get("description") or title).strip(),
                "status": str(item.get("status") or "completed").strip().lower(),
            }
        )
    if rows:
        return rows[:8]
    if milestones:
        return [
            {
                "title": m.get("title") or "Milestone update",
                "detail": m.get("description") or m.get("title") or "Milestone tracked",
                "status": m.get("status") or "pending",
            }
            for m in milestones[:4]
        ]
    return list(DEFAULT_RECENT_ACTIVITY)
