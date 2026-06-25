"""Admin companies — CRUD, metrics, widgets."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from .company_status import apply_company_status_action

from database import companies_collection
from .company_format import company_db_from_body, company_to_row
from .company_queries import company_metrics, list_company_rows, open_jobs_count_map, widget_rows

router = APIRouter(tags=["Admin Company Management"])


class CompanyCreateBody(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    imageurl: str = Field("", max_length=500)
    industry: str = Field("", max_length=120)
    website: str = Field("", max_length=240)
    size: str = Field("", max_length=80)
    location: str = Field("", max_length=160)
    status: str = Field("pending", max_length=32)
    owner_user_id: str = Field("", max_length=120)
    description: str = Field("", max_length=500)
    followers: int = Field(0, ge=0)
    contact_email: str = Field("", max_length=180)
    country: str = Field("", max_length=80)
    registration_number: str = Field("", max_length=160)
    tax_id: str = Field("", max_length=160)
    verification_proof_imageurl: str = Field("", max_length=500)


class CompanyUpdateBody(BaseModel):
    name: Optional[str] = None
    imageurl: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    country: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    verification_proof_imageurl: Optional[str] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = None


async def _find_company(company_id: str) -> Optional[dict]:
    cid = str(company_id or "").strip()
    if not cid:
        return None
    if ObjectId.is_valid(cid):
        doc = await companies_collection.find_one({"_id": ObjectId(cid)})
        if doc:
            return doc
    return await companies_collection.find_one({"_id": cid})


@router.get("/companies/metrics")
async def get_company_metrics():
    return {"status": "success", "metrics": await company_metrics()}


@router.get("/companies/recent")
async def recent_companies(limit: int = Query(5, ge=1, le=20)):
    rows = await widget_rows(limit, pending_only=False)
    return {"status": "success", "data": rows}


@router.get("/companies/verification-requests")
async def verification_requests(limit: int = Query(5, ge=1, le=50)):
    rows = await widget_rows(limit, pending_only=True)
    return {"status": "success", "data": rows, "total": len(rows)}


@router.get("/companies")
async def list_companies(
    q: str = Query("", max_length=120),
    status: str = Query("", max_length=32),
    industry: str = Query("", max_length=80),
    size: str = Query("", max_length=40),
):
    rows = await list_company_rows(status=status, industry=industry, size=size, q=q)
    return {"status": "success", "data": rows, "total": len(rows)}


@router.post("/companies")
async def create_company(body: CompanyCreateBody):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Company name is required")
    now = datetime.utcnow().isoformat()
    fields = company_db_from_body(body.model_dump())
    doc = {
        **fields,
        "description": body.description.strip(),
        "followers": int(body.followers or 0),
        "owner_user_id": body.owner_user_id.strip() or None,
        "verification_proof_imageurl": body.verification_proof_imageurl.strip(),
        "verification_submitted_at": now,
        "verification_message": "Your company profile is successfully submitted and is under review by our Admin team. Features will unlock shortly upon verification.",
        "is_admin_seed": not bool(body.owner_user_id.strip()),
        "is_claimed": False,
        "created_at": now,
        "updated_at": now,
    }
    result = await companies_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"status": "success", "data": company_to_row(doc, 0)}


@router.get("/companies/{company_id}")
async def get_company(company_id: str):
    doc = await _find_company(company_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Company not found")
    job_map = await open_jobs_count_map()
    cid = str(doc.get("_id") or "")
    return {"status": "success", "data": company_to_row(doc, job_map.get(cid, 0))}


@router.patch("/companies/{company_id}")
async def update_company(company_id: str, body: CompanyUpdateBody):
    doc = await _find_company(company_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Company not found")
    patch = {}
    data = body.model_dump(exclude_unset=True)
    if "name" in data:
        patch["name"] = data["name"].strip()
    for key in (
        "industry",
        "website",
        "size",
        "location",
        "status",
        "contact_email",
        "country",
        "registration_number",
        "tax_id",
        "verification_proof_imageurl",
    ):
        if key in data:
            patch[key] = str(data[key] or "").strip()
    if "imageurl" in data:
        url = str(data["imageurl"] or "").strip()
        patch["logo_url"] = url
        patch["imageurl"] = url
    if "is_verified" in data:
        patch["is_verified"] = bool(data["is_verified"])
        if data["is_verified"]:
            patch["status"] = "active"
    if "status" in data and "is_verified" not in data:
        patch["status"] = str(data["status"]).lower()
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    patch["updated_at"] = datetime.utcnow().isoformat()
    await companies_collection.update_one({"_id": doc["_id"]}, {"$set": patch})
    updated = await _find_company(company_id)
    job_map = await open_jobs_count_map()
    cid = str(updated.get("_id") or "")
    return {"status": "success", "data": company_to_row(updated, job_map.get(cid, 0))}


@router.delete("/companies/{company_id}")
async def delete_company(company_id: str):
    doc = await _find_company(company_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Company not found")
    await companies_collection.delete_one({"_id": doc["_id"]})
    return {"status": "success", "deleted": True, "company_id": company_id}


class CompanyStatusBody(BaseModel):
    action: str = Field(..., min_length=2, max_length=40)


@router.patch("/company/{company_id}/status")
async def patch_company_status_route(company_id: str, body: CompanyStatusBody):
    doc = await _find_company(company_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Company not found")
    updated = await apply_company_status_action(doc, body.action.strip().lower())
    job_map = await open_jobs_count_map()
    cid = str(updated.get("_id") or "")
    return {"status": "success", "data": company_to_row(updated, job_map.get(cid, 0))}


@router.delete("/company/{company_id}")
async def delete_company_route(company_id: str):
    return await delete_company(company_id)
