"""Sliding-window rate limiting for auth and finance routes."""

from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from typing import Deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

_LIMITED_PREFIXES = ("/api/auth", "/api/google", "/finance")
_DEFAULT_LIMITS = {
    "/api/auth": int(os.getenv("RATE_LIMIT_AUTH_PER_MIN", "40")),
    "/api/google": int(os.getenv("RATE_LIMIT_AUTH_PER_MIN", "40")),
    "/finance": int(os.getenv("RATE_LIMIT_FINANCE_PER_MIN", "80")),
}
_WINDOW_SEC = 60.0
_buckets: dict[str, Deque[float]] = defaultdict(deque)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _prefix_limit(path: str) -> tuple[str, int] | None:
    for prefix in _LIMITED_PREFIXES:
        if path.startswith(prefix):
            return prefix, _DEFAULT_LIMITS[prefix]
    return None


def _allow(key: str, limit: int) -> bool:
    now = time.monotonic()
    bucket = _buckets[key]
    while bucket and now - bucket[0] > _WINDOW_SEC:
        bucket.popleft()
    if len(bucket) >= limit:
        return False
    bucket.append(now)
    return True


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rule = _prefix_limit(request.url.path)
        if not rule:
            return await call_next(request)
        prefix, limit = rule
        bucket_key = f"{prefix}:{_client_key(request)}"
        if not _allow(bucket_key, limit):
            return JSONResponse(
                status_code=429,
                content={"status": "error", "message": "Rate limit exceeded. Try again shortly."},
                headers={"Retry-After": "60"},
            )
        return await call_next(request)
