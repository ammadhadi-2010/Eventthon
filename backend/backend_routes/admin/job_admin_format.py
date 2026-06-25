"""Admin job document serializers (shared by list/detail routes)."""
from __future__ import annotations

from typing import Any, Dict, List


def coalesce_job_fields(doc: dict) -> Dict[str, str]:
    """Map hub job_alerts and jobs collection fields to admin table columns."""
    title = (doc.get("title") or doc.get("job_title") or "Untitled Role").strip()
    company = (
        doc.get("company_name")
        or doc.get("company")
        or doc.get("employer_name")
        or "EventThon Member"
    )
    category = (doc.get("category") or doc.get("job_category") or "General").strip()
    return {
        "title": title or "Untitled Role",
        "company": str(company).strip() or "EventThon Member",
        "category": category or "General",
    }


def job_detail(doc: dict, applicants: int, posted_label: str, admin_status: str) -> dict:
    band = doc.get("compensation_band") if isinstance(doc.get("compensation_band"), dict) else {}
    skills = [str(t).strip() for t in (doc.get("skills_tags") or doc.get("tags") or []) if str(t).strip()]
    reqs = [str(t).strip() for t in (doc.get("application_requirements") or []) if str(t).strip()]
    fields = coalesce_job_fields(doc)
    company = fields["company"]
    jid = str(doc.get("_id") or "")
    return {
        "id": jid,
        "title": fields["title"],
        "company": company,
        "category": fields["category"],
        "location": doc.get("location") or doc.get("work_mode") or "Remote",
        "salary": doc.get("salary_range") or "Competitive",
        "salaryMin": band.get("min"),
        "salaryMax": band.get("max"),
        "posted": posted_label,
        "status": admin_status,
        "applicants": applicants,
        "logoText": (company[:1] or "J").upper(),
        "description": doc.get("description") or doc.get("summary") or "",
        "summary": doc.get("summary") or "",
        "employmentType": doc.get("employment_type") or "",
        "experienceLevel": doc.get("experience_level") or "",
        "workMode": doc.get("work_mode") or "",
        "skillsTags": skills,
        "requirements": reqs,
        "visibility": doc.get("visibility") or "",
        "isApproved": doc.get("is_approved"),
        "createdAt": doc.get("created_at"),
        "updatedAt": doc.get("updated_at"),
        "keywords": list(doc.get("keywords") or []),
    }


def update_payload_to_set(payload: Dict[str, Any]) -> Dict[str, Any]:
    mapping = {
        "title": "title",
        "company_name": "company_name",
        "company": "company_name",
        "category": "category",
        "location": "location",
        "salary_range": "salary_range",
        "salary": "salary_range",
        "employmentType": "employment_type",
        "experienceLevel": "experience_level",
        "workMode": "work_mode",
        "description": "description",
        "employment_type": "employment_type",
        "experience_level": "experience_level",
        "work_mode": "work_mode",
        "company_id": "company_id",
        "companyId": "company_id",
    }
    out: Dict[str, Any] = {}
    for key, field in mapping.items():
        if key in payload and payload[key] is not None:
            out[field] = payload[key]
    return out
