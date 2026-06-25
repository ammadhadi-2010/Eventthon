"""API marketplace surface: GET /api/squads and POST /api/squads/create (mount at /api)."""
from fastapi import APIRouter, Depends

from .squad_core import create_squad_impl, fetch_all_squads
from .squad_shared import CreateSquadPayload
from .squads_session import assert_actor_id, verify_squads_session

router = APIRouter(prefix="/squads", tags=["Squads API"])


@router.get("")
async def list_squads_api():
    """Public squad directory — GET /api/squads when router is mounted with prefix /api."""
    rows = await fetch_all_squads()
    return {"status": "success", "total": len(rows), "squads": rows}


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
