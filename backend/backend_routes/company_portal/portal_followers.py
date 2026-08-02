"""Company portal — followers list + follow/unfollow."""
from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from bson import ObjectId
from fastapi import HTTPException
from pydantic import BaseModel, Field

from database import companies_collection

from backend_routes.admin.job_company_link import find_company

from .portal_jobs import resolve_employer_company
from .portal_resolve import find_user
from .portal_shared import relative_time


class CompanyFollowPayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    company_id: str = Field(..., min_length=2, max_length=120)


def _follower_entries(company: dict) -> List[dict]:
    raw = company.get("company_followers")
    if isinstance(raw, list):
        return [x for x in raw if isinstance(x, dict)]
    # Legacy: plain id list
    ids = company.get("follower_ids") or []
    if isinstance(ids, list) and ids:
        return [{"user_id": str(uid), "followed_at": ""} for uid in ids if uid]
    return []


def _normalize_uid(value: Any) -> str:
    return str(value or "").strip()


def _display_name(user: Optional[dict], fallback: str) -> str:
    if not user:
        return fallback or "Member"
    fn = str(user.get("first_name") or "").strip()
    ln = str(user.get("last_name") or "").strip()
    full = f"{fn} {ln}".strip()
    if full:
        return full
    return str(user.get("email") or user.get("mobile") or fallback or "Member")


def _avatar(user: Optional[dict]) -> str:
    if not user:
        return ""
    for key in ("profile_image_url", "avatar", "imageurl", "photo"):
        val = str(user.get(key) or "").strip()
        if val:
            return val
    return ""


def _headline(user: Optional[dict]) -> str:
    if not user:
        return "Member"
    for key in ("headline", "title", "role", "job_title", "profession"):
        val = str(user.get(key) or "").strip()
        if val:
            return val
    return "Member"


async def _sync_followers_count(company_id: Any, entries: List[dict]) -> int:
    total = len(entries)
    await companies_collection.update_one(
        {"_id": company_id},
        {"$set": {"followers": total, "company_followers": entries, "updated_at": datetime.utcnow().isoformat()}},
    )
    return total


async def list_company_followers(
    user_id: str,
    *,
    q: str = "",
    skip: int = 0,
    limit: int = 80,
) -> dict:
    company, cid = await resolve_employer_company(user_id)
    entries = _follower_entries(company)
    # Keep counter honest
    if int(company.get("followers") or 0) != len(entries):
        await _sync_followers_count(company.get("_id"), entries)

    query = (q or "").strip().lower()
    rows: List[dict] = []
    for item in entries:
        uid = _normalize_uid(item.get("user_id") or item.get("candidate_user_id"))
        if not uid:
            continue
        user = await find_user(uid)
        name = _display_name(user, uid)
        role = _headline(user)
        if query:
            hay = f"{name} {role} {uid}".lower()
            if query not in hay:
                continue
        rows.append(
            {
                "id": uid,
                "followerUserId": uid,
                "name": name,
                "role": role,
                "location": str((user or {}).get("location") or (user or {}).get("city") or "").strip(),
                "imageurl": _avatar(user),
                "followedAt": relative_time(item.get("followed_at")) if item.get("followed_at") else "Recently",
                "followedAtRaw": str(item.get("followed_at") or ""),
                "profileUserId": uid,
            }
        )

    # Newest first when timestamps exist
    rows.sort(key=lambda r: r.get("followedAtRaw") or "", reverse=True)
    page = rows[skip : skip + limit]
    return {
        "followers": page,
        "total": len(rows),
        "companyId": cid,
        "counts": {"all": len(rows)},
    }


async def remove_company_follower(employer_user_id: str, follower_user_id: str) -> dict:
    company, cid = await resolve_employer_company(employer_user_id)
    target = follower_user_id.strip().lower()
    entries = [
        x
        for x in _follower_entries(company)
        if _normalize_uid(x.get("user_id") or x.get("candidate_user_id")).lower() != target
    ]
    total = await _sync_followers_count(company.get("_id"), entries)
    return {"status": "success", "companyId": cid, "total": total}


async def _load_company_for_follow(company_id: str) -> dict:
    company = await find_company(company_id)
    if not company:
        # try ObjectId
        if ObjectId.is_valid(company_id):
            company = await companies_collection.find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    return company


async def follow_company(payload: CompanyFollowPayload) -> dict:
    uid = payload.user_id.strip()
    if not await find_user(uid):
        raise HTTPException(status_code=404, detail="User account not found. Sign in again.")
    company = await _load_company_for_follow(payload.company_id)
    entries = _follower_entries(company)
    exists = any(
        _normalize_uid(x.get("user_id") or x.get("candidate_user_id")).lower() == uid.lower()
        for x in entries
    )
    if not exists:
        entries.insert(
            0,
            {"user_id": uid, "followed_at": datetime.utcnow().isoformat(), "source": "hub"},
        )
    total = await _sync_followers_count(company.get("_id"), entries[:5000])
    return {
        "status": "success",
        "following": True,
        "companyId": str(company.get("_id") or ""),
        "total": total,
    }


async def unfollow_company(user_id: str, company_id: str) -> dict:
    uid = user_id.strip()
    company = await _load_company_for_follow(company_id)
    entries = [
        x
        for x in _follower_entries(company)
        if _normalize_uid(x.get("user_id") or x.get("candidate_user_id")).lower() != uid.lower()
    ]
    total = await _sync_followers_count(company.get("_id"), entries)
    return {
        "status": "success",
        "following": False,
        "companyId": str(company.get("_id") or ""),
        "total": total,
    }


async def follow_status(user_id: str, company_id: str) -> dict:
    company = await _load_company_for_follow(company_id)
    entries = _follower_entries(company)
    uid = user_id.strip().lower()
    following = any(
        _normalize_uid(x.get("user_id") or x.get("candidate_user_id")).lower() == uid for x in entries
    )
    return {
        "following": following,
        "total": len(entries),
        "companyId": str(company.get("_id") or ""),
    }


def followers_count_from_company(company: dict) -> int:
    entries = _follower_entries(company)
    if entries:
        return len(entries)
    return int(company.get("followers") or 0)
