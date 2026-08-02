"""Company hiring thread helpers — stages + private recruiter notes."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException

from database import (
    company_hiring_threads_collection,
    company_members_collection,
    company_recruiter_notes_collection,
    gig_orders_collection,
    hub_projects_collection,
    user_collection,
)
from .helpers import _find_user_by_identifier, _pick_user_name, _to_iso

HIRING_STAGES = (
    "applied",
    "reviewing",
    "shortlisted",
    "interview_scheduled",
    "technical_test",
    "offer_sent",
    "hired",
    "rejected",
)

STAGE_LABELS = {
    "applied": "Applied",
    "reviewing": "Reviewing",
    "shortlisted": "Shortlisted",
    "interview_scheduled": "Interview Scheduled",
    "technical_test": "Technical Test",
    "offer_sent": "Offer Sent",
    "hired": "Hired",
    "rejected": "Rejected",
}

CONVERSATION_LABELS = (
    "hiring",
    "interview",
    "support",
    "vip",
    "urgent",
    "payment",
    "verified",
)

ACTIVITY_TYPES = {
    "applied": "Applied",
    "resume_viewed": "Resume Viewed",
    "recruiter_replied": "Recruiter Replied",
    "interview_scheduled": "Interview Scheduled",
    "interview_completed": "Interview Completed",
    "offer_sent": "Offer Sent",
    "accepted": "Accepted",
    "rejected": "Rejected",
    "stage_changed": "Stage Updated",
    "assigned": "Conversation Assigned",
    "labels_updated": "Labels Updated",
}

STAGE_TO_ACTIVITY = {
    "applied": "applied",
    "interview_scheduled": "interview_scheduled",
    "offer_sent": "offer_sent",
    "hired": "accepted",
    "rejected": "rejected",
    "technical_test": "interview_completed",
}


def normalize_stage(raw: str) -> str:
    key = str(raw or "").strip().lower().replace(" ", "_").replace("-", "_")
    aliases = {
        "interview": "interview_scheduled",
        "scheduled": "interview_scheduled",
        "technical": "technical_test",
        "offer": "offer_sent",
        "screening": "reviewing",
    }
    key = aliases.get(key, key)
    return key if key in HIRING_STAGES else ""


def thread_key(employer_id: str, candidate_id: str, job_id: str = "") -> str:
    return f"{employer_id.strip().lower()}::{candidate_id.strip().lower()}::{str(job_id or '').strip()}"


async def assert_company_recruiter(employer_id: str) -> dict:
    """Only active company team members may manage hiring notes/stages."""
    user = await _find_user_by_identifier(employer_id)
    if not user:
        raise HTTPException(status_code=404, detail="Employer account not found.")
    email = str(user.get("email") or "").strip().lower()
    uid = str(user.get("_id") or "")
    member = await company_members_collection.find_one(
        {
            "status": "active",
            "$or": [{"user_id": uid}, {"email": email}] if email else [{"user_id": uid}],
        }
    )
    # Founders / employers without member row yet still own company_id
    if not member and not str(user.get("company_id") or "").strip():
        role = str(user.get("role") or "").lower()
        if role not in ("employer", "company", "admin"):
            raise HTTPException(status_code=403, detail="Only company team members can manage hiring.")
    return user


def normalize_labels(raw) -> list[str]:
    if not isinstance(raw, list):
        return []
    out = []
    for item in raw:
        key = str(item or "").strip().lower().replace(" ", "_")
        if key in CONVERSATION_LABELS and key not in out:
            out.append(key)
    return out


def serialize_activity(events) -> list[dict]:
    rows = []
    if not isinstance(events, list):
        return rows
    for ev in events[-40:]:
        if not isinstance(ev, dict):
            continue
        etype = str(ev.get("type") or "").strip().lower()
        rows.append(
            {
                "id": str(ev.get("id") or ""),
                "type": etype,
                "label": ACTIVITY_TYPES.get(etype) or STAGE_LABELS.get(etype) or etype.replace("_", " ").title(),
                "detail": str(ev.get("detail") or ""),
                "createdAt": _to_iso(ev.get("created_at")),
            }
        )
    rows.reverse()
    return rows


async def append_activity(thread: dict, event_type: str, detail: str = "") -> list:
    etype = str(event_type or "").strip().lower()
    if not etype:
        return list(thread.get("activity") or [])
    now = datetime.utcnow()
    event = {
        "id": str(ObjectId()),
        "type": etype,
        "detail": str(detail or "").strip()[:240],
        "created_at": now,
    }
    await company_hiring_threads_collection.update_one(
        {"_id": thread["_id"]},
        {"$push": {"activity": {"$each": [event], "$slice": -80}}, "$set": {"updated_at": now}},
    )
    activity = list(thread.get("activity") or [])
    activity.append(event)
    thread["activity"] = activity
    return activity


async def get_or_create_thread(employer_id: str, candidate_id: str, job_id: str = "") -> dict:
    key = thread_key(employer_id, candidate_id, job_id)
    doc = await company_hiring_threads_collection.find_one({"thread_key": key})
    if doc:
        return doc
    now = datetime.utcnow()
    applied = {
        "id": str(ObjectId()),
        "type": "applied",
        "detail": "Candidate entered hiring pipeline",
        "created_at": now,
    }
    doc = {
        "thread_key": key,
        "employer_user_id": employer_id.strip(),
        "candidate_user_id": candidate_id.strip(),
        "job_id": str(job_id or "").strip(),
        "hiring_stage": "applied",
        "labels": ["hiring"],
        "activity": [applied],
        "created_at": now,
        "updated_at": now,
    }
    result = await company_hiring_threads_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def serialize_note(doc: dict) -> dict:
    return {
        "id": str(doc.get("_id") or ""),
        "body": str(doc.get("body") or ""),
        "authorName": str(doc.get("author_name") or "Recruiter"),
        "authorEmail": str(doc.get("author_email") or ""),
        "createdAt": _to_iso(doc.get("created_at")),
        "updatedAt": _to_iso(doc.get("updated_at")),
    }


async def build_candidate_profile(candidate_id: str) -> dict:
    user = await _find_user_by_identifier(candidate_id) or {}
    skills = user.get("skills") or user.get("top_skills") or []
    if isinstance(skills, list):
        skill_labels = [
            (s.get("name") if isinstance(s, dict) else str(s)).strip()
            for s in skills
            if (s.get("name") if isinstance(s, dict) else str(s)).strip()
        ][:12]
    else:
        skill_labels = []

    languages = user.get("languages") or []
    if isinstance(languages, list):
        lang_labels = [
            (x.get("name") if isinstance(x, dict) else str(x)).strip()
            for x in languages
            if (x.get("name") if isinstance(x, dict) else str(x)).strip()
        ][:8]
    else:
        lang_labels = []

    experiences = user.get("experiences") or user.get("experience") or []
    exp_summary = ""
    if isinstance(experiences, list) and experiences:
        first = experiences[0]
        if isinstance(first, dict):
            exp_summary = str(first.get("title") or first.get("role") or first.get("company") or "").strip()
        else:
            exp_summary = str(first).strip()
    elif isinstance(experiences, str):
        exp_summary = experiences.strip()

    followers = 0
    try:
        followers = int((user.get("profile_stats") or {}).get("followers") or 0)
    except (TypeError, ValueError):
        followers = 0
    if not followers and isinstance(user.get("follower_ids"), list):
        followers = len(user.get("follower_ids") or [])

    portfolio = str(
        user.get("portfolio_url")
        or user.get("portfolio")
        or user.get("website")
        or ""
    ).strip()
    resume = str(
        user.get("resume_url")
        or user.get("cv_url")
        or user.get("resume")
        or ""
    ).strip()

    projects = []
    gigs = []
    try:
        async for p in hub_projects_collection.find(
            {"$or": [{"owner_user_id": candidate_id}, {"user_id": candidate_id}]}
        ).limit(5):
            projects.append(str(p.get("title") or p.get("name") or "Project"))
    except Exception:
        pass
    try:
        async for g in gig_orders_collection.find(
            {"$or": [{"buyer_user_id": candidate_id}, {"seller_user_id": candidate_id}]}
        ).limit(5):
            gigs.append(str(g.get("gig_title") or g.get("title") or "Gig"))
    except Exception:
        pass

    name = _pick_user_name(user) or candidate_id
    return {
        "name": name,
        "imageurl": str(user.get("profile_image_url") or user.get("avatar") or "").strip(),
        "isVerified": bool(user.get("verified") or user.get("is_verified") or user.get("identity_status") == "Active"),
        "location": str(user.get("location") or user.get("city") or user.get("country") or "").strip() or "—",
        "experience": exp_summary or str(user.get("experience_years") or user.get("headline") or "—").strip(),
        "skills": skill_labels,
        "portfolioUrl": portfolio,
        "resumeUrl": resume,
        "etRank": str(user.get("rank") or user.get("rank_tier") or "Frontline").strip(),
        "etLevel": str(user.get("level") or user.get("rank_level") or "1").strip(),
        "followers": followers,
        "projects": projects,
        "gigs": gigs,
        "languages": lang_labels or ["English"],
        "joinedAt": _to_iso(user.get("created_at") or user.get("joined_at")),
        "online": bool(user.get("is_online") or False),
    }
