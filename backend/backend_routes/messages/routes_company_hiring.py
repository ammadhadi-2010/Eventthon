"""Company hiring pipeline + private recruiter notes (team-only)."""
from __future__ import annotations

from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import (
    company_hiring_threads_collection,
    company_recruiter_notes_collection,
    job_contact_messages_collection,
)

from .company_hiring_service import (
    ACTIVITY_TYPES,
    CONVERSATION_LABELS,
    HIRING_STAGES,
    STAGE_LABELS,
    STAGE_TO_ACTIVITY,
    append_activity,
    assert_company_recruiter,
    build_candidate_profile,
    get_or_create_thread,
    normalize_labels,
    normalize_stage,
    serialize_activity,
    serialize_note,
    thread_key,
)
from .helpers import _pick_user_name, _to_iso

router = APIRouter()


class HiringStageBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    candidate_user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field("", max_length=120)
    stage: str = Field(..., min_length=3, max_length=40)


class NoteCreateBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    candidate_user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field("", max_length=120)
    body: str = Field(..., min_length=1, max_length=4000)


class NoteUpdateBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    body: str = Field(..., min_length=1, max_length=4000)


class NoteDeleteBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)


class AssignBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    candidate_user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field("", max_length=120)
    assignee_user_id: str = Field("", max_length=120)
    assignee_email: str = Field("", max_length=180)
    assignee_name: str = Field("", max_length=160)
    assignee_role: str = Field("recruiter", max_length=40)


class LabelsBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    candidate_user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field("", max_length=120)
    labels: list[str] = Field(default_factory=list)


class ActivityBody(BaseModel):
    employer_user_id: str = Field(..., min_length=2, max_length=120)
    candidate_user_id: str = Field(..., min_length=2, max_length=120)
    job_id: str = Field("", max_length=120)
    event_type: str = Field(..., min_length=2, max_length=40)
    detail: str = Field("", max_length=240)


@router.get("/company-hiring-context")
async def company_hiring_context(
    employer_user_id: str,
    candidate_user_id: str,
    job_id: str = "",
):
    employer = await assert_company_recruiter(employer_user_id)
    if not candidate_user_id.strip():
        raise HTTPException(status_code=400, detail="Candidate is required.")
    if str(employer.get("email") or "").strip().lower() == candidate_user_id.strip().lower():
        pass

    thread = await get_or_create_thread(employer_user_id, candidate_user_id, job_id)
    stage = normalize_stage(thread.get("hiring_stage") or "applied") or "applied"
    notes = []
    key = thread_key(employer_user_id, candidate_user_id, job_id)
    async for doc in company_recruiter_notes_collection.find({"thread_key": key}).sort("created_at", -1).limit(50):
        notes.append(serialize_note(doc))

    profile = await build_candidate_profile(candidate_user_id)
    # Auto: Resume Viewed when recruiter opens workspace and resume exists
    if profile.get("resumeUrl"):
        recent = False
        cutoff = datetime.utcnow() - timedelta(hours=12)
        for ev in reversed(list(thread.get("activity") or [])[-8:]):
            if str(ev.get("type") or "") == "resume_viewed":
                created = ev.get("created_at")
                if isinstance(created, datetime) and created >= cutoff:
                    recent = True
                break
        if not recent:
            await append_activity(thread, "resume_viewed", "Recruiter opened candidate resume context")

    return {
        "status": "success",
        "data": {
            "stages": [{"id": s, "label": STAGE_LABELS[s]} for s in HIRING_STAGES],
            "hiringStage": stage,
            "hiringStageLabel": STAGE_LABELS.get(stage, stage),
            "labels": normalize_labels(thread.get("labels") or ["hiring"]),
            "availableLabels": list(CONVERSATION_LABELS),
            "timeline": serialize_activity(thread.get("activity") or []),
            "profile": profile,
            "notes": notes,
            "threadKey": key,
            "updatedAt": _to_iso(thread.get("updated_at")),
            "assignment": {
                "assigneeUserId": str(thread.get("assignee_user_id") or ""),
                "assigneeEmail": str(thread.get("assignee_email") or ""),
                "assigneeName": str(thread.get("assignee_name") or ""),
                "assigneeRole": str(thread.get("assignee_role") or ""),
            },
        },
    }


@router.post("/company-hiring-assign")
async def assign_company_conversation(body: AssignBody):
    await assert_company_recruiter(body.employer_user_id)
    thread = await get_or_create_thread(body.employer_user_id, body.candidate_user_id, body.job_id)
    role = str(body.assignee_role or "recruiter").strip().lower().replace(" ", "_")
    if role not in {"owner", "admin", "hr_manager", "hr", "recruiter", "viewer"}:
        role = "recruiter"
    if role == "hr":
        role = "hr_manager"
    now = datetime.utcnow()
    patch = {
        "assignee_user_id": body.assignee_user_id.strip(),
        "assignee_email": body.assignee_email.strip().lower(),
        "assignee_name": body.assignee_name.strip() or body.assignee_email.strip(),
        "assignee_role": role,
        "updated_at": now,
    }
    await company_hiring_threads_collection.update_one({"_id": thread["_id"]}, {"$set": patch})
    await append_activity(thread, "assigned", f"Assigned to {patch['assignee_name']} ({role})")
    return {"status": "success", "data": {
        "assigneeUserId": patch["assignee_user_id"],
        "assigneeEmail": patch["assignee_email"],
        "assigneeName": patch["assignee_name"],
        "assigneeRole": patch["assignee_role"],
    }}


@router.post("/company-hiring-stage")
async def set_company_hiring_stage(body: HiringStageBody):
    await assert_company_recruiter(body.employer_user_id)
    stage = normalize_stage(body.stage)
    if not stage:
        raise HTTPException(status_code=400, detail="Invalid hiring stage.")
    thread = await get_or_create_thread(body.employer_user_id, body.candidate_user_id, body.job_id)
    now = datetime.utcnow()
    await company_hiring_threads_collection.update_one(
        {"_id": thread["_id"]},
        {"$set": {"hiring_stage": stage, "updated_at": now}},
    )
    event_type = STAGE_TO_ACTIVITY.get(stage, "stage_changed")
    await append_activity(thread, event_type, f"Moved to {STAGE_LABELS.get(stage, stage)}")
    return {
        "status": "success",
        "data": {"hiringStage": stage, "hiringStageLabel": STAGE_LABELS[stage]},
    }


@router.post("/company-hiring-labels")
async def set_company_hiring_labels(body: LabelsBody):
    await assert_company_recruiter(body.employer_user_id)
    labels = normalize_labels(body.labels)
    thread = await get_or_create_thread(body.employer_user_id, body.candidate_user_id, body.job_id)
    now = datetime.utcnow()
    await company_hiring_threads_collection.update_one(
        {"_id": thread["_id"]},
        {"$set": {"labels": labels, "updated_at": now}},
    )
    await append_activity(thread, "labels_updated", ", ".join(labels) or "cleared")
    return {"status": "success", "data": {"labels": labels}}


@router.post("/company-hiring-activity")
async def add_company_hiring_activity(body: ActivityBody):
    await assert_company_recruiter(body.employer_user_id)
    etype = str(body.event_type or "").strip().lower()
    if etype not in ACTIVITY_TYPES and etype not in STAGE_LABELS:
        raise HTTPException(status_code=400, detail="Invalid activity type.")
    thread = await get_or_create_thread(body.employer_user_id, body.candidate_user_id, body.job_id)
    await append_activity(thread, etype, body.detail)
    return {"status": "success", "data": {"timeline": serialize_activity(thread.get("activity") or [])}}


@router.get("/company-hiring-analytics")
async def company_hiring_analytics(employer_user_id: str = Query(..., min_length=2, max_length=120)):
    await assert_company_recruiter(employer_user_id)
    employer = employer_user_id.strip()
    threads = []
    async for doc in company_hiring_threads_collection.find(
        {"employer_user_id": {"$regex": f"^{employer}$", "$options": "i"}}
    ).limit(500):
        threads.append(doc)

    messages = []
    async for doc in job_contact_messages_collection.find({"seller_user_id": employer}).limit(800):
        messages.append(doc)

    msg_count = len(messages)
    files_shared = 0
    reply_deltas = []
    for doc in messages:
        atts = doc.get("attachments") or []
        if isinstance(atts, list):
            files_shared += len(atts)
        created = doc.get("created_at")
        if not isinstance(created, datetime):
            continue
        from_id = str(doc.get("from_user_id") or "").strip().lower()
        if from_id == employer.lower() or from_id == str(doc.get("seller_user_id") or "").strip().lower():
            # recruiter message — find prior candidate msg
            continue

    # Average reply time: recruiter messages that follow candidate messages in same job thread
    by_pair: dict[str, list] = {}
    for doc in messages:
        key = f"{doc.get('from_user_id')}::{doc.get('job_id')}"
        by_pair.setdefault(str(doc.get("job_id") or ""), []).append(doc)
    for rows in by_pair.values():
        rows.sort(key=lambda d: d.get("created_at") or datetime.min)
        last_candidate_at = None
        for doc in rows:
            created = doc.get("created_at")
            if not isinstance(created, datetime):
                continue
            from_id = str(doc.get("from_user_id") or "").strip().lower()
            seller = str(doc.get("seller_user_id") or "").strip().lower()
            if from_id != seller:
                last_candidate_at = created
            elif last_candidate_at:
                delta = (created - last_candidate_at).total_seconds()
                if 0 < delta < 60 * 60 * 72:
                    reply_deltas.append(delta)
                last_candidate_at = None

    avg_reply = int(sum(reply_deltas) / len(reply_deltas)) if reply_deltas else 0
    response_time = min(reply_deltas) if reply_deltas else 0

    interviews = sum(1 for t in threads if str(t.get("hiring_stage") or "") in {
        "interview_scheduled", "technical_test", "offer_sent", "hired"
    } or any(str(e.get("type")) == "interview_scheduled" for e in (t.get("activity") or [])))
    offers = sum(1 for t in threads if str(t.get("hiring_stage") or "") in {"offer_sent", "hired"})
    hired = sum(1 for t in threads if str(t.get("hiring_stage") or "") == "hired")
    total = max(len(threads), 1)

    def fmt_secs(secs: int) -> str:
        s = int(secs or 0)
        if s <= 0:
            return "—"
        if s < 60:
            return f"{s}s"
        if s < 3600:
            return f"{s // 60}m"
        return f"{s // 3600}h {(s % 3600) // 60}m"

    return {
        "status": "success",
        "data": {
            "responseTime": fmt_secs(int(response_time)),
            "averageReplyTime": fmt_secs(avg_reply),
            "messagesCount": msg_count,
            "filesShared": files_shared,
            "interviewCount": interviews,
            "offerRate": round((offers / total) * 100),
            "hiringRate": round((hired / total) * 100),
            "threadsCount": len(threads),
        },
    }


@router.post("/company-recruiter-notes")
async def create_recruiter_note(body: NoteCreateBody):
    employer = await assert_company_recruiter(body.employer_user_id)
    text = body.body.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Note body is required.")
    await get_or_create_thread(body.employer_user_id, body.candidate_user_id, body.job_id)
    now = datetime.utcnow()
    doc = {
        "thread_key": thread_key(body.employer_user_id, body.candidate_user_id, body.job_id),
        "employer_user_id": body.employer_user_id.strip(),
        "candidate_user_id": body.candidate_user_id.strip(),
        "job_id": body.job_id.strip(),
        "body": text,
        "author_user_id": str(employer.get("_id") or ""),
        "author_email": str(employer.get("email") or "").strip().lower(),
        "author_name": _pick_user_name(employer) or "Recruiter",
        "created_at": now,
        "updated_at": now,
        "visibility": "company_team_only",
    }
    result = await company_recruiter_notes_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"status": "success", "data": serialize_note(doc)}


@router.patch("/company-recruiter-notes/{note_id}")
async def update_recruiter_note(note_id: str, body: NoteUpdateBody):
    await assert_company_recruiter(body.employer_user_id)
    try:
        oid = ObjectId(note_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Note not found.") from exc
    doc = await company_recruiter_notes_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found.")
    text = body.body.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Note body is required.")
    now = datetime.utcnow()
    await company_recruiter_notes_collection.update_one(
        {"_id": oid},
        {"$set": {"body": text, "updated_at": now}},
    )
    doc["body"] = text
    doc["updated_at"] = now
    return {"status": "success", "data": serialize_note(doc)}


@router.post("/company-recruiter-notes/{note_id}/delete")
async def delete_recruiter_note(note_id: str, body: NoteDeleteBody):
    await assert_company_recruiter(body.employer_user_id)
    try:
        oid = ObjectId(note_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Note not found.") from exc
    doc = await company_recruiter_notes_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found.")
    await company_recruiter_notes_collection.delete_one({"_id": oid})
    return {"status": "success", "data": {"deleted": True}}
