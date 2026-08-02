"""Match new job/opportunity listings against saved seeker alerts + notify."""
from __future__ import annotations

from datetime import datetime
from typing import List

from database import job_alert_matches_collection, job_alerts_collection, jobs_collection
from backend_routes.alerts.alert_factory import push_alert

from .hub_listings import job_doc_to_listing_card
from .hub_recommended import _skill_tokens, compute_skill_match


def _alert_kind_for_listing(listing_kind: str) -> str:
    kind = str(listing_kind or "").strip().lower()
    return "opportunity" if kind == "opportunity" else "job"


def _title_tokens(text: str) -> set[str]:
    return {t for t in _skill_tokens([text or ""]) if len(t) > 2}


def score_alert_against_job(alert: dict, job: dict) -> int:
    """Return 0–100 match score; 0 means no match."""
    alert_title = str(alert.get("title") or "")
    job_title = str(job.get("title") or "")
    alert_cat = str(alert.get("job_category") or "").strip().lower()
    job_cat = str(job.get("category") or "").strip().lower()
    alert_mode = str(alert.get("work_mode") or "").strip().lower()
    job_mode = str(job.get("work_mode") or job.get("location") or "").strip().lower()

    alert_skills = list(alert.get("skills") or []) + list(alert.get("keywords") or [])
    job_tags = list(job.get("skills_tags") or []) + list(job.get("keywords") or [])
    if job.get("opportunity_type"):
        job_tags.append(str(job.get("opportunity_type")))
    if job.get("employment_type"):
        job_tags.append(str(job.get("employment_type")))

    skill = compute_skill_match(alert_skills, job_tags)
    skill_pct = int(skill.get("matchPercent") or 0)

    title_a = _title_tokens(alert_title)
    title_j = _title_tokens(job_title)
    title_overlap = len(title_a & title_j)
    title_pct = 0
    if title_a and title_j:
        title_pct = min(100, round((title_overlap / max(len(title_a), 1)) * 100))

    category_bonus = 20 if alert_cat and job_cat and (alert_cat in job_cat or job_cat in alert_cat) else 0
    mode_bonus = 10 if alert_mode and job_mode and alert_mode in job_mode else 0

    # Soft match: title substring either way
    soft = 0
    at = alert_title.lower().strip()
    jt = job_title.lower().strip()
    if at and jt and (at in jt or jt in at or title_overlap > 0):
        soft = 35

    score = max(skill_pct, title_pct, soft) + category_bonus + mode_bonus
    # Require at least some signal
    if skill_pct < 25 and title_pct < 20 and soft < 35 and not category_bonus:
        return 0
    return min(100, score)


async def find_matching_alerts(job_doc: dict, *, min_score: int = 25) -> List[dict]:
    listing_kind = str(job_doc.get("listing_kind") or "company").lower()
    wanted = _alert_kind_for_listing(listing_kind)
    poster = str(job_doc.get("posted_by") or "").strip().lower()
    rows: List[dict] = []
    if wanted == "opportunity":
        query: dict = {"alert_kind": "opportunity"}
    else:
        query = {
            "$or": [
                {"alert_kind": "job"},
                {"alert_kind": {"$exists": False}},
                {"alert_kind": None},
                {"alert_kind": ""},
            ]
        }
    cursor = job_alerts_collection.find(query)
    async for alert in cursor:
        uid = str(alert.get("user_id") or "").strip()
        if not uid:
            continue
        if poster and uid.lower() == poster:
            continue
        score = score_alert_against_job(alert, job_doc)
        if score < min_score:
            continue
        rows.append({"alert": alert, "score": score})
    rows.sort(key=lambda r: r["score"], reverse=True)
    return rows


async def notify_matching_alerts_for_job(job_id: str) -> int:
    """Upsert matches + push instant notification. Idempotent per (alert_id, job_id)."""
    jid = str(job_id or "").strip()
    if not jid:
        return 0
    job = await jobs_collection.find_one({"_id": jid})
    if not job:
        return 0

    listing_kind = str(job.get("listing_kind") or "company").lower()
    is_opportunity = listing_kind == "opportunity"
    action_label = "Join" if is_opportunity else "Apply"
    action_url = f"/jobs/alerts?match={jid}"
    title = str(job.get("title") or ("New opportunity" if is_opportunity else "New job"))
    company = str(job.get("company_name") or ("Community" if is_opportunity else "Company"))

    matched = await find_matching_alerts(job)
    notified = 0
    now = datetime.utcnow().isoformat()

    for row in matched:
        alert = row["alert"]
        alert_id = str(alert.get("_id") or "")
        uid = str(alert.get("user_id") or "").strip()
        if not alert_id or not uid:
            continue

        existing = await job_alert_matches_collection.find_one(
            {"alert_id": alert_id, "job_id": jid}
        )
        match_doc = {
            "user_id": uid,
            "alert_id": alert_id,
            "job_id": jid,
            "listing_kind": listing_kind,
            "alert_kind": _alert_kind_for_listing(listing_kind),
            "match_percent": row["score"],
            "job_title": title,
            "company_name": company,
            "updated_at": now,
        }
        if existing:
            await job_alert_matches_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": match_doc},
            )
            if existing.get("notified"):
                continue
            match_oid = existing["_id"]
        else:
            match_doc["created_at"] = now
            match_doc["notified"] = False
            ins = await job_alert_matches_collection.insert_one(match_doc)
            match_oid = ins.inserted_id

        kind_label = "opportunity" if is_opportunity else "job"
        await push_alert(
            recipient_identifier=uid,
            category="jobs",
            title=f"New matching {kind_label}",
            message=f"{title} matches your alert “{alert.get('title') or 'Alert'}”.",
            details=f"{company} · {row['score']}% match",
            actor_name=company,
            priority="high",
            action_label=action_label,
            action_url=action_url,
            audience="member",
        )
        await job_alert_matches_collection.update_one(
            {"_id": match_oid},
            {"$set": {"notified": True, "notified_at": now}},
        )
        notified += 1

    return notified


async def list_alert_matches_for_user(user_id: str, limit: int = 40) -> List[dict]:
    uid = str(user_id or "").strip()
    if not uid:
        return []
    rows: List[dict] = []
    cursor = (
        job_alert_matches_collection.find({"user_id": uid})
        .sort("created_at", -1)
        .limit(max(1, min(limit, 80)))
    )
    async for match in cursor:
        job = await jobs_collection.find_one({"_id": match.get("job_id")})
        if not job:
            continue
        card = job_doc_to_listing_card(job)
        listing_kind = str(match.get("listing_kind") or card.get("listingKind") or "company")
        rows.append(
            {
                **card,
                "matchId": str(match.get("_id") or ""),
                "alertId": str(match.get("alert_id") or ""),
                "matchPercent": int(match.get("match_percent") or 0),
                "listingKind": listing_kind,
                "ctaLabel": "Join" if listing_kind == "opportunity" else "Apply",
                "matchedAt": match.get("created_at") or match.get("updated_at") or "",
            }
        )
    return rows
