"""User referral codes — invite friends to sign up."""
from __future__ import annotations

import secrets
import string

from bson import ObjectId

from database import user_collection

_ALPHABET = string.ascii_uppercase + string.digits


def _normalize_code(value: str) -> str:
    return "".join(ch for ch in str(value or "").upper() if ch.isalnum())[:16]


async def _unique_code() -> str:
    for _ in range(24):
        candidate = "".join(secrets.choice(_ALPHABET) for _ in range(8))
        exists = await user_collection.find_one({"referral_code": candidate}, {"_id": 1})
        if not exists:
            return candidate
    return secrets.token_hex(4).upper()


async def ensure_referral_code(user: dict) -> str:
    code = _normalize_code(user.get("referral_code"))
    if code:
        return code
    code = await _unique_code()
    await user_collection.update_one({"_id": user["_id"]}, {"$set": {"referral_code": code}})
    return code


async def find_user_by_referral_code(code: str) -> dict | None:
    normalized = _normalize_code(code)
    if len(normalized) < 4:
        return None
    return await user_collection.find_one({"referral_code": normalized})


async def apply_referral_for_new_user(new_user_oid: ObjectId, referral_code: str) -> bool:
    code = _normalize_code(referral_code)
    if not code:
        return False
    referrer = await find_user_by_referral_code(code)
    if not referrer:
        return False
    if referrer["_id"] == new_user_oid:
        return False

    await user_collection.update_one(
        {"_id": new_user_oid},
        {
            "$set": {
                "referred_by": str(referrer["_id"]),
                "referred_by_code": code,
            }
        },
    )
    await user_collection.update_one({"_id": referrer["_id"]}, {"$inc": {"referral_signups": 1}})
    return True


async def referral_summary(user: dict) -> dict:
    code = await ensure_referral_code(user)
    signups = int(user.get("referral_signups") or 0)
    return {
        "referralCode": code,
        "referralSignups": signups,
        "sharePath": f"/?ref={code}",
    }
