from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from database import (
    gig_contact_messages_collection,
    gig_reports_collection,
    gig_saved_collection,
    gigs_collection,
)

from .gigs_session import assert_actor_id, assert_gig_owner, verify_gigs_session

router = APIRouter(prefix="/gigs/actions", tags=["Gig Actions"])


class GigContactPayload(BaseModel):
    gig_id: str = Field(..., min_length=12)
    from_user_id: str = Field(..., min_length=2, max_length=120)
    body: str = Field(..., min_length=12, max_length=4000)


class GigReportPayload(BaseModel):
    gig_id: str = Field(..., min_length=12)
    reporter_user_id: str = Field(..., min_length=2, max_length=120)
    reason: str = Field("", max_length=2000)


class GigSavedPayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    gig_ref_id: str = Field(..., min_length=2, max_length=120)
    title: str = Field(..., min_length=2, max_length=240)
    seller_name: str = Field("Seller", max_length=120)
    price_label: str = Field("", max_length=60)
    location_label: str = Field("Remote", max_length=120)
    posted_label: str = Field("", max_length=80)
    tags: list[str] = Field(default_factory=list)


def _gig_oid(raw: str) -> ObjectId:
    if not ObjectId.is_valid(raw):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    return ObjectId(raw)


def _serialize_contact(doc: dict) -> dict:
    out = dict(doc)
    out["_id"] = str(out["_id"])
    if isinstance(out.get("gig_id"), ObjectId):
        out["gig_id"] = str(out["gig_id"])
    if isinstance(out.get("created_at"), datetime):
        out["created_at"] = out["created_at"].isoformat()
    return out


def _serialize_saved(doc: dict) -> dict:
    out = dict(doc)
    out["_id"] = str(out["_id"])
    if isinstance(out.get("created_at"), datetime):
        out["created_at"] = out["created_at"].isoformat()
    return out
async def list_gig_contact_inbox(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    user: dict = Depends(verify_gigs_session),
):
    """Buyer messages for gigs owned by this seller_user_id (for seller dashboard / inbox UI)."""
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    q = {"seller_user_id": seller_id}
    cursor = (
        gig_contact_messages_collection.find(q)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    messages = [_serialize_contact(doc) async for doc in cursor]
    total = await gig_contact_messages_collection.count_documents(q)
    return {"status": "success", "total": total, "messages": messages}


@router.post("/contact")
async def submit_contact_message(
    payload: GigContactPayload,
    user: dict = Depends(verify_gigs_session),
):
    oid = _gig_oid(payload.gig_id.strip())
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    seller_uid = (gig.get("seller_user_id") or "").strip()
    from_uid = payload.from_user_id.strip()
    await assert_actor_id(from_uid, user)
    if seller_uid and from_uid == seller_uid:
        raise HTTPException(status_code=400, detail="You cannot message yourself on your own gig")

    gig_title = (gig.get("title") or "").strip()
    now = datetime.utcnow()
    doc = {
        "gig_id": oid,
        "gig_title": gig_title,
        "seller_user_id": seller_uid,
        "from_user_id": from_uid,
        "body": payload.body.strip(),
        "status": "new",
        "created_at": now,
        "chat_type": "gig",
        "context_id": str(oid),
        "context_title": gig_title,
    }
    result = await gig_contact_messages_collection.insert_one(doc)
    return {
        "status": "success",
        "id": str(result.inserted_id),
        "messages_route": "/messages",
        "chat_context": {
            "chat_type": "gig",
            "seller_user_id": seller_uid,
            "context_id": str(oid),
            "context_title": gig_title,
            "body": payload.body.strip(),
        },
    }


@router.post("/report")
async def submit_gig_report(
    payload: GigReportPayload,
    user: dict = Depends(verify_gigs_session),
):
    await assert_actor_id(payload.reporter_user_id, user)
    oid = _gig_oid(payload.gig_id.strip())
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    now = datetime.utcnow()
    doc = {
        "gig_id": oid,
        "gig_title": (gig.get("title") or "").strip(),
        "reporter_user_id": payload.reporter_user_id.strip(),
        "seller_user_id": (gig.get("seller_user_id") or "").strip(),
        "reason": (payload.reason or "").strip(),
        "created_at": now,
        "status": "open",
    }
    result = await gig_reports_collection.insert_one(doc)
    return {"status": "success", "id": str(result.inserted_id)}


@router.get("/saved")
async def list_saved_gigs(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user: dict = Depends(verify_gigs_session),
):
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    query = {"seller_user_id": seller_id}
    cursor = gig_saved_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    rows = [_serialize_saved(doc) async for doc in cursor]
    total = await gig_saved_collection.count_documents(query)
    return {"status": "success", "total": total, "saved": rows}


@router.post("/saved")
async def save_gig(payload: GigSavedPayload, user: dict = Depends(verify_gigs_session)):
    seller_id = payload.seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    gig_ref = payload.gig_ref_id.strip()
    query = {"seller_user_id": seller_id, "gig_ref_id": gig_ref}
    exists = await gig_saved_collection.find_one(query)
    if exists:
        return {"status": "success", "saved": _serialize_saved(exists)}

    now = datetime.utcnow()
    doc = {
        "seller_user_id": seller_id,
        "gig_ref_id": gig_ref,
        "title": payload.title.strip(),
        "seller_name": payload.seller_name.strip() or "Seller",
        "price_label": payload.price_label.strip(),
        "location_label": payload.location_label.strip() or "Remote",
        "posted_label": payload.posted_label.strip(),
        "tags": [str(tag).strip() for tag in payload.tags if str(tag).strip()][:6],
        "created_at": now,
    }
    result = await gig_saved_collection.insert_one(doc)
    saved = await gig_saved_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "saved": _serialize_saved(saved)}


@router.delete("/saved")
async def clear_saved_gigs(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    user: dict = Depends(verify_gigs_session),
):
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    result = await gig_saved_collection.delete_many({"seller_user_id": seller_id})
    return {"status": "success", "deleted_count": int(result.deleted_count)}


@router.delete("/saved/{saved_id}")
async def remove_saved_gig(
    saved_id: str,
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    user: dict = Depends(verify_gigs_session),
):
    if not ObjectId.is_valid(saved_id):
        raise HTTPException(status_code=400, detail="Invalid saved gig id")
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    result = await gig_saved_collection.delete_one(
        {"_id": ObjectId(saved_id), "seller_user_id": seller_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved gig not found")
    return {"status": "success", "deleted": True}
