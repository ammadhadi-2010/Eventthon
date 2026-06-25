"""Admin company list filters — business profiles only."""
from __future__ import annotations

from typing import Set

ADMIN_ROLES = frozenset({"admin", "super_admin", "superadmin"})

LISTABLE_STATUSES = frozenset({"pending", "active", "verified", "rejected"})


def _owner_key(value) -> str:
    return str(value or "").strip().lower()


def _has_submission(doc: dict) -> bool:
    if doc.get("verification_submitted_at"):
        return True
    if doc.get("is_claimed") is True:
        return True
    if doc.get("is_admin_seed") is True:
        return True
    return False


def is_listable_company(doc: dict, admin_owner_keys: Set[str]) -> bool:
    """True when a company row belongs in admin Companies Management."""
    if doc.get("is_admin_seed") is True:
        return True

    status = _owner_key(doc.get("status") or "active")
    is_draft = doc.get("is_draft") is True or status == "draft"

    if is_draft and not _has_submission(doc):
        return False

    owner = _owner_key(doc.get("owner_user_id"))
    if owner and owner in admin_owner_keys:
        return False

    if _has_submission(doc):
        return True

    return status in LISTABLE_STATUSES and not is_draft


async def load_admin_owner_keys(user_collection) -> Set[str]:
    keys: Set[str] = set()
    async for user in user_collection.find({"role": {"$in": list(ADMIN_ROLES)}}):
        for field in ("_id", "user_id", "mobile", "email"):
            key = _owner_key(user.get(field))
            if key:
                keys.add(key)
    return keys
