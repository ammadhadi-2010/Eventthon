"""Sanitize user-controlled values before MongoDB queries or ledger writes."""

from __future__ import annotations

import re
from typing import Any

from fastapi import HTTPException

_MONGO_OP_PATTERN = re.compile(r"^\$")
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b-\x0c\x0e-\x1f]")
_USER_ID_PATTERN = re.compile(r"^[a-zA-Z0-9@._+\-]{1,128}$")


def sanitize_plain_string(value: Any, *, field: str = "value", max_len: int = 512) -> str:
    text = str(value or "").strip()
    if not text or len(text) > max_len:
        raise HTTPException(status_code=400, detail=f"Invalid {field}")
    if _CONTROL_CHARS.search(text):
        raise HTTPException(status_code=400, detail=f"Invalid {field}")
    if _MONGO_OP_PATTERN.match(text):
        raise HTTPException(status_code=400, detail=f"Invalid {field}")
    return text


def sanitize_user_id(value: Any) -> str:
    text = sanitize_plain_string(value, field="user_id", max_len=128)
    if not _USER_ID_PATTERN.match(text):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    return text


def sanitize_positive_amount(value: Any, *, field: str = "amount", max_val: float = 10_000_000) -> float:
    try:
        amount = round(float(value), 8)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field}") from exc
    if amount <= 0 or amount > max_val:
        raise HTTPException(status_code=400, detail=f"Invalid {field}")
    return amount


def sanitize_metadata_dict(value: Any, *, max_keys: int = 32) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}
    clean: dict[str, str] = {}
    for key, raw in list(value.items())[:max_keys]:
        key_text = sanitize_plain_string(key, field="metadata key", max_len=64)
        clean[key_text] = sanitize_plain_string(raw, field="metadata value", max_len=256)
    return clean


def reject_mongo_operators(payload: Any, *, path: str = "body") -> None:
    """Reject dicts that embed MongoDB operator keys ($gt, $where, etc.)."""
    if isinstance(payload, dict):
        for key, val in payload.items():
            if isinstance(key, str) and key.startswith("$"):
                raise HTTPException(status_code=400, detail=f"Invalid {path}: operator keys forbidden")
            reject_mongo_operators(val, path=f"{path}.{key}")
    elif isinstance(payload, list):
        for idx, item in enumerate(payload[:50]):
            reject_mongo_operators(item, path=f"{path}[{idx}]")
