"""Saved jobs — list, toggle, and card builders."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from database import job_saved_collection, jobs_collection

USER_FIELD = "user_identifier"


class SaveJobPayload(BaseModel):
    user_identifier: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field(..., min_length=1, max_length=120)
    job_snapshot: Optional[Dict[str, Any]] = None


class SavedJobTogglePayload(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field(..., min_length=1, max_length=120)
    job_snapshot: Optional[Dict[str, Any]] = None


def _uid(raw: str) -> str:
    return str(raw or "").strip()


def _format_saved_on(ts: str) -> str:
    try:
        dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y")
    except (TypeError, ValueError):
        return "Recently"


async def _find_job_doc(job_id: str) -> Optional[dict]:
    jid = str(job_id or "").strip()
    if not jid:
        return None
    if ObjectId.is_valid(jid):
        doc = await jobs_collection.find_one({"_id": ObjectId(jid)})
        if doc:
            return doc
    return await jobs_collection.find_one({"_id": jid})


def _job_doc_to_card(doc: dict, saved_on: str, save_id: str) -> dict:
    tags = [str(t).strip() for t in (doc.get("skills_tags") or doc.get("tags") or []) if str(t).strip()][:8]
    company = doc.get("company_name") or "Company"
    title = doc.get("title") or "Role"
    salary = doc.get("salary_range") or doc.get("salary") or "Competitive"
    remote = bool(doc.get("remote", True))
    location = doc.get("location") or ("Remote" if remote else "On-site")
    logo = (company[:1] or "J").upper()
    return {
        "id": str(doc.get("_id") or save_id),
        "saveId": save_id,
        "jobId": str(doc.get("_id") or ""),
        "role": title,
        "company": company,
        "salary": salary,
        "type": doc.get("employment_type") or "Full-time",
        "location": location,
        "savedOn": saved_on,
        "logoText": logo,
        "logoClass": (doc.get("logo_class") or company.split()[0].lower()[:12]),
        "tags": tags,
    }


def _snapshot_to_card(snap: dict, job_id: str, saved_on: str, save_id: str) -> dict:
    company = snap.get("company") or "Company"
    return {
        "id": job_id,
        "saveId": save_id,
        "jobId": job_id,
        "role": snap.get("role") or "Role",
        "company": company,
        "salary": snap.get("salary") or "Competitive",
        "type": snap.get("type") or "Full-time",
        "location": snap.get("location") or "Remote",
        "savedOn": saved_on,
        "logoText": snap.get("logoText") or (company[:1] or "J").upper(),
        "logoClass": snap.get("logoClass") or "google",
        "tags": list(snap.get("tags") or [])[:8],
    }


async def saved_count(user_id: str) -> int:
    return await job_saved_collection.count_documents({USER_FIELD: _uid(user_id)})


async def list_saved_jobs(user_id: str) -> List[dict]:
    uid = _uid(user_id)
    rows: List[dict] = []
    async for doc in job_saved_collection.find({USER_FIELD: uid}).sort("timestamp", -1):
        job_id = str(doc.get("job_id") or "")
        saved_on = _format_saved_on(doc.get("timestamp") or "")
        save_id = str(doc.get("_id") or "")
        job_doc = await _find_job_doc(job_id)
        if job_doc:
            rows.append(_job_doc_to_card(job_doc, saved_on, save_id))
        elif doc.get("job_snapshot"):
            rows.append(_snapshot_to_card(doc["job_snapshot"], job_id, saved_on, save_id))
    return rows


async def _insert_saved_row(uid: str, job_id: str, snap: Optional[dict]) -> dict:
    now = datetime.utcnow().isoformat()
    doc = {
        USER_FIELD: uid,
        "job_id": job_id,
        "timestamp": now,
        "job_snapshot": snap,
    }
    result = await job_saved_collection.insert_one(doc)
    save_id = str(result.inserted_id)
    saved_on = _format_saved_on(now)
    job_doc = await _find_job_doc(job_id)
    if job_doc:
        card = _job_doc_to_card(job_doc, saved_on, save_id)
    elif snap:
        card = _snapshot_to_card(snap, job_id, saved_on, save_id)
    else:
        card = {
            "id": job_id,
            "saveId": save_id,
            "jobId": job_id,
            "role": "Saved Job",
            "company": "—",
            "salary": "—",
            "type": "—",
            "location": "—",
            "savedOn": saved_on,
            "logoText": "J",
            "logoClass": "google",
            "tags": [],
        }
    count = await saved_count(uid)
    return {"saved": True, "data": card, "menuCounts": {"saved": count}}


async def save_job(payload: SaveJobPayload) -> dict:
    uid = _uid(payload.user_identifier)
    job_id = str(payload.job_id).strip()
    existing = await job_saved_collection.find_one({USER_FIELD: uid, "job_id": job_id})
    if existing:
        count = await saved_count(uid)
        saved_on = _format_saved_on(existing.get("timestamp") or "")
        snap = existing.get("job_snapshot")
        if isinstance(snap, dict):
            card = _snapshot_to_card(snap, job_id, saved_on, str(existing["_id"]))
        else:
            job_doc = await _find_job_doc(job_id)
            card = _job_doc_to_card(job_doc, saved_on, str(existing["_id"])) if job_doc else None
        return {"saved": True, "data": card, "menuCounts": {"saved": count}}

    snap = payload.job_snapshot if isinstance(payload.job_snapshot, dict) else None
    if not snap:
        job_doc = await _find_job_doc(job_id)
        if job_doc:
            snap = _job_doc_to_card(job_doc, _format_saved_on(datetime.utcnow().isoformat()), "")
    return await _insert_saved_row(uid, job_id, snap)


async def unsave_job(user_identifier: str, job_id: str) -> dict:
    uid = _uid(user_identifier)
    jid = str(job_id).strip()
    existing = await job_saved_collection.find_one({USER_FIELD: uid, "job_id": jid})
    if existing:
        await job_saved_collection.delete_one({"_id": existing["_id"]})
    count = await saved_count(uid)
    return {"saved": False, "data": None, "menuCounts": {"saved": count}}


async def toggle_saved_job(payload: SavedJobTogglePayload) -> dict:
    uid = _uid(payload.user_id)
    job_id = str(payload.job_id).strip()
    existing = await job_saved_collection.find_one({USER_FIELD: uid, "job_id": job_id})
    if existing:
        return await unsave_job(uid, job_id)
    snap = payload.job_snapshot if isinstance(payload.job_snapshot, dict) else None
    return await save_job(
        SaveJobPayload(user_identifier=uid, job_id=job_id, job_snapshot=snap),
    )
