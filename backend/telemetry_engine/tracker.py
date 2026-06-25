"""Fast telemetry ingestion routes for the proprietary behavior tracker."""
from __future__ import annotations

import logging

from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, Query

from backend_routes.alerts.alerts_helpers import verify_alerts_owner_from_headers
from database import user_collection
from telemetry_engine.insights import generate_growth_insights
from telemetry_engine.recommender import compute_user_interests
from telemetry_engine.schema import TelemetryActivityPayload, UserTelemetryLog_SCHEMA
from telemetry_engine.store import build_user_telemetry_log, insert_user_telemetry_log

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Telemetry"])


def _resolve_user_id(payload_user_id: str, header_user_id: str | None) -> str:
    header_value = str(header_user_id or "").strip()[:128]
    body_value = str(payload_user_id or "").strip()[:128]
    if header_value:
        return header_value
    return body_value


def _member_id_from_session(user: dict) -> str:
    mongo_id = str(user.get("_id") or user.get("id") or "").strip()
    if mongo_id:
        return mongo_id
    user_id = str(user.get("user_id") or "").strip()
    if user_id:
        return user_id
    email = str(user.get("email") or "").strip().lower()
    if email:
        return email
    return str(user.get("mobile") or "").strip()


async def _lookup_user_by_mongo_id(raw_id: str) -> dict | None:
    value = str(raw_id or "").strip()
    if not value:
        return None
    try:
        doc = await user_collection.find_one({"_id": ObjectId(value)})
        if doc:
            return doc
    except Exception:
        pass
    return await user_collection.find_one({"user_id": value})


async def verify_telemetry_session(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict:
    header_id = str(x_user_id or "").strip()
    if header_id:
        user = await _lookup_user_by_mongo_id(header_id)
        if user:
            return user
        raise HTTPException(status_code=404, detail="Telemetry user id not found")
    return await verify_alerts_owner_from_headers(x_user_email, x_user_mobile)


async def _persist_log(document: dict) -> None:
    try:
        await insert_user_telemetry_log(document)
    except Exception as exc:
        logger.warning("Telemetry log insert failed: %s", exc)


@router.get("/schema")
async def get_user_telemetry_schema():
    """Expose UserTelemetryLog metadata for internal tooling."""
    return {"status": "success", "schema": UserTelemetryLog_SCHEMA}


@router.post("/log-activity")
async def log_telemetry_activity(
    payload: TelemetryActivityPayload,
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
):
    """Persist client telemetry for the active MongoDB user account."""
    document = build_user_telemetry_log(
        user_id=_resolve_user_id(payload.user_id, x_user_id),
        session_id=payload.session_id,
        endpoint_url=payload.endpoint_url,
        time_spent_seconds=payload.time_spent_seconds,
        scroll_depth_percentage=payload.scroll_depth_percentage,
    )
    await _persist_log(document)
    return {"status": "accepted", "message": "Telemetry log stored."}


@router.get("/insights")
async def get_telemetry_insights(
    session_id: str = Query(default="", max_length=128),
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    user: dict = Depends(verify_telemetry_session),
):
    """Return computed insights for the active MongoDB user session."""
    del x_user_id
    member_id = _member_id_from_session(user)
    if not member_id:
        return {"status": "error", "message": "Active session user could not be resolved.", "data": []}

    interests = await compute_user_interests(member_id, session_id.strip())
    insights = await generate_growth_insights(member_id)
    return {
        "status": "success",
        "user_id": member_id,
        "interests": interests,
        "insights": insights,
        "data": insights,
    }
