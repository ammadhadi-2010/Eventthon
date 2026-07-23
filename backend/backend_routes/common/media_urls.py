"""Public absolute media URLs for dashboard feed/API responses."""
from __future__ import annotations

import os
from typing import Any
from urllib.parse import urlparse

FEED_MEDIA_KEYS = (
    "imageurl",
    "image_url",
    "cover_image",
    "author_imageurl",
    "media_url",
)


def get_public_api_base() -> str:
    for key in ("PUBLIC_API_BASE_URL", "API_PUBLIC_BASE_URL", "SITE_ORIGIN"):
        value = os.getenv(key, "").strip().rstrip("/")
        if value:
            return value

    host = os.getenv("API_HOST", "127.0.0.1").strip() or "127.0.0.1"
    if host in {"0.0.0.0", "::"}:
        host = "127.0.0.1"
    port = os.getenv("API_PORT", "8000").strip()
    if port:
        return f"http://{host}:{port}"
    return f"http://{host}"


def normalize_stored_media_path(raw: str) -> str:
    path = str(raw or "").strip()
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        path = urlparse(path).path or ""
    if path.startswith("/uploads/"):
        path = f"/static{path}"
    return path if path.startswith("/") else f"/{path}"


def resolve_public_media_url(raw: Any) -> str:
    if raw is None:
        return ""
    value = str(raw).strip()
    if not value or value.startswith("data:") or value.startswith("blob:"):
        return value
    if value.startswith("http://") or value.startswith("https://"):
        return value

    base = get_public_api_base()
    path = normalize_stored_media_path(value)
    if not path:
        return ""
    return f"{base}{path}"


def apply_public_media_urls(doc: dict, *, include_media_array: bool = True) -> dict:
    if not isinstance(doc, dict):
        return doc

    for key in FEED_MEDIA_KEYS:
        if doc.get(key):
            doc[key] = resolve_public_media_url(doc[key])

    if include_media_array and isinstance(doc.get("media"), list):
        resolved_media = []
        for item in doc["media"]:
            if isinstance(item, str):
                resolved_media.append(resolve_public_media_url(item))
            elif isinstance(item, dict):
                row = dict(item)
                for key in ("url", "imageurl", "image_url", "src"):
                    if row.get(key):
                        row[key] = resolve_public_media_url(row[key])
                resolved_media.append(row)
            else:
                resolved_media.append(item)
        doc["media"] = resolved_media

    return doc
