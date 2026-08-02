"""Company employer dashboard — live MongoDB aggregations."""
from __future__ import annotations

from collections import Counter
from typing import Any, Dict, List, Optional

from database import companies_collection, job_applications_collection, jobs_collection, user_collection
from backend_routes.admin.company_format import _is_verified, parse_imageurl
from backend_routes.jobs.hub_listings import _parse_band

from .portal_resolve import ensure_company_for_user, find_user
from .portal_analytics import build_analytics
from .portal_shared import BUCKET_LABELS, PORTAL_BUCKETS, format_joined_year, portal_bucket, relative_time


async def _job_ids_for_company(company_id: str) -> List[str]:
    ids: List[str] = []
    async for job in jobs_collection.find({"company_id": company_id}):
        ids.append(str(job.get("_id") or ""))
    return [j for j in ids if j]


def _format_followers(count: int) -> str:
    if count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M+"
    if count >= 1000:
        return f"{count / 1000:.1f}K+"
    return str(count)


async def build_company_profile(doc: dict, open_jobs: int, hired: int = 0, total_apps: int = 0) -> dict:
    from .portal_followers import followers_count_from_company

    cid = str(doc.get("_id") or "")
    followers_raw = followers_count_from_company(doc)
    profile_views = int(doc.get("profile_views") or 0)
    return {
        "id": cid,
        "name": str(doc.get("name") or "Company"),
        "imageurl": parse_imageurl(doc),
        "isVerified": _is_verified(doc),
        "status": str(doc.get("status") or "draft").strip().lower(),
        "tagline": str(doc.get("tagline") or "").strip(),
        "description": str(doc.get("description") or "").strip(),
        "website": str(doc.get("website") or "").strip(),
        "coverImageurl": str(doc.get("cover_imageurl") or "").strip(),
        "location": str(doc.get("location") or "").strip(),
        "country": str(doc.get("country") or "").strip(),
        "contactEmail": str(doc.get("contact_email") or "").strip(),
        "registrationNumber": str(doc.get("registration_number") or "").strip(),
        "taxId": str(doc.get("tax_id") or "").strip(),
        "industry": str(doc.get("industry") or "General").strip(),
        "employees": str(doc.get("size") or "—"),
        "openJobs": open_jobs,
        "hired": hired,
        "totalApplications": total_apps,
        "followers": _format_followers(followers_raw),
        "followersRaw": followers_raw,
        "profileViews": profile_views,
        "rating": doc.get("rating") if doc.get("rating") is not None else None,
        "linkedin": str(doc.get("linkedin") or doc.get("social_linkedin") or "").strip(),
        "twitter": str(doc.get("twitter") or doc.get("social_twitter") or "").strip(),
        "facebook": str(doc.get("facebook") or doc.get("social_facebook") or "").strip(),
        "instagram": str(doc.get("instagram") or doc.get("social_instagram") or "").strip(),
        "joinedYear": format_joined_year(doc.get("created_at")),
        "isDraft": bool(doc.get("is_draft")),
        "reviewMessage": str(doc.get("verification_message") or "").strip(),
        "verificationProofImageurl": str(doc.get("verification_proof_imageurl") or "").strip(),
        "planName": str(doc.get("plan_name") or "Business").strip() or "Business",
        "planRenewal": str(doc.get("plan_renewal") or "").strip(),
    }


def _is_active_job(doc: dict) -> bool:
    status = str(doc.get("status") or "").strip().lower()
    if doc.get("is_draft") is True or status in {"draft", "closed", "archived", "inactive"}:
        return False
    return True


async def count_active_jobs(company_id: str) -> int:
    total = 0
    async for doc in jobs_collection.find({"company_id": company_id}, {"status": 1, "is_draft": 1}):
        if _is_active_job(doc):
            total += 1
    return total


async def build_open_jobs(company_id: str, limit: int = 8) -> List[dict]:
    job_ids = await _job_ids_for_company(company_id)
    app_counts: Dict[str, int] = {}
    if job_ids:
        pipeline = [
            {"$match": {"job_id": {"$in": job_ids}}},
            {"$group": {"_id": "$job_id", "count": {"$sum": 1}}},
        ]
        async for row in job_applications_collection.aggregate(pipeline):
            app_counts[str(row["_id"])] = int(row["count"])
    rows: List[dict] = []
    async for doc in jobs_collection.find({"company_id": company_id}).sort("updated_at", -1):
        if not _is_active_job(doc):
            continue
        jid = str(doc.get("_id") or "")
        smin, smax = _parse_band(doc)
        tags = [str(doc.get("employment_type") or "Full-time")]
        if doc.get("work_mode"):
            tags.append(str(doc["work_mode"]))
        created = doc.get("created_at")
        posted = relative_time(created) if created else "Recently"
        rows.append(
            {
                "id": jid,
                "title": doc.get("title") or "Role",
                "tags": tags[:3],
                "employmentType": str(doc.get("employment_type") or "Full-time"),
                "location": str(doc.get("location") or doc.get("work_mode") or "Remote"),
                "salaryRange": doc.get("salary_range") or f"${int(smin)}k - ${int(smax)}k",
                "applicants": app_counts.get(jid, 0),
                "posted": posted,
            }
        )
        if len(rows) >= limit:
            break
    return rows


async def _applications_for_company(company_id: str) -> List[dict]:
    job_ids = await _job_ids_for_company(company_id)
    if not job_ids:
        return []
    rows: List[dict] = []
    async for doc in job_applications_collection.find({"job_id": {"$in": job_ids}}):
        rows.append(doc)
    return rows


async def build_application_metrics(apps: List[dict]) -> dict:
    counts = {b: 0 for b in PORTAL_BUCKETS}
    for doc in apps:
        counts[portal_bucket(doc.get("status"))] += 1
    total = sum(counts.values())
    if total == 0:
        segments = [
            {"key": key, "label": BUCKET_LABELS[key], "count": 0, "percent": 0}
            for key in PORTAL_BUCKETS
        ]
        return {"total": 0, "segments": segments}
    segments = []
    for key in PORTAL_BUCKETS:
        count = counts[key]
        segments.append(
            {
                "key": key,
                "label": BUCKET_LABELS[key],
                "count": count,
                "percent": round((count / total) * 100, 1),
            }
        )
    return {"total": total, "segments": segments}


async def build_top_skills(apps: List[dict], company_id: str) -> List[dict]:
    skill_counter: Counter = Counter()
    job_skill_map: Dict[str, List[str]] = {}
    async for job in jobs_collection.find({"company_id": company_id}):
        jid = str(job.get("_id") or "")
        tags = [str(t).strip() for t in (job.get("skills_tags") or job.get("keywords") or []) if str(t).strip()]
        job_skill_map[jid] = tags
    for app in apps:
        jid = str(app.get("job_id") or "")
        for skill in job_skill_map.get(jid, []):
            skill_counter[skill] += 1
    total = sum(skill_counter.values()) or 1
    top = skill_counter.most_common(5)
    return [{"name": name, "percent": round((cnt / total) * 100)} for name, cnt in top]


async def build_recent_applicants(apps: List[dict], limit: int = 5) -> List[dict]:
    apps_sorted = sorted(apps, key=lambda d: str(d.get("created_at") or ""), reverse=True)[:limit]
    job_titles: Dict[str, str] = {}
    for doc in apps_sorted:
        jid = str(doc.get("job_id") or "")
        if jid and jid not in job_titles:
            job = await jobs_collection.find_one({"_id": jid}, {"title": 1})
            job_titles[jid] = str((job or {}).get("title") or "Role")
    rows: List[dict] = []
    for doc in apps_sorted:
        uid = str(doc.get("user_identifier") or doc.get("user_id") or "")
        user = await find_user(uid)
        if user:
            fn = (user.get("first_name") or "").strip()
            ln = (user.get("last_name") or "").strip()
            name = f"{fn} {ln}".strip() or "Applicant"
            imageurl = str(user.get("profile_image_url") or user.get("avatar") or "")
        else:
            name = uid or "Applicant"
            imageurl = ""
        bucket = portal_bucket(doc.get("status"))
        jid = str(doc.get("job_id") or "")
        rows.append(
            {
                "id": str(doc.get("_id") or ""),
                "name": name,
                "imageurl": imageurl,
                "position": str(doc.get("role") or "Role"),
                "appliedFor": job_titles.get(jid, "Role"),
                "status": BUCKET_LABELS.get(bucket, "Pending"),
                "statusKey": bucket,
                "time": relative_time(doc.get("created_at")),
            }
        )
    return rows


async def build_dashboard_payload(user_id: str) -> Optional[dict]:
    from .portal_pipeline import build_talent_pipeline, pipeline_stage

    company_doc = await ensure_company_for_user(user_id)
    if not company_doc:
        return None
    cid = str(company_doc.get("_id") or "")
    open_count = await count_active_jobs(cid)
    open_jobs_list = await build_open_jobs(cid)
    apps = await _applications_for_company(cid)
    hired = sum(
        1
        for doc in apps
        if pipeline_stage(doc.get("status")) in ("hired", "offer")
        or portal_bucket(doc.get("status")) == "shortlisted"
    )
    return {
        "company": await build_company_profile(company_doc, open_count, hired, len(apps)),
        "openJobs": open_jobs_list,
        "applicationMetrics": await build_application_metrics(apps),
        "topSkills": await build_top_skills(apps, cid),
        "recentApplications": await build_recent_applicants(apps),
        "talentPipeline": await build_talent_pipeline(apps),
        "analytics": build_analytics(apps, company_doc, open_count),
    }
