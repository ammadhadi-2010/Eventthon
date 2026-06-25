"""Carousel highlight adapter backed by the local EventThon AI engine."""
from __future__ import annotations

from ai_engine import EventThonAIEngine
from ai_engine.training import HIGHLIGHT_CONTEXTS

_ENGINE = EventThonAIEngine()


async def evaluate_carousel_highlight(context: str, metrics: dict) -> bool:
    clean_context = str(context or "").strip().lower()
    if clean_context not in HIGHLIGHT_CONTEXTS:
        return False
    title = str(metrics.get("title") or metrics.get("content") or "")[:160]
    description = str(metrics.get("content") or metrics.get("description") or "")
    post_type = clean_context.upper()
    if clean_context == "achievement":
        post_type = "WIN"
    result = _ENGINE.evaluate_highlight(title, description, post_type, metrics or {})
    return bool(result.get("is_carousel_update"))
