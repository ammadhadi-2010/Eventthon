"""Hire Squad — creates a hire inquiry thread with the squad leader."""
from __future__ import annotations

from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException

from database import job_contact_messages_collection
from backend_routes.alerts.alert_factory import push_alert

from ..squads_session import assert_actor_id, verify_squads_session
from ..squad_permissions import resolve_session_user_id
from ..squad_shared import HireSquadPayload, get_squad_or_none, create_activity_event, squad_collection

router = APIRouter()


@router.post("/{squad_id}/hire")
async def hire_squad(
    squad_id: str,
    payload: HireSquadPayload,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")

    buyer_id = (payload.buyer_user_id or resolve_session_user_id(user)).strip()
    if not buyer_id:
        raise HTTPException(status_code=400, detail="buyer_user_id required")
    await assert_actor_id(buyer_id, user)

    leader_id = str(squad.get("leader_id") or "").strip()
    if not leader_id:
        raise HTTPException(status_code=400, detail="Squad has no leader to hire")
    if leader_id.lower() == buyer_id.lower():
        raise HTTPException(status_code=400, detail="You cannot hire your own squad")

    settings = squad.get("settings") if isinstance(squad.get("settings"), dict) else {}
    if settings.get("publicListing") is False:
        raise HTTPException(
            status_code=403,
            detail="This squad is private. Enable Public listing before hiring.",
        )

    squad_name = str(squad.get("squad_name") or "Squad").strip()
    note = (payload.message or "").strip() or f"I'd like to hire {squad_name}."
    budget = (payload.budget or "").strip()
    timeline = (payload.timeline or "").strip()
    extras = []
    if budget:
        extras.append(f"Budget: {budget}")
    if timeline:
        extras.append(f"Timeline: {timeline}")
    body = note if not extras else f"{note}\n\n" + " · ".join(extras)

    context_id = f"squad-hire-{squad_id}"
    now = datetime.utcnow()
    doc = {
        "job_id": context_id,
        "chat_type": "job",
        "chat_tag": "Squad Hire",
        "channel": "squad_hire",
        "context_id": context_id,
        "context_title": f"Hire {squad_name}",
        "squad_id": str(squad_id),
        "seller_user_id": leader_id,
        "from_user_id": buyer_id,
        "candidate_user_id": buyer_id,
        "body": body,
        "delivery_status": "sent",
        "status": "new",
        "created_at": now,
        "updated_at": now,
        "attachments": [],
    }
    result = await job_contact_messages_collection.insert_one(doc)
    msg_id = str(result.inserted_id)

    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$inc": {"times_hired": 1},
            "$set": {"updated_at": now},
            "$push": {
                "activity_feed": create_activity_event(
                    "hire_request",
                    f"New hire inquiry for {squad_name}",
                    buyer_id,
                ),
                "hire_requests": {
                    "id": f"hire-{uuid.uuid4().hex[:8]}",
                    "buyer_user_id": buyer_id,
                    "message": body,
                    "budget": budget or None,
                    "timeline": timeline or None,
                    "message_id": msg_id,
                    "created_at": now.isoformat(),
                    "status": "new",
                },
            },
        },
    )

    await push_alert(
        recipient_identifier=leader_id,
        category="squad",
        title=f"Hire request: {squad_name}",
        message=body[:180],
        details="Open Messages to reply to this hire inquiry.",
        actor_name=buyer_id,
        action_label="Open Messages",
        action_url="/messages",
    )

    return {
        "status": "success",
        "message": "Hire request sent to the squad leader.",
        "data": {
            "message_id": msg_id,
            "context_id": context_id,
            "leader_user_id": leader_id,
            "squad_id": str(squad_id),
            "squad_name": squad_name,
            "messages_route": "/messages",
        },
    }
