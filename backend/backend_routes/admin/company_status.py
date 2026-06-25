"""Admin company verification status transitions."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from fastapi import HTTPException

from database import companies_collection

from backend_routes.company_portal.employer_notify import notify_employer_verification_status

APPROVE_ACTIONS = {"approve", "approve_verify", "verify", "active", "approved"}
REJECT_ACTIONS = {"reject", "rejected", "reject_request", "deny"}

APPROVED_MESSAGE = "Your company has been verified. You can now publish jobs and gigs."
REJECTED_MESSAGE = "Your company verification request was rejected. Please update your documents and resubmit."


def _normalize_action(action: str) -> str:
    return str(action or "").strip().lower().replace(" ", "_")


async def apply_company_status_action(company_doc: dict, action: str) -> dict:
    code = _normalize_action(action)
    now = datetime.utcnow().isoformat()
    patch: Dict[str, Any] = {"updated_at": now}

    if code in APPROVE_ACTIONS:
        patch.update(
            {
                "status": "active",
                "is_verified": True,
                "is_draft": False,
                "verification_message": APPROVED_MESSAGE,
                "verified_at": now,
            }
        )
    elif code in REJECT_ACTIONS:
        patch.update(
            {
                "status": "rejected",
                "is_verified": False,
                "verification_message": REJECTED_MESSAGE,
                "rejected_at": now,
            }
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Use approve or reject.",
        )

    await companies_collection.update_one({"_id": company_doc["_id"]}, {"$set": patch})
    updated = await companies_collection.find_one({"_id": company_doc["_id"]})
    result = updated or {**company_doc, **patch}
    owner = str(result.get("owner_user_id") or "").strip()
    if owner:
        await notify_employer_verification_status(
            owner,
            approved=code in APPROVE_ACTIONS,
            company_name=str(result.get("name") or "your company"),
        )
    return result
