from fastapi import APIRouter, Depends

from ..squad_permissions import optional_verify_squads_session, assert_hub_read_access, hydrate_squad_members
from ..squad_shared import squad_collection

router = APIRouter()


@router.get("/{squad_id}/members")
async def get_squad_members(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    squad = await squad_collection.find_one(
        {"_id": squad_id},
        {"members": 1, "settings": 1, "leader_id": 1, "status": 1},
    )
    if not squad:
        return {"status": "error", "message": "Squad not found", "data": []}
    assert_hub_read_access(squad, user)
    members = await hydrate_squad_members(squad.get("members", []))
    return {"status": "success", "data": members}
