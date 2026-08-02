"""
Single source of truth for stored media paths and public API URLs.

Rules (do not duplicate elsewhere):
- DB stores relative paths: /static/uploads/<folder>/<file>
- API responses use absolute URLs on the API origin (PUBLIC_API_BASE_URL)
- Browser requests API /static/uploads/... ; static_media_routes serves local file
  or 307-redirects to PUBLIC_MEDIA_CDN_URL when the file is not on this server
"""
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

LEGACY_MEDIA_HOSTS = {
    "167.172.158.47",
    "127.0.0.1",
    "localhost",
    "eventthone.com",
    "www.eventthone.com",
}

_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.join(_BACKEND_ROOT, "static")


def get_public_api_base() -> str:
    for key in ("PUBLIC_API_BASE_URL", "API_PUBLIC_BASE_URL", "BACKEND_URL", "SITE_ORIGIN"):
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


def get_public_media_cdn() -> str:
    for key in ("PUBLIC_MEDIA_CDN_URL", "MEDIA_CDN_URL"):
        value = os.getenv(key, "").strip().rstrip("/")
        if value:
            return value
    return ""


def normalize_stored_media_path(raw: str) -> str:
    path = str(raw or "").strip()
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        path = urlparse(path).path or ""
    if path.startswith("/uploads/"):
        path = f"/static{path}"
    return path if path.startswith("/") else f"/{path}"


def resolve_local_static_abspath(stored_path: str) -> str:
    """Absolute filesystem path when the file exists; empty string otherwise."""
    path = normalize_stored_media_path(stored_path)
    if not path.startswith("/static/"):
        return ""

    relative = path.replace("/static/", "", 1).lstrip("/")
    abs_path = os.path.normpath(os.path.join(STATIC_DIR, relative.replace("/", os.sep)))
    static_root = os.path.normpath(STATIC_DIR)
    if not abs_path.startswith(static_root):
        return ""

    candidates = [abs_path]
    base, ext = os.path.splitext(abs_path)
    if ext:
        candidates.extend([base + ext.lower(), base + ext.upper()])

    seen = set()
    for candidate in candidates:
        norm = os.path.normcase(candidate)
        if norm in seen:
            continue
        seen.add(norm)
        if os.path.isfile(candidate):
            return candidate
    return ""


def local_static_file_exists(stored_path: str) -> bool:
    return bool(resolve_local_static_abspath(stored_path))


def build_api_media_url(stored_path: str) -> str:
    """Absolute media URL — CDN when file is not on this server, else API origin."""
    path = normalize_stored_media_path(stored_path)
    if not path:
        return ""
    if path.startswith("/static/") and not local_static_file_exists(path):
        cdn = get_public_media_cdn()
        if cdn:
            return f"{cdn.rstrip('/')}{path}"
    base = get_public_api_base().rstrip("/")
    return f"{base}{path}"


def resolve_public_media_url(raw: Any) -> str:
    if raw is None:
        return ""
    value = str(raw).strip()
    if not value or value.startswith("data:") or value.startswith("blob:"):
        return value

    if value.startswith("http://") or value.startswith("https://"):
        parsed = urlparse(value)
        path = parsed.path or ""
        query = f"?{parsed.query}" if parsed.query else ""

        if path.startswith(("/static/", "/uploads/")):
            resolved = build_api_media_url(path)
            return f"{resolved}{query}" if resolved else value

        host = (parsed.hostname or "").lower()
        if host in LEGACY_MEDIA_HOSTS and path.startswith("/"):
            resolved = build_api_media_url(path)
            return f"{resolved}{query}" if resolved else value

        return value

    return build_api_media_url(value)


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
