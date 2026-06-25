"""Guards for company verification dependent actions."""
from __future__ import annotations

from fastapi import HTTPException

from .portal_resolve import resolve_company_for_user

PENDING_GATE_MESSAGE = (
    "Your company profile is successfully submitted and is under review by our Admin team. "
    "Features will unlock shortly upon verification."
)


async def ensure_company_posting_unlocked(user_id: str, feature: str = "feature") -> dict:
    uid = str(user_id or "").strip()
    if len(uid) < 2:
        raise HTTPException(status_code=400, detail="User identifier is required.")
    company = await resolve_company_for_user(uid)
    if not company:
        return {"status": "unscoped"}
    status = str(company.get("status") or "").strip().lower()
    is_verified = bool(company.get("is_verified"))
    if status == "pending" or not is_verified:
        raise HTTPException(status_code=423, detail=PENDING_GATE_MESSAGE)
    return company
