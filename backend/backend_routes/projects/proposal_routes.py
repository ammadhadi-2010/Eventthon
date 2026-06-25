"""Submit proposal / bid on a public project."""
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from database import hub_projects_collection

from .chat_context import build_project_chat_context
from .projects_session import assert_actor_id, verify_projects_session
from .serializers import project_oid, serialize_project

router = APIRouter(prefix="/projects", tags=["Project Proposals"])


class SubmitProposalPayload(BaseModel):
    bidder_user_id: str = Field(..., min_length=2, max_length=120)
    bidder_name: str = Field("", max_length=120)
    squad_id: str = Field("", max_length=120)
    package_key: str = Field("standard", max_length=20)
    package_label: str = Field("", max_length=80)
    price: int = Field(0, ge=0)
    delivery_days: int = Field(30, ge=1)
    revisions: int = Field(2, ge=0)
    message: str = Field("", max_length=4000)


@router.post("/{project_id}/proposals")
async def submit_project_proposal(
    project_id: str,
    payload: SubmitProposalPayload,
    user: dict = Depends(verify_projects_session),
):
    try:
        oid = project_oid(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project id")
    doc = await hub_projects_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")

    uid = payload.bidder_user_id.strip()
    await assert_actor_id(uid, user)
    owner_id = (doc.get("owner_user_id") or "").strip()
    if owner_id and owner_id == uid:
        raise HTTPException(status_code=400, detail="You cannot bid on your own project")

    key = (payload.package_key or "standard").strip().lower()
    if key not in ("basic", "standard", "premium"):
        raise HTTPException(status_code=400, detail="Invalid package key")

    now = datetime.utcnow()
    proposal_id = str(ObjectId())
    name = (payload.bidder_name or "Collaborator").strip()
    package_blob = {
        "key": key,
        "label": (payload.package_label or key.title()).strip(),
        "price": int(payload.price or 0),
        "delivery_days": int(payload.delivery_days or 30),
        "revisions": int(payload.revisions or 2),
    }
    proposal = {
        "proposal_id": proposal_id,
        "bidder_user_id": uid,
        "bidder_name": name,
        "squad_id": payload.squad_id.strip(),
        "package": package_blob,
        "message": payload.message.strip(),
        "status": "submitted",
        "created_at": now.isoformat(),
    }

    contributors = list(doc.get("contributors") or [])
    updated_contributors = []
    found = False
    for row in contributors:
        if str(row.get("user_id")) == uid:
            found = True
            updated_contributors.append(
                {
                    **row,
                    "name": name,
                    "proposal_status": "submitted",
                    "selected_package": package_blob,
                    "package_key": key,
                    "proposal_id": proposal_id,
                }
            )
        else:
            updated_contributors.append(row)
    if not found:
        updated_contributors.append(
            {
                "user_id": uid,
                "name": name,
                "avatar": "",
                "role": "collaborator",
                "joined_at": now.isoformat(),
                "proposal_status": "submitted",
                "selected_package": package_blob,
                "package_key": key,
                "proposal_id": proposal_id,
            }
        )

    await hub_projects_collection.update_one(
        {"_id": oid},
        {
            "$set": {"contributors": updated_contributors, "updated_at": now},
            "$push": {"proposals": proposal},
        },
    )
    updated = await hub_projects_collection.find_one({"_id": oid})
    title = doc.get("title") or "Project"
    ctx = build_project_chat_context(
        owner_user_id=owner_id,
        project_id=str(oid),
        project_title=title,
        bidder_user_id=uid,
        proposal_id=proposal_id,
        package_label=package_blob["label"],
        body=payload.message.strip(),
    )
    return {
        "status": "success",
        "proposal_id": proposal_id,
        "project": serialize_project(updated),
        "messages_route": "/messages",
        "chat_context": ctx,
    }
