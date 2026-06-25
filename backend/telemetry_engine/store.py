"""Lightweight MongoDB persistence for UserTelemetryLog records."""
from __future__ import annotations

import logging
from datetime import datetime

from database import user_telemetry_log_collection

logger = logging.getLogger(__name__)

_INDEX_READY = False


async def ensure_telemetry_indexes() -> None:
    global _INDEX_READY
    if _INDEX_READY:
        return
    await user_telemetry_log_collection.create_index(
        [("session_id", 1), ("created_at", -1)],
        name="telemetry_session_created",
    )
    await user_telemetry_log_collection.create_index(
        [("user_id", 1), ("created_at", -1)],
        name="telemetry_user_created",
    )
    await user_telemetry_log_collection.create_index(
        [("endpoint_url", 1), ("created_at", -1)],
        name="telemetry_endpoint_created",
    )
    _INDEX_READY = True
    logger.info("UserTelemetryLog indexes are ready.")


def build_user_telemetry_log(
    *,
    user_id: str,
    session_id: str,
    endpoint_url: str,
    time_spent_seconds: float,
    scroll_depth_percentage: float,
) -> dict:
    return {
        "user_id": user_id,
        "session_id": session_id,
        "endpoint_url": endpoint_url,
        "time_spent_seconds": round(float(time_spent_seconds), 2),
        "scroll_depth_percentage": round(float(scroll_depth_percentage), 2),
        "created_at": datetime.utcnow(),
    }


async def insert_user_telemetry_log(document: dict) -> None:
    await user_telemetry_log_collection.insert_one(document)
