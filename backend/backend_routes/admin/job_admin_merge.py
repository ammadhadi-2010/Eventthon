"""Merge hub job listings with user-created job_alerts for admin views."""
from __future__ import annotations

from typing import Dict, List, Set

from bson import ObjectId

from database import job_alerts_collection, jobs_collection
from .job_admin_format import coalesce_job_fields

JOB_ALERT_PREFIX = "job-alert-"


def job_id_for_alert(alert_id: str) -> str:
    return f"{JOB_ALERT_PREFIX}{alert_id}"


def alert_id_from_doc(doc: dict) -> str:
    aid = str(doc.get("alert_id") or "").strip()
    if aid:
        return aid
    jid = str(doc.get("_id") or "")
    if jid.startswith(JOB_ALERT_PREFIX):
        return jid[len(JOB_ALERT_PREFIX) :]
    return ""


def alert_doc_to_job_doc(alert: dict) -> dict:
    """Normalize a job_alerts row into the jobs collection field shape."""
    aid = str(alert.get("_id") or "")
    fields = coalesce_job_fields(alert)
    smin = int(alert.get("salary_min") or 60)
    smax = int(alert.get("salary_max") or 100)
    raw_status = str(alert.get("status") or "pending").lower()
    return {
        "_id": job_id_for_alert(aid),
        "alert_id": aid,
        "title": fields["title"],
        "company_name": fields["company"],
        "category": fields["category"],
        "description": alert.get("description") or "",
        "employment_type": alert.get("employment_type"),
        "experience_level": alert.get("experience_level"),
        "work_mode": alert.get("work_mode") or "Remote",
        "location": alert.get("work_mode") or alert.get("location") or "Remote",
        "salary_range": alert.get("salary_range") or f"${smin}k - ${smax}k",
        "compensation_band": {"min": smin, "max": smax},
        "status": raw_status if raw_status in ("draft", "pending", "active") else "pending",
        "is_approved": bool(alert.get("is_approved", False)),
        "visibility": alert.get("visibility") or "public",
        "user_id": alert.get("user_id"),
        "created_at": alert.get("created_at"),
        "updated_at": alert.get("updated_at"),
        "hub_source": "job_alert",
    }


async def fetch_all_admin_job_docs() -> List[dict]:
    """All jobs rows plus user alerts not yet linked in jobs collection."""
    docs: List[dict] = []
    linked_alerts: Set[str] = set()

    async for doc in jobs_collection.find({}):
        docs.append(doc)
        aid = alert_id_from_doc(doc)
        if aid:
            linked_alerts.add(aid)

    async for alert in job_alerts_collection.find({}):
        aid = str(alert.get("_id") or "")
        if not aid or aid in linked_alerts:
            continue
        docs.append(alert_doc_to_job_doc(alert))

    docs.sort(key=lambda d: str(d.get("created_at") or d.get("updated_at") or ""), reverse=True)
    return docs


async def resolve_admin_job(job_id: str):
    """Find a job in jobs collection or synthesize from job_alerts."""
    jid = str(job_id or "").strip()
    if not jid:
        return None
    if ObjectId.is_valid(jid):
        doc = await jobs_collection.find_one({"_id": ObjectId(jid)})
        if doc:
            return doc
        alert = await job_alerts_collection.find_one({"_id": ObjectId(jid)})
        if alert:
            return alert_doc_to_job_doc(alert)
    doc = await jobs_collection.find_one({"_id": jid})
    if doc:
        return doc
    if jid.startswith(JOB_ALERT_PREFIX):
        aid = jid[len(JOB_ALERT_PREFIX) :]
        if ObjectId.is_valid(aid):
            alert = await job_alerts_collection.find_one({"_id": ObjectId(aid)})
            if alert:
                return alert_doc_to_job_doc(alert)
    alert = await job_alerts_collection.find_one({"_id": jid})
    if alert:
        return alert_doc_to_job_doc(alert)
    return None


async def delete_admin_job_records(doc: dict) -> None:
    jid = doc.get("_id")
    if jid is not None:
        await jobs_collection.delete_one({"_id": jid})
    aid = alert_id_from_doc(doc)
    if aid and ObjectId.is_valid(aid):
        await job_alerts_collection.delete_one({"_id": ObjectId(aid)})


async def persist_admin_job(doc: dict, patch: Dict) -> dict:
    """Apply patch to jobs row; upsert when sourced from job_alerts only."""
    jid = doc.get("_id")
    if jid is not None:
        await jobs_collection.update_one({"_id": jid}, {"$set": patch}, upsert=True)
        updated = await jobs_collection.find_one({"_id": jid})
        if updated:
            return updated
    return {**doc, **patch}
