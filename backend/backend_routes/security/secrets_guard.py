"""Redact secrets from logs and HTTP error payloads."""

from __future__ import annotations

import re
from typing import Any

_SECRET_PATTERNS = (
    re.compile(r"mongodb(\+srv)?://[^\s\"']+", re.I),
    re.compile(r"(password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,\"']+", re.I),
    re.compile(r"whsec_[a-zA-Z0-9]+"),
    re.compile(r"sk_(live|test)_[a-zA-Z0-9]+"),
)


def redact_secrets(text: str) -> str:
    out = str(text or "")
    for pattern in _SECRET_PATTERNS:
        out = pattern.sub("[REDACTED]", out)
    return out


def safe_error_detail(exc: Exception) -> str:
    return redact_secrets(str(exc))[:240]


def safe_json_error(message: str = "Internal Server Error") -> dict[str, Any]:
    return {"status": "error", "message": redact_secrets(message)}
