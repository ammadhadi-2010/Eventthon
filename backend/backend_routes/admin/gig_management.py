"""Admin gig detail — seller profile, proposals, milestones, activity (persisted)."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import gig_proposals_collection, gigs_collection, user_collection
from backend_routes.admin.user_format import format_user_data

router = APIRouter(tags=["Admin Gig Management"])


class AdminProposalStatusBody(BaseModel):
    status: str = Field(..., min_length=4, max_length=40)


class AdminMilestoneStatusBody(BaseModel):
    status: str = Field(..., min_length=4, max_length=40)


def _is_mobile_like(value: str) -> bool:
    return bool(re.fullmatch(r"\+?\d{10,15}", str(value or "").strip()))


def _relative_time(ts: Any) -> str:
    if not ts:
        return "—"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            return ts[:16] if len(ts) > 16 else ts
    if not isinstance(ts, datetime):
        return "—"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    sec = int(delta.total_seconds())
    if sec < 3600:
        return f"{max(1, sec // 60)} min ago"
    if sec < 86400:
        return f"{sec // 3600} hr ago"
    return f"{sec // 86400} days ago"


async def _find_user(identifier: str) -> Optional[Dict[str, Any]]:
    raw = str(identifier or "").strip()
    if not raw:
        return None
    user = await user_collection.find_one({"mobile": raw})
    if user:
        return user
    user = await user_collection.find_one({"user_id": raw})
    if user:
        return user
    return await user_collection.find_one({"mobile": {"$regex": f"^{raw}$", "$options": "i"}})


def _public_profile(user: Optional[Dict[str, Any]], fallback_id: str = "") -> Dict[str, Any]:
    if not user:
        return {"name": "User", "handle": "@user", "avatarUrl": None, "online": False}
    safe = format_user_data(dict(user))
    fn = (safe.get("first_name") or "").strip()
    ln = (safe.get("last_name") or "").strip()
    name = f"{fn} {ln}".strip() or "User"
    handle_src = safe.get("user_id") or (safe.get("email") or "").split("@")[0] or "user"
    handle = f"@{str(handle_src).replace(' ', '').lower()}"
    if _is_mobile_like(handle_src) or _is_mobile_like(fallback_id):
        handle = "@user"
    return {
        "name": name,
        "handle": handle,
        "avatarUrl": safe.get("profile_image_url") or safe.get("imageurl") or safe.get("avatar"),
        "imageurl": safe.get("imageurl") or safe.get("profile_image_url") or safe.get("avatar"),
        "online": True,
    }


async def _append_activity(oid: ObjectId, text: str, kind: str = "update") -> None:
    entry = {
        "id": f"act-{int(datetime.utcnow().timestamp())}",
        "text": text,
        "at": _relative_time(datetime.utcnow()),
        "type": kind,
        "created_at": datetime.utcnow().isoformat(),
    }
    await gigs_collection.update_one(
        {"_id": oid},
        {"$push": {"activity_feed": entry}, "$set": {"updated_at": datetime.utcnow()}},
    )


async def _map_proposal_row(doc: Dict[str, Any]) -> Dict[str, Any]:
    fid = (doc.get("freelancer_user_id") or doc.get("applicant_user_id") or "").strip()
    user = await _find_user(fid) if fid and not fid.startswith("seed-") else None
    if user:
        profile = _public_profile(user, fid)
        name, handle, avatar = profile["name"], profile["handle"], profile["avatarUrl"]
        online = profile["online"]
    else:
        name = doc.get("freelancer_name") or doc.get("client_name") or "Freelancer"
        handle = doc.get("freelancer_handle") or f"@{name.replace(' ', '.').lower()}"
        avatar = doc.get("avatar_url")
        online = False
    return {
        "id": str(doc.get("_id") or ""),
        "freelancerName": name,
        "handle": handle,
        "avatarUrl": avatar,
        "amount": doc.get("bid_amount") or doc.get("amount") or "$0",
        "deliveryTime": doc.get("delivery_time") or doc.get("eta") or "7 Days",
        "status": doc.get("status") or "Pending",
        "coverLetter": doc.get("cover_letter") or doc.get("message") or "",
        "skills": doc.get("skills") or [],
        "attachments": doc.get("attachments") or [],
        "online": online,
    }


async def _list_inbound_proposals(gig: Dict[str, Any], oid: ObjectId) -> List[Dict[str, Any]]:
    query = {"$or": [{"gig_id": str(oid)}, {"gig_id": oid}]}
    docs = await gig_proposals_collection.find(query).sort("created_at", -1).limit(50).to_list(length=50)
    rows = []
    for doc in docs:
        rows.append(await _map_proposal_row(doc))
    return rows


def _milestones_from_gig(gig: Dict[str, Any]) -> List[Dict[str, Any]]:
    milestones = gig.get("milestones")
    return milestones if isinstance(milestones, list) else []


def _activities_from_gig(gig: Dict[str, Any]) -> List[Dict[str, Any]]:
    activities = gig.get("activity_feed") or gig.get("activities")
    return activities if isinstance(activities, list) else []


@router.get("/gigs/{gig_id}/admin-detail")
async def get_admin_gig_detail(gig_id: str):
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    oid = ObjectId(gig_id)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    seller_id = (gig.get("seller_user_id") or "").strip()
    seller_user = await _find_user(seller_id)
    seller = _public_profile(seller_user, seller_id)

    proposals = await _list_inbound_proposals(gig, oid)
    milestones = _milestones_from_gig(gig)
    activities = _activities_from_gig(gig)

    gig_out = dict(gig)
    gig_out["_id"] = str(gig_out["_id"])
    gig_out.pop("seller_mobile", None)
    gig_out["seller"] = seller
    gig_out["proposals"] = proposals
    gig_out["milestones"] = milestones
    gig_out["activities"] = activities
    return {"status": "success", "gig": gig_out}


@router.patch("/gigs/{gig_id}/proposals/{proposal_id}/status")
async def admin_update_proposal_status(gig_id: str, proposal_id: str, body: AdminProposalStatusBody):
    if not ObjectId.is_valid(gig_id) or not ObjectId.is_valid(proposal_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    oid = ObjectId(gig_id)
    pid = ObjectId(proposal_id)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    status = body.status.strip().title()
    allowed = {"Pending", "Accepted", "Rejected", "Shortlisted"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")

    prop = await gig_proposals_collection.find_one({"_id": pid, "gig_id": str(oid)})
    if not prop:
        prop = await gig_proposals_collection.find_one({"_id": pid, "gig_id": oid})
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    await gig_proposals_collection.update_one(
        {"_id": pid},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
    )
    name = prop.get("freelancer_name") or "Freelancer"
    await _append_activity(oid, f'Proposal from {name} marked as {status}', "proposal")

    fresh = await gig_proposals_collection.find_one({"_id": pid})
    return {"status": "success", "proposal": await _map_proposal_row(fresh)}


@router.patch("/gigs/{gig_id}/milestones/{milestone_id}/status")
async def admin_update_milestone_status(gig_id: str, milestone_id: str, body: AdminMilestoneStatusBody):
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(status_code=400, detail="Invalid gig id")
    oid = ObjectId(gig_id)
    gig = await gigs_collection.find_one({"_id": oid})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    milestones = _milestones_from_gig(gig)
    status = body.status.strip()
    found = False
    for item in milestones:
        if str(item.get("id")) == milestone_id:
            item["status"] = status
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Milestone not found")

    await gigs_collection.update_one(
        {"_id": oid},
        {"$set": {"milestones": milestones, "updated_at": datetime.utcnow()}},
    )
    await _append_activity(oid, f'Milestone "{milestone_id}" updated to {status}', "milestone")
    return {"status": "success", "milestones": milestones}
