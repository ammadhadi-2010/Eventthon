"""Format helpers for admin automation posts."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List


def _relative_time(ts: Any) -> str:
    if not ts:
        return "—"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return ts[:16] if len(ts) > 16 else str(ts)
    if not isinstance(ts, datetime):
        return "—"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(delta.total_seconds())
    if sec < 60:
        return "Just now"
    if sec < 3600:
        return f"{max(1, sec // 60)} mins ago"
    if sec < 86400:
        return f"{sec // 3600} hours ago"
    return f"{sec // 86400} days ago"


def format_automation_post(doc: dict) -> dict:
    caption = str(doc.get("caption") or "").strip()
    title = str(doc.get("title") or "").strip()
    if not title:
        title = (caption[:48] + "…") if len(caption) > 48 else (caption or "Untitled Post")
    status = str(doc.get("status") or "pending").lower()
    if status not in ("success", "pending", "failed"):
        status = "pending"
    platforms = doc.get("platforms") or []
    if not isinstance(platforms, list):
        platforms = []
    return {
        "id": str(doc.get("_id") or doc.get("id") or ""),
        "title": title,
        "caption": caption,
        "description": caption[:120] + ("…" if len(caption) > 120 else ""),
        "postType": str(doc.get("post_type") or "image"),
        "imageurl": str(doc.get("imageurl") or "").strip(),
        "platforms": [str(p) for p in platforms],
        "status": status,
        "postedLabel": _relative_time(doc.get("published_at") or doc.get("created_at")),
        "scheduledAt": doc.get("scheduled_at"),
        "createdAt": doc.get("created_at"),
    }


def build_metrics(docs: List[dict], connected_count: int) -> dict:
    total = len(docs)
    success = sum(1 for d in docs if str(d.get("status") or "").lower() == "success")
    pending = sum(1 for d in docs if str(d.get("status") or "").lower() == "pending")
    failed = sum(1 for d in docs if str(d.get("status") or "").lower() == "failed")
    rate = round((success / total) * 100, 1) if total else 0.0
    pending_pct = round((pending / total) * 100, 1) if total else 0.0
    failed_pct = round((failed / total) * 100, 1) if total else 0.0
    return {
        "total": total,
        "successful": success,
        "pending": pending,
        "failed": failed,
        "platforms": connected_count,
        "successRate": rate,
        "pendingPct": pending_pct,
        "failedPct": failed_pct,
        "growthPct": 18.2 if total else 0.0,
    }
