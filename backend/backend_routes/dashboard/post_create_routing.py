"""Post-create routing for AI highlights and manual squad activity feeds."""
from __future__ import annotations

from ai_engine import EventThonAIEngine
from ai_engine.training import HIGHLIGHT_CONTEXTS, POST_TYPE_TO_CONTEXT
from backend_routes.dashboard.post_squad_link import find_user_squad_ids

_ENGINE = EventThonAIEngine()
# Composer AI review only — timeline still stores every post regardless of carousel flag.
AI_EVALUATED_TYPES = frozenset({"PROJECT", "WIN"})


def _truthy_flag(value) -> bool:
    if value is True:
        return True
    return str(value or "").strip().lower() in {"true", "1", "yes", "on"}


def _post_extra_metrics(post: dict) -> dict:
    return {
        "progress_percent": post.get("progress_percent"),
        "achievement_metric": str(post.get("achievement_metric") or ""),
        "starting_price": float(post.get("starting_price") or 0),
        "salary_min": int(post.get("salary_min") or 0),
        "salary_max": int(post.get("salary_max") or 0),
        "word_count": int(post.get("word_count") or 0),
        "seo_score": int(post.get("seo_score") or 0),
    }


async def route_post_on_create(post: dict, *, user_id: str, author_name: str) -> dict:
    """Apply squad manual routing or local AI highlight evaluation."""
    if _is_manual_squad_attach(post):
        return await _route_manual_squad(post, user_id=user_id, author_name=author_name)
    return _route_ai_highlight(post)


def _is_manual_squad_attach(post: dict) -> bool:
    post_type = str(post.get("post_type") or "").upper()
    if post_type != "SQUAD":
        return False
    return _truthy_flag(post.get("attach_to_squad"))


async def _route_manual_squad(post: dict, *, user_id: str, author_name: str) -> dict:
    post["attach_to_squad"] = True
    post["squad_activity_feed"] = True
    post["is_carousel_update"] = False
    post["ai_confidence_score"] = 0.0
    post["update_type"] = "squad"

    squad_id = str(post.get("squad_id") or "").strip()
    if squad_id:
        post["squad_id"] = squad_id
        existing = [str(item) for item in (post.get("squad_ids") or [])]
        if squad_id not in existing:
            post["squad_ids"] = [squad_id, *existing]
        return post

    linked = await find_user_squad_ids(user_id, author_name)
    if linked:
        post["squad_ids"] = linked
        post["squad_id"] = linked[0]
    return post


def _route_ai_highlight(post: dict) -> dict:
    post_type = str(post.get("post_type") or "").upper()
    if post_type not in AI_EVALUATED_TYPES:
        post["is_carousel_update"] = False
        post["ai_confidence_score"] = 0.0
        return post

    title = str(post.get("title") or post.get("content") or "")[:160]
    description = str(post.get("content") or "")
    result = _ENGINE.evaluate_highlight(title, description, post_type, _post_extra_metrics(post))
    context = str(result.get("context") or POST_TYPE_TO_CONTEXT.get(post_type, "")).lower()

    post["update_type"] = context if context in HIGHLIGHT_CONTEXTS else ""
    post["is_carousel_update"] = bool(result.get("is_carousel_update"))
    post["ai_confidence_score"] = float(result.get("confidence_score") or 0)
    post["ai_highlight_reason"] = str(result.get("reason") or "")
    return post
