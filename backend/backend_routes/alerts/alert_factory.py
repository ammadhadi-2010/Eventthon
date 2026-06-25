from datetime import datetime

from database import notification_collection, user_collection

from .member_alerts_query import normalize_alert_category


async def resolve_user_ref(identifier: str) -> tuple[str, str]:
    """Return (user_ref, identifier) for alerts storage."""
    value = (identifier or "").strip()
    if not value:
        return "", ""
    user = await user_collection.find_one(
        {
            "$or": [
                {"user_id": value.lower()},
                {"email": value.lower()},
                {"mobile": value},
                {"_id": value},
            ]
        }
    )
    if user:
        ident = user.get("user_id") or user.get("email") or user.get("mobile") or value
        return str(user["_id"]), ident
    return value, value


async def push_alert(
    *,
    recipient_identifier: str,
    category: str,
    title: str,
    message: str,
    details: str = "",
    actor_name: str = "EventThon",
    priority: str = "medium",
    action_label: str = "View",
    action_url: str = "/notifications/alerts",
    audience: str | None = None,
) -> str | None:
    user_ref, ident = await resolve_user_ref(recipient_identifier)
    if not user_ref and not ident:
        return None
    clean_category = normalize_alert_category(category)
    doc = {
        "user_ref": user_ref or ident,
        "identifier": ident or recipient_identifier,
        "category": clean_category,
        "priority": priority,
        "title": title,
        "actor_name": actor_name,
        "message": message,
        "details": details,
        "action_label": action_label,
        "action_url": action_url,
        "section": "today",
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    if audience:
        doc["audience"] = audience
    else:
        doc["audience"] = "member"
    result = await notification_collection.insert_one(doc)
    return str(result.inserted_id)
