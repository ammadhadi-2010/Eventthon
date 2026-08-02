"""Guards for company verification dependent actions."""
from __future__ import annotations

from fastapi import HTTPException

from .portal_resolve import resolve_company_for_user
from backend_routes.admin.company_format import _is_verified

PENDING_GATE_MESSAGE = (
    "Your company profile is successfully submitted and is under review by our Admin team. "
    "Features will unlock shortly upon verification."
)


async def ensure_company_posting_unlocked(
    user_id: str,
    feature: str = "feature",
    *,
    require_company: bool = False,
) -> dict:
    uid = str(user_id or "").strip()
    if len(uid) < 2:
        raise HTTPException(status_code=400, detail="User identifier is required.")
    company = await resolve_company_for_user(uid)
    if not company:
        if require_company:
            raise HTTPException(
                status_code=403,
                detail="A verified company account is required to post hiring jobs.",
            )
        return {"status": "unscoped"}
    if not _is_verified(company):
        raise HTTPException(status_code=423, detail=PENDING_GATE_MESSAGE)
    return company
