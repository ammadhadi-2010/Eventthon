import os
import uuid
from datetime import datetime
from typing import Any, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from database import gigs_collection, squad_collection
from backend_routes.company_portal.verification_gate import ensure_company_posting_unlocked

from backend_routes.dashboard.carousel_intel_pipeline import apply_carousel_intel

from .gig_serialize import serialize_gig
from .gigs_session import assert_gig_owner, verify_gigs_session

router = APIRouter(prefix="/gigs/create", tags=["Gig Create Flow"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GIG_UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads", "gigs")
os.makedirs(GIG_UPLOAD_DIR, exist_ok=True)


class BasicDetailsPayload(BaseModel):
    seller_user_id: str = Field(..., min_length=3, max_length=120)
    owner_type: str = Field("user")
    squad_id: Optional[str] = None
    squad_name: Optional[str] = Field(None, max_length=200)
    title: str = Field(..., min_length=3, max_length=140)
    category: str = Field("General", max_length=120)
    description: str = Field("", max_length=5000)
    service_type: str = Field("General")
    delivery_time: str = Field("3 Days")
    tags: list[str] = []


class PricingPayload(BaseModel):
    starting_price: float = Field(..., ge=0)
    revisions_included: int = Field(0, ge=0, le=50)
    delivery_days: int = Field(3, ge=1, le=365)
    package_features: str = Field("", max_length=5000)
    addons: list[str] = []
    pricing_tiers: Optional[dict[str, Any]] = None


class PublishPayload(BaseModel):
    visibility: str = Field("public")
    status: str = Field("Published")


def _object_id_or_400(raw_id: str) -> ObjectId:
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    return ObjectId(raw_id)


async def _load_owned_gig(gig_id: str, user: dict) -> dict:
    oid = _object_id_or_400(gig_id)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    await assert_gig_owner(str(gig.get("seller_user_id") or ""), user)
    return gig


async def _save_basic_details(payload: BasicDetailsPayload, user: dict):
    await assert_gig_owner(payload.seller_user_id, user)
    await ensure_company_posting_unlocked(payload.seller_user_id.strip(), feature="gigs")
    clean_owner_type = (payload.owner_type or "user").strip().lower()
    if clean_owner_type not in {"user", "squad"}:
        raise HTTPException(status_code=400, detail="owner_type must be 'user' or 'squad'")
    clean_squad_id = (payload.squad_id or "").strip()
    if clean_owner_type == "squad":
        if not clean_squad_id:
            raise HTTPException(status_code=400, detail="squad_id is required for squad gigs")
        squad = await squad_collection.find_one({"_id": clean_squad_id})
        if not squad:
            raise HTTPException(status_code=404, detail="Squad not found")
        sid = payload.seller_user_id.strip()
        is_member = any((member or {}).get("id") == sid for member in squad.get("members", []))
        is_leader = (squad.get("leader_id") or "").strip() == sid
        if not (is_member or is_leader):
            raise HTTPException(status_code=403, detail="You are not allowed to create gig for this squad")

    now = datetime.utcnow()
    doc = {
        "seller_user_id": payload.seller_user_id.strip(),
        "owner_type": clean_owner_type,
        "owner_id": clean_squad_id if clean_owner_type == "squad" else payload.seller_user_id.strip(),
        "squad_id": clean_squad_id if clean_owner_type == "squad" else None,
        "squad_name": (payload.squad_name or "").strip() if clean_owner_type == "squad" else None,
        "title": payload.title.strip(),
        "category": payload.category.strip() or "General",
        "description": payload.description.strip(),
        "service_type": payload.service_type.strip(),
        "delivery_time": payload.delivery_time.strip(),
        "tags": payload.tags,
        "imageurl": "",
        "starting_price": 0.0,
        "pricing": {"revisions_included": 0, "delivery_days": 3, "package_features": "", "addons": []},
        "gallery": {"images": [], "files": []},
        "visibility": "private",
        "status": "Draft",
        "rating": 0.0,
        "orders": 0,
        "created_at": now,
        "updated_at": now,
    }
    result = await gigs_collection.insert_one(doc)
    created = await gigs_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "step": "basic-details", "gig": serialize_gig(created)}


@router.post("")
@router.post("/")
@router.post("/basic-details")
async def save_basic_details(
    payload: BasicDetailsPayload,
    user: dict = Depends(verify_gigs_session),
):
    return await _save_basic_details(payload, user)


@router.patch("/{gig_id}/pricing")
async def save_pricing(
    gig_id: str,
    payload: PricingPayload,
    user: dict = Depends(verify_gigs_session),
):
    await _load_owned_gig(gig_id, user)
    oid = _object_id_or_400(gig_id)
    pricing_block = {
        "revisions_included": payload.revisions_included,
        "delivery_days": payload.delivery_days,
        "package_features": payload.package_features.strip(),
        "addons": payload.addons,
    }
    if payload.pricing_tiers:
        pricing_block["pricing_tiers"] = payload.pricing_tiers
    await gigs_collection.update_one(
        {"_id": oid},
        {"$set": {"starting_price": payload.starting_price, "pricing": pricing_block, "updated_at": datetime.utcnow()}},
    )
    updated = await gigs_collection.find_one({"_id": oid})
    return {"status": "success", "step": "pricing", "gig": serialize_gig(updated)}


@router.post("/{gig_id}/gallery")
async def upload_gallery_assets(
    gig_id: str,
    user: dict = Depends(verify_gigs_session),
    images: Optional[list[UploadFile]] = File(None),
    files: Optional[list[UploadFile]] = File(None),
):
    await _load_owned_gig(gig_id, user)
    oid = _object_id_or_400(gig_id)
    gig = await gigs_collection.find_one({"_id": oid})
    gallery = gig.get("gallery", {"images": [], "files": []})
    image_urls = list(gallery.get("images", []))
    file_urls = list(gallery.get("files", []))

    if images:
        for image in images:
            ext = os.path.splitext(image.filename or "")[1]
            safe_name = f"{uuid.uuid4().hex}{ext}"
            path = os.path.join(GIG_UPLOAD_DIR, safe_name)
            with open(path, "wb") as out:
                out.write(await image.read())
            image_urls.append(f"/static/uploads/gigs/{safe_name}")

    if files:
        for file_item in files:
            ext = os.path.splitext(file_item.filename or "")[1]
            safe_name = f"{uuid.uuid4().hex}{ext}"
            path = os.path.join(GIG_UPLOAD_DIR, safe_name)
            with open(path, "wb") as out:
                out.write(await file_item.read())
            file_urls.append(f"/static/uploads/gigs/{safe_name}")

    cover = image_urls[0] if image_urls else str(gig.get("imageurl") or "")
    await gigs_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "gallery": {"images": image_urls, "files": file_urls},
                "imageurl": cover,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    updated = await gigs_collection.find_one({"_id": oid})
    return {"status": "success", "step": "gallery", "gig": serialize_gig(updated)}


@router.patch("/{gig_id}/publish")
async def publish_gig(
    gig_id: str,
    payload: PublishPayload,
    user: dict = Depends(verify_gigs_session),
):
    gig = await _load_owned_gig(gig_id, user)
    await ensure_company_posting_unlocked(str(gig.get("seller_user_id") or "").strip(), feature="gigs")
    oid = _object_id_or_400(gig_id)
    intel_patch = await apply_carousel_intel({**gig, "status": payload.status.strip() or "Published"}, "gig")
    await gigs_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "visibility": payload.visibility.strip() or "public",
                "status": payload.status.strip() or "Published",
                "updated_at": datetime.utcnow(),
                "is_carousel_update": bool(intel_patch.get("is_carousel_update")),
                "update_type": intel_patch.get("update_type", "gig"),
                "squad_activity_feed": bool(intel_patch.get("squad_activity_feed")),
            }
        },
    )
    updated = await gigs_collection.find_one({"_id": oid})
    return {"status": "success", "step": "publish", "gig": serialize_gig(updated)}


@router.get("/{gig_id}")
async def get_create_gig_state(gig_id: str, user: dict = Depends(verify_gigs_session)):
    gig = await _load_owned_gig(gig_id, user)
    return {"status": "success", "gig": serialize_gig(gig)}


@router.delete("/{gig_id}")
async def discard_draft(gig_id: str, user: dict = Depends(verify_gigs_session)):
    await _load_owned_gig(gig_id, user)
    oid = _object_id_or_400(gig_id)
    result = await gigs_collection.delete_one({"_id": oid, "status": {"$in": ["Draft", "draft"]}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Draft gig not found")
    return {"status": "success", "message": "Draft discarded"}
