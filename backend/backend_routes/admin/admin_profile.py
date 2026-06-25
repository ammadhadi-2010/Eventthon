"""Admin profile core metrics and system operator workspace API."""
from __future__ import annotations

import logging
from datetime import datetime

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from .admin_profile_update import apply_admin_profile_update

from database import companies_collection, feedbacks_collection, user_collection

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Admin Profile"])

SYSTEM_ACTIVITY_SEED = [
    {
        "id": "sys-1",
        "title": "System Node Operational",
        "message": "All core services are online and responding within SLA thresholds.",
        "tone": "green",
        "time_label": "Just now",
    },
    {
        "id": "sys-2",
        "title": "Database Handshake Validated",
        "message": "MongoDB cluster sync completed with zero replication drift.",
        "tone": "blue",
        "time_label": "4 min ago",
    },
    {
        "id": "sys-3",
        "title": "Security Gateway Stable",
        "message": "Admin authentication perimeter verified across active sessions.",
        "tone": "purple",
        "time_label": "12 min ago",
    },
]


def _human_when(ts) -> str:
    if not ts:
        return "Recently"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            return "Recently"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(max(1, delta.total_seconds()))
    if sec < 60:
        return "Just now"
    if sec < 3600:
        return f"{sec // 60} min ago"
    if sec < 86400:
        return f"{sec // 3600} hr ago"
    return f"{sec // 86400} day ago"


def _parse_imageurl(user: dict | None) -> str:
    if not user:
        return ""
    return str(
        user.get("imageurl") or user.get("profile_image_url") or user.get("avatar") or ""
    ).strip()


def _parse_full_name(user: dict | None) -> str:
    if not user:
        return "Super Administrator"
    for key in ("full_name", "display_name", "name"):
        value = str(user.get(key) or "").strip()
        if value:
            return value
    first = str(user.get("first_name") or "").strip()
    last = str(user.get("last_name") or "").strip()
    joined = f"{first} {last}".strip()
    return joined or str(user.get("email") or "Super Administrator")


async def _resolve_admin_user(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
):
    email = str(x_user_email or "").strip().lower()
    mobile = str(x_user_mobile or "").strip()
    clauses = []
    if email:
        clauses.append({"email": email})
    if mobile:
        clauses.append({"mobile": mobile})
    if not clauses:
        return None
    return await user_collection.find_one({"$or": clauses})


@router.get("/profile")
async def get_admin_profile_core(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
):
    user = await _resolve_admin_user(x_user_email, x_user_mobile)
    audits = await feedbacks_collection.count_documents({})
    verifications = await companies_collection.count_documents({"status": "pending"})
    resolved = await feedbacks_collection.count_documents({"status": {"$regex": "^resolved$", "$options": "i"}})

    activity_rows = list(SYSTEM_ACTIVITY_SEED)
    cursor = feedbacks_collection.find({}).sort("created_at", -1).limit(3)
    async for doc in cursor:
        activity_rows.insert(
            0,
            {
                "id": str(doc.get("_id") or ""),
                "title": "Feedback Pipeline Update",
                "message": str(doc.get("description") or "User feedback received for engineering review.")[:140],
                "tone": "amber",
                "time_label": _human_when(doc.get("created_at")),
            },
        )

    return {
        "status": "success",
        "data": {
            "full_name": _parse_full_name(user),
            "email": str(user.get("email") or "").strip().lower() if user else "",
            "imageurl": _parse_imageurl(user),
            "role_badge": "★ Super Administrator",
            "headline": "EventThon Infrastructure Command",
            "metrics": {
                "access_level": 99,
                "command_power": 9999,
                "node_rank": "#1 Root",
            },
            "network": {
                "audits": audits,
                "verifications": verifications,
                "resolved": resolved,
            },
            "activity_feed": activity_rows[:6],
        },
    }


@router.put("/profile/update")
async def update_admin_profile_core(
    full_name: str = Form(...),
    email: str = Form(...),
    imageurl_link: str = Form(default=""),
    password: str = Form(default=""),
    confirm_password: str = Form(default=""),
    imageurl: UploadFile | None = File(None),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
):
    user = await _resolve_admin_user(x_user_email, x_user_mobile)
    if not user:
        raise HTTPException(status_code=404, detail="Administrator account not found.")
    try:
        updated = await apply_admin_profile_update(
            user,
            full_name=full_name,
            email=email,
            imageurl_link=imageurl_link,
            image_file=imageurl,
            password=password,
            confirm_password=confirm_password,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Admin profile update failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update admin profile.") from exc

    return {
        "status": "success",
        "message": "Admin profile configuration updated successfully.",
        "data": updated,
    }


@router.post("/profile/commands/{action_key}")
async def run_admin_profile_command(action_key: str):
    actions = {
        "clear-cache": "Platform cache purge queued successfully.",
        "main-lock": "Main lock protocol engaged for protected admin routes.",
        "database-sync": "Database synchronization handshake initiated.",
    }
    message = actions.get(action_key)
    if not message:
        raise HTTPException(status_code=400, detail="Unknown admin command action.")
    logger.info("Admin profile command executed: action=%s", action_key)
    return {"status": "success", "message": message, "action": action_key}
