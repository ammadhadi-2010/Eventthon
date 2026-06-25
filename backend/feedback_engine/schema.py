"""Pydantic models for enterprise user feedback submissions."""
from __future__ import annotations

import json
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

ALLOWED_FEEDBACK_TYPES = frozenset({"bug", "feature_request", "abuse", "payment", "other"})

TYPE_ALIASES = {
    "bug": "bug",
    "feature request": "feature_request",
    "feature_request": "feature_request",
    "abuse": "abuse",
    "payment": "payment",
    "other": "other",
}


def normalize_feedback_type(value: str) -> str:
    key = str(value or "").strip().lower()
    normalized = TYPE_ALIASES.get(key)
    if not normalized:
        raise ValueError("Issue type must be Bug, Feature request, Abuse, Payment, or Other.")
    return normalized


def parse_client_device(raw: Any) -> dict:
    if isinstance(raw, dict):
        return raw
    text = str(raw or "").strip()
    if not text:
        return {}
    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else {"summary": text}
    except json.JSONDecodeError:
        return {"summary": text}


class FeedbackSubmitPayload(BaseModel):
    type: str = Field(..., min_length=2, max_length=40)
    description: str = Field(..., min_length=10, max_length=5000)
    page_url: str = Field(..., min_length=4, max_length=2000)
    imageurl: Optional[str] = Field(default=None, max_length=500)
    client_device: dict = Field(default_factory=dict)
    user_id: Optional[str] = Field(default=None, max_length=128)
    user_email: Optional[str] = Field(default=None, max_length=160)
    user_mobile: Optional[str] = Field(default=None, max_length=40)

    @field_validator("type")
    @classmethod
    def normalize_type(cls, value: str) -> str:
        return normalize_feedback_type(value)

    @field_validator("description", "page_url")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = str(value or "").strip()
        if not cleaned:
            raise ValueError("Field cannot be empty.")
        return cleaned

    @field_validator("client_device", mode="before")
    @classmethod
    def normalize_client_device(cls, value: Any) -> dict:
        return parse_client_device(value)


class FeedbackStatusPayload(BaseModel):
    status: str = Field(..., min_length=3, max_length=24)

    @field_validator("status")
    @classmethod
    def strip_status(cls, value: str) -> str:
        cleaned = str(value or "").strip()
        if not cleaned:
            raise ValueError("Status cannot be empty.")
        return cleaned


class FeedbackReplyPayload(BaseModel):
    message: str = Field(..., min_length=4, max_length=2000)
    admin_name: str = Field(default="EventThon Engineering", max_length=80)

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        cleaned = str(value or "").strip()
        if not cleaned:
            raise ValueError("Reply message cannot be empty.")
        return cleaned
