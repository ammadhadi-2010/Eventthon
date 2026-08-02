"""API marketplace surface: GET /api/squads and POST /api/squads/create (mount at /api)."""
from fastapi import APIRouter, Depends, Query

from .squad_core import create_squad_impl, fetch_squads_hub
from .squad_shared import CreateSquadPayload
from .squads_session import assert_actor_id, verify_squads_session
from .squad_permissions import optional_verify_squads_session

router = APIRouter(prefix="/squads", tags=["Squads API"])


@router.get("")
async def list_squads_api(
    scope: str = Query("all"),
    user: dict | None = Depends(optional_verify_squads_session),
):
    """Squad directory — GET /api/squads?scope=all|mine|invites"""
    return await fetch_squads_hub(user, scope=scope)


@router.get("/invites/mine")
async def list_my_invites_api(user: dict = Depends(verify_squads_session)):
    payload = await fetch_squads_hub(user, scope="invites")
    return {
        "status": "success",
        "invites": payload["squads"],
        "total": payload["total"],
    }


@router.post("/create")
async def create_squad_api(
    payload: CreateSquadPayload,
    user: dict = Depends(verify_squads_session),
):
    """Create squad wizard — POST /api/squads/create."""
    leader_id = (payload.leader_id or "").strip()
    if leader_id:
        await assert_actor_id(leader_id, user)
    return await create_squad_impl(payload, user)
