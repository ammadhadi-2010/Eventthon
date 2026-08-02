"""
Serve /static/uploads/* from local disk; redirect to CDN when missing locally.

This is the single runtime fallback for all user-uploaded media (articles, posts,
profiles, donations, etc.). Frontend and API should always use API-base URLs for
/static/uploads/ paths — never guess CDN vs local in the client.
"""
from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, RedirectResponse

from .media_urls import get_public_media_cdn, resolve_local_static_abspath

router = APIRouter(include_in_schema=False)


@router.api_route("/static/uploads/{file_path:path}", methods=["GET", "HEAD"])
async def serve_upload_with_cdn_fallback(file_path: str):
    stored = f"/static/uploads/{file_path.lstrip('/')}"
    local = resolve_local_static_abspath(stored)
    if local:
        return FileResponse(local)

    cdn = get_public_media_cdn()
    if cdn:
        return RedirectResponse(
            url=f"{cdn.rstrip('/')}{stored}",
            status_code=307,
        )

    raise HTTPException(status_code=404, detail="Media not found")
