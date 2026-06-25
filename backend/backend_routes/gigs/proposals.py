from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from database import gig_proposals_collection, gigs_collection

from .gigs_session import assert_actor_id, assert_gig_owner, verify_gigs_session

router = APIRouter(prefix="/gigs/actions", tags=["Gig Proposals"])


class ProposalStatusPayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    status: str = Field(..., min_length=4, max_length=40)


class GigProposalPayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    job_title: str = Field(..., min_length=2, max_length=240)
    client_name: str = Field(..., min_length=2, max_length=120)
    bid_amount: str = Field(..., min_length=2, max_length=40)
    status: str = Field("Pending", max_length=40)
    date_label: str = Field("", max_length=80)


class InboundGigProposalPayload(BaseModel):
    gig_id: str = Field(..., min_length=12, max_length=120)
    freelancer_user_id: str = Field(..., min_length=2, max_length=120)
    freelancer_name: str = Field(..., min_length=2, max_length=120)
    bid_amount: str = Field(..., min_length=2, max_length=40)
    delivery_time: str = Field("7 Days", max_length=40)
    cover_letter: str = Field("", max_length=4000)
    skills: list[str] = Field(default_factory=list)


def _serialize_proposal(doc: dict) -> dict:
    out = dict(doc)
    out["_id"] = str(out["_id"])
    if isinstance(out.get("created_at"), datetime):
        out["created_at"] = out["created_at"].isoformat()
    if isinstance(out.get("gig_id"), ObjectId):
        out["gig_id"] = str(out["gig_id"])
    return out


def _outbound_query(seller_user_id: str, status: str = "") -> dict:
    seller_id = seller_user_id.strip()
    query: dict = {
        "seller_user_id": seller_id,
        "$or": [
            {"proposal_kind": "outbound"},
            {"proposal_kind": {"$exists": False}, "gig_id": {"$exists": False}},
        ],
    }
    if status.strip():
        query["status"] = status.strip().title()
    return query


@router.get("/proposals")
async def list_proposals(
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    status: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user: dict = Depends(verify_gigs_session),
):
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    query = _outbound_query(seller_id, status)
    cursor = gig_proposals_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    rows = [_serialize_proposal(doc) async for doc in cursor]
    total = await gig_proposals_collection.count_documents(query)
    return {"status": "success", "total": total, "proposals": rows}


@router.post("/proposals")
async def create_proposal(
    payload: GigProposalPayload,
    user: dict = Depends(verify_gigs_session),
):
    seller_id = payload.seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    now = datetime.utcnow()
    doc = {
        "seller_user_id": seller_id,
        "proposal_kind": "outbound",
        "job_title": payload.job_title.strip(),
        "client_name": payload.client_name.strip(),
        "bid_amount": payload.bid_amount.strip(),
        "status": payload.status.strip().title() or "Pending",
        "date_label": payload.date_label.strip() or now.strftime("%b %d, %Y"),
        "created_at": now,
    }
    result = await gig_proposals_collection.insert_one(doc)
    saved = await gig_proposals_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "proposal": _serialize_proposal(saved)}


@router.post("/proposals/inbound")
async def create_inbound_gig_proposal(
    payload: InboundGigProposalPayload,
    user: dict = Depends(verify_gigs_session),
):
    freelancer_id = payload.freelancer_user_id.strip()
    await assert_actor_id(freelancer_id, user)
    gig_id = payload.gig_id.strip()
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")

    gig = await gigs_collection.find_one({"_id": ObjectId(gig_id)})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    seller_uid = str(gig.get("seller_user_id") or "").strip()
    if seller_uid and seller_uid == freelancer_id:
        raise HTTPException(status_code=400, detail="You cannot submit a proposal on your own gig")

    now = datetime.utcnow()
    doc = {
        "gig_id": gig_id,
        "proposal_kind": "inbound",
        "freelancer_user_id": freelancer_id,
        "freelancer_name": payload.freelancer_name.strip(),
        "bid_amount": payload.bid_amount.strip(),
        "delivery_time": payload.delivery_time.strip() or "7 Days",
        "cover_letter": payload.cover_letter.strip(),
        "skills": [str(skill).strip() for skill in payload.skills if str(skill).strip()][:12],
        "status": "Pending",
        "created_at": now,
        "updated_at": now,
    }
    result = await gig_proposals_collection.insert_one(doc)
    saved = await gig_proposals_collection.find_one({"_id": result.inserted_id})
    return {"status": "success", "proposal": _serialize_proposal(saved)}


@router.patch("/proposals/{proposal_id}/status")
async def update_proposal_status(
    proposal_id: str,
    payload: ProposalStatusPayload,
    user: dict = Depends(verify_gigs_session),
):
    if not ObjectId.is_valid(proposal_id):
        raise HTTPException(status_code=400, detail="Invalid proposal id")

    seller_id = payload.seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    next_status = payload.status.strip().title()
    if next_status not in {"Pending", "Accepted", "Rejected"}:
        raise HTTPException(status_code=400, detail="status must be one of: Pending, Accepted, Rejected")

    result = await gig_proposals_collection.update_one(
        {
            "_id": ObjectId(proposal_id),
            "seller_user_id": seller_id,
            "proposal_kind": "outbound",
        },
        {"$set": {"status": next_status, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"status": "success", "proposal_id": proposal_id, "next_status": next_status}


@router.delete("/proposals/{proposal_id}")
async def delete_proposal(
    proposal_id: str,
    seller_user_id: str = Query(..., min_length=2, max_length=120),
    user: dict = Depends(verify_gigs_session),
):
    if not ObjectId.is_valid(proposal_id):
        raise HTTPException(status_code=400, detail="Invalid proposal id")
    seller_id = seller_user_id.strip()
    await assert_gig_owner(seller_id, user)
    result = await gig_proposals_collection.delete_one(
        {"_id": ObjectId(proposal_id), "seller_user_id": seller_id, "proposal_kind": "outbound"}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"status": "success", "deleted": True, "proposal_id": proposal_id}
