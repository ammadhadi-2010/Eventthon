"""Job listing cards and in-memory filter helpers for hub search."""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from bson import ObjectId

from database import jobs_collection

EXP_LEVELS = ("Entry Level", "Mid Level", "Senior Level", "Lead / Principal")
WORK_MODES = ("Remote", "Hybrid", "On-site")


def _parse_band(doc: dict) -> tuple[int, int]:
    band = doc.get("compensation_band") if isinstance(doc.get("compensation_band"), dict) else {}
    smin = int(band.get("min") or 0)
    smax = int(band.get("max") or 0)
    if smin and smax:
        return smin, smax
    label = str(doc.get("salary_range") or "")
    match = re.search(r"(\d+)\s*k?\s*[-–]\s*\$?\s*(\d+)", label, re.I)
    if match:
        return int(match.group(1)), int(match.group(2))
    return 60, 120


def _work_mode(doc: dict) -> str:
    if doc.get("work_mode"):
        return str(doc["work_mode"])
    if doc.get("remote") is True:
        return "Remote"
    loc = str(doc.get("location") or "").lower()
    if "hybrid" in loc:
        return "Hybrid"
    if doc.get("remote") is False:
        return "On-site"
    return "Remote"


def job_doc_to_listing_card(doc: dict) -> dict:
    tags = [str(t).strip() for t in (doc.get("skills_tags") or doc.get("tags") or []) if str(t).strip()][:10]
    company = doc.get("company_name") or "Company"
    imageurl = str(doc.get("company_imageurl") or doc.get("imageurl") or "").strip()
    jid = str(doc.get("_id") or "")
    smin, smax = _parse_band(doc)
    return {
        "id": jid,
        "jobId": jid,
        "role": doc.get("title") or "Role",
        "company": company,
        "companyId": str(doc.get("company_id") or ""),
        "imageurl": imageurl,
        "salary": doc.get("salary_range") or f"${smin}k - ${smax}k",
        "salaryMin": smin,
        "salaryMax": smax,
        "type": doc.get("employment_type") or "Full-time",
        "location": doc.get("location") or _work_mode(doc),
        "workMode": _work_mode(doc),
        "experienceLevel": doc.get("experience_level") or "Mid Level",
        "category": doc.get("category") or "General",
        "posted": doc.get("posted_ago") or "Recently",
        "logoText": (company[:1] or "J").upper(),
        "logoClass": (doc.get("logo_class") or company.split()[0].lower())[:12],
        "tags": tags,
        "remote": bool(doc.get("remote", True)),
        "description": doc.get("description") or doc.get("summary") or "",
        "requirements": [
            str(t).strip()
            for t in (doc.get("application_requirements") or doc.get("skills_tags") or [])
            if str(t).strip()
        ][:12],
    }


def public_listings_query() -> dict:
    """Hub browse: public, approved listings (no admin gate in development)."""
    return {
        "visibility": {"$ne": "private"},
        "$nor": [
            {"status": {"$in": ["closed", "archived", "draft", "pending", "inactive"]}},
            {"is_approved": False},
        ],
    }


async def fetch_public_job_docs(limit: int = 80) -> List[dict]:
    rows: List[dict] = []
    cursor = jobs_collection.find(public_listings_query()).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        rows.append(doc)
    return rows


def job_matches_filters(
    doc: dict,
    q: str = "",
    category: str = "",
    experience_level: str = "",
    job_type: str = "",
    location: str = "",
    work_mode: str = "",
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
) -> bool:
    card = job_doc_to_listing_card(doc)
    needle = q.strip().lower()
    if needle:
        blob = " ".join(
            [card["role"], card["company"], card["category"], " ".join(card["tags"])]
        ).lower()
        if needle not in blob:
            return False
    if category and category.strip().lower() not in ("", "any", "all"):
        cat_l = category.strip().lower()
        blob = f"{card['category']} {card['role']} {' '.join(card['tags'])}".lower()
        if cat_l not in blob and not any(
            part in blob for part in cat_l.replace("&", " ").split() if len(part) > 2
        ):
            return False
    if experience_level and experience_level != "Any":
        exp_l = experience_level.strip().lower()
        job_exp = str(card.get("experienceLevel") or doc.get("experience_level") or "").lower()
        if exp_l in job_exp or job_exp in exp_l:
            pass
        elif exp_l == "fresher" and any(k in job_exp for k in ("fresher", "entry", "intern", "0-2")):
            pass
        elif "entry" in exp_l and "entry" in job_exp:
            pass
        elif "mid" in exp_l and "mid" in job_exp:
            pass
        elif "senior" in exp_l and "senior" in job_exp:
            pass
        elif ("lead" in exp_l or "principal" in exp_l) and ("lead" in job_exp or "principal" in job_exp):
            pass
        elif not job_exp:
            pass
        else:
            return False
    if job_type and job_type.strip().lower() not in ("", "any"):
        if job_type.lower() not in (card.get("type") or "").lower():
            return False
    loc_filter = (location or work_mode or "").strip()
    if loc_filter and loc_filter.lower() not in ("", "any"):
        loc_blob = f"{card['location']} {card['workMode']}".lower()
        if loc_filter.lower() not in loc_blob:
            return False
    if salary_min is not None or salary_max is not None:
        jmin, jmax = card["salaryMin"], card["salaryMax"]
        lo = salary_min if salary_min is not None else 0
        hi = salary_max if salary_max is not None else 9999
        if jmax < lo or jmin > hi:
            return False
    return True


async def find_job_doc(job_id: str) -> Optional[dict]:
    jid = str(job_id or "").strip()
    if not jid:
        return None
    if ObjectId.is_valid(jid):
        doc = await jobs_collection.find_one({"_id": ObjectId(jid)})
        if doc:
            return doc
    return await jobs_collection.find_one({"_id": jid})
