"""Company team audit log helpers."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from database import company_audit_logs_collection


async def write_audit(
    *,
    company_id: str,
    action: str,
    actor_user_id: str = "",
    actor_email: str = "",
    target_email: str = "",
    target_user_id: str = "",
    meta: Optional[dict] = None,
) -> None:
    await company_audit_logs_collection.insert_one(
        {
            "company_id": str(company_id),
            "action": str(action),
            "actor_user_id": str(actor_user_id or ""),
            "actor_email": str(actor_email or "").strip().lower(),
            "target_email": str(target_email or "").strip().lower(),
            "target_user_id": str(target_user_id or ""),
            "meta": meta or {},
            "created_at": datetime.utcnow(),
        }
    )


def serialize_audit(doc: dict) -> dict:
    ts = doc.get("created_at")
    if isinstance(ts, datetime):
        when = ts.isoformat() + "Z"
    else:
        when = str(ts or "")
    return {
        "id": str(doc.get("_id") or ""),
        "action": doc.get("action") or "",
        "actorEmail": doc.get("actor_email") or "",
        "actorUserId": doc.get("actor_user_id") or "",
        "targetEmail": doc.get("target_email") or "",
        "targetUserId": doc.get("target_user_id") or "",
        "meta": doc.get("meta") or {},
        "createdAt": when,
    }


async def list_audit(company_id: str, limit: int = 50) -> list[dict]:
    rows: list[dict] = []
    cursor = (
        company_audit_logs_collection.find({"company_id": str(company_id)})
        .sort("created_at", -1)
        .limit(limit)
    )
    async for doc in cursor:
        rows.append(serialize_audit(doc))
    return rows
