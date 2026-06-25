"""Reporter profile enrichment for admin feedback listings."""
from __future__ import annotations

from backend_routes.alerts.alerts_helpers import parse_user_imageurl, resolve_user


def build_reporter_full_name(user: dict | None) -> str:
    if not user:
        return "Anonymous Reporter"
    for key in ("full_name", "display_name", "name"):
        value = str(user.get(key) or "").strip()
        if value:
            return value
    first = str(user.get("first_name") or "").strip()
    last = str(user.get("last_name") or "").strip()
    joined = f"{first} {last}".strip()
    if joined:
        return joined
    return str(user.get("email") or user.get("mobile") or "Anonymous Reporter")


async def resolve_feedback_reporter(doc: dict) -> dict | None:
    for key in ("user_id", "user_email", "user_mobile"):
        ident = str(doc.get(key) or "").strip()
        if not ident:
            continue
        user = await resolve_user(ident)
        if user:
            return user
    return None


async def enrich_feedback_row(row: dict) -> dict:
    from .presentation import present_feedback_row

    user = await resolve_feedback_reporter(row)
    payload = dict(row)
    screenshot = payload.get("screenshot_imageurl") or payload.get("imageurl")
    payload["screenshot_imageurl"] = screenshot
    payload["reporter_name"] = build_reporter_full_name(user)
    payload["reporter_imageurl"] = parse_user_imageurl(user)
    return present_feedback_row(payload)
