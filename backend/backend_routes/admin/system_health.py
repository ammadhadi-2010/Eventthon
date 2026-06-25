"""Live system health probes for the admin dashboard."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException

from database import (
    client,
    rank_collection,
    transaction_collection,
    user_collection,
    wallet_collection,
)

router = APIRouter(tags=["Admin System Health"])

SERVICE_IDS = ("web_server", "database", "api_service", "wallet_system", "storage")
STATUS_OK = "OPERATIONAL"
STATUS_WARN = "DEGRADED"
STATUS_DOWN = "DOWN"

BASE_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _service_row(service_id: str, label: str, status: str, detail: str, checked_at: str) -> dict[str, Any]:
    return {
        "id": service_id,
        "label": label,
        "status": status,
        "detail": detail,
        "last_checked": checked_at,
    }


async def _require_admin(
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    x_user_mobile: str | None = Header(default=None, alias="X-User-Mobile"),
) -> dict[str, Any]:
    email = str(x_user_email or "").strip().lower()
    mobile = str(x_user_mobile or "").strip()
    clauses: list[dict[str, Any]] = []
    if email:
        clauses.append({"email": email})
    if mobile:
        clauses.append({"mobile": mobile})
    if not clauses:
        raise HTTPException(status_code=401, detail="Admin session required")
    user = await user_collection.find_one({"$or": clauses})
    if not user or str(user.get("role") or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return user


async def _check_database() -> tuple[str, str]:
    try:
        await client.admin.command("ping")
        return STATUS_OK, "MongoDB ping succeeded"
    except Exception as exc:
        return STATUS_DOWN, f"MongoDB unreachable: {exc.__class__.__name__}"


async def _check_api_service() -> tuple[str, str]:
    probes = await asyncio.gather(
        user_collection.find_one({}, projection={"_id": 1}),
        rank_collection.find_one({}, projection={"_id": 1}),
        return_exceptions=True,
    )
    errors = [item for item in probes if isinstance(item, Exception)]
    if len(errors) == len(probes):
        return STATUS_DOWN, "Critical collections unavailable"
    if errors:
        return STATUS_WARN, "One or more core collections degraded"
    return STATUS_OK, "Core collections responding"


async def _check_wallet_system() -> tuple[str, str]:
    try:
        await asyncio.gather(
            wallet_collection.find_one({}, projection={"_id": 1}),
            transaction_collection.find_one({}, projection={"_id": 1}),
        )
        return STATUS_OK, "Wallet and transaction ledgers reachable"
    except Exception as exc:
        return STATUS_DOWN, f"Ledger probe failed: {exc.__class__.__name__}"


def _check_storage() -> tuple[str, str]:
    try:
        if not STATIC_DIR.is_dir():
            return STATUS_DOWN, "Static storage root missing"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        probe = UPLOAD_DIR / ".health_probe"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink(missing_ok=True)
        free_ok = os.access(UPLOAD_DIR, os.W_OK | os.R_OK)
        if not free_ok:
            return STATUS_WARN, "Upload mount is read-only"
        return STATUS_OK, "Local upload storage writable"
    except PermissionError:
        return STATUS_WARN, "Storage mount permission denied"
    except Exception as exc:
        return STATUS_DOWN, f"Storage probe failed: {exc.__class__.__name__}"


def _overall_status(rows: list[dict[str, Any]]) -> str:
    statuses = {str(row.get("status") or "").upper() for row in rows}
    if STATUS_DOWN in statuses:
        return STATUS_DOWN if statuses == {STATUS_DOWN} else STATUS_WARN
    if STATUS_WARN in statuses:
        return STATUS_WARN
    return STATUS_OK


@router.get("/system-health")
async def get_system_health(_admin: dict[str, Any] = Depends(_require_admin)):
    checked_at = _utc_now()
    db_status, db_detail = await _check_database()
    api_status, api_detail = await _check_api_service()
    wallet_status, wallet_detail = await _check_wallet_system()
    storage_status, storage_detail = _check_storage()

    services = [
        _service_row("web_server", "Web Server", STATUS_OK, "Python service accepted probe", checked_at),
        _service_row("database", "Database", db_status, db_detail, checked_at),
        _service_row("api_service", "API Service", api_status, api_detail, checked_at),
        _service_row("wallet_system", "Wallet System", wallet_status, wallet_detail, checked_at),
        _service_row("storage", "Storage", storage_status, storage_detail, checked_at),
    ]
    return {
        "status": "success",
        "last_checked": checked_at,
        "overall": _overall_status(services),
        "services": services,
    }
