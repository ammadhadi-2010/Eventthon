"""MongoDB metadata and request validation for UserTelemetryLog documents."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator

USER_TELEMETRY_LOG_COLLECTION = "user_telemetry_logs"

UserTelemetryLog_SCHEMA: dict[str, Any] = {
    "model_name": "UserTelemetryLog",
    "collection": USER_TELEMETRY_LOG_COLLECTION,
    "description": "Internal click, dwell-time, and scroll-depth behavior events.",
    "fields": {
        "user_id": {
            "type": "string",
            "required": False,
            "description": "Authenticated member identifier when available.",
        },
        "session_id": {
            "type": "string",
            "required": True,
            "description": "Browser session identifier from the client framework.",
        },
        "endpoint_url": {
            "type": "string",
            "required": True,
            "description": "Visited route or page URL path.",
        },
        "time_spent_seconds": {
            "type": "float",
            "required": True,
            "description": "Total dwell time on the endpoint in seconds.",
        },
        "scroll_depth_percentage": {
            "type": "float",
            "required": True,
            "description": "Maximum scroll depth reached on the page (0-100).",
        },
        "created_at": {
            "type": "datetime",
            "required": True,
            "description": "Server-side ingestion timestamp.",
        },
    },
}


class TelemetryActivityPayload(BaseModel):
    user_id: str = Field(default="", max_length=128)
    session_id: str = Field(..., min_length=8, max_length=128)
    endpoint_url: str = Field(..., min_length=1, max_length=2048)
    time_spent_seconds: float = Field(..., ge=0, le=86400)
    scroll_depth_percentage: float = Field(..., ge=0, le=100)

    @field_validator("user_id", "session_id", "endpoint_url", mode="before")
    @classmethod
    def strip_text(cls, value: Any) -> Any:
        if value is None:
            return value
        return str(value).strip()

    @field_validator("endpoint_url")
    @classmethod
    def normalize_endpoint(cls, value: str) -> str:
        cleaned = value.replace("\x00", "").strip()
        if not cleaned:
            raise ValueError("endpoint_url is required")
        return cleaned[:2048]
