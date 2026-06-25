from typing import Any, Dict, List, Optional

BASE_URL = "http://127.0.0.1:8000"

MEDIA_ROOT_KEYS = (
    "id_front",
    "id_back",
    "profile_image_url",
    "avatar",
    "banner_url",
    "banner_image_url",
)

NESTED_MEDIA_KEYS = ("image_url", "cover", "url", "thumbnail", "logo_url", "file_url", "path", "src")


def _resolve_url(value: Any) -> Any:
    if not value or not isinstance(value, str):
        return value
    trimmed = value.strip()
    if not trimmed or trimmed.startswith("http") or trimmed.startswith("data:"):
        return trimmed or value
    if trimmed.startswith("/"):
        return f"{BASE_URL}{trimmed}"
    return f"{BASE_URL}/{trimmed}"


def _resolve_nested_media(node: Any) -> Any:
    if isinstance(node, list):
        return [_resolve_nested_media(item) for item in node]
    if not isinstance(node, dict):
        return node
    out = dict(node)
    for key, val in list(out.items()):
        if key in NESTED_MEDIA_KEYS and isinstance(val, str):
            out[key] = _resolve_url(val)
        elif isinstance(val, (dict, list)):
            out[key] = _resolve_nested_media(val)
    return out


def format_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize admin-facing user payload with absolute media URLs."""
    if user.get("_id") is not None:
        user["_id"] = str(user["_id"])

    for key in MEDIA_ROOT_KEYS:
        if user.get(key):
            user[key] = _resolve_url(user[key])

    for key in ("projects", "experiences", "educations", "portfolio_files", "qualifications", "social_links"):
        if isinstance(user.get(key), list):
            user[key] = _resolve_nested_media(user[key])

    return user
