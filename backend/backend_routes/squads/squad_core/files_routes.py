import os
from datetime import datetime

from fastapi import APIRouter, Depends

from ..squads_session import verify_squads_session
from ..squad_permissions import optional_verify_squads_session, assert_hub_read_access, assert_hub_member
from ..squad_shared import (
    squad_collection,
    get_squad_or_none,
    create_activity_event,
    SQUAD_UPLOAD_DIR,
)

router = APIRouter()


@router.get("/{squad_id}/files")
async def get_squad_files(squad_id: str, user: dict | None = Depends(optional_verify_squads_session)):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found", "data": []}
    assert_hub_read_access(squad, user)
    return {"status": "success", "data": squad.get("files", [])}


@router.delete("/{squad_id}/files/{file_id}")
async def delete_squad_file(
    squad_id: str,
    file_id: str,
    user: dict = Depends(verify_squads_session),
):
    squad = await get_squad_or_none(squad_id)
    if not squad:
        return {"status": "error", "message": "Squad not found"}
    assert_hub_member(squad, user)
    files = squad.get("files", [])
    file_doc = next((f for f in files if f.get("id") == file_id), None)
    if not file_doc:
        return {"status": "error", "message": "File not found"}

    download_url = file_doc.get("download_url") or ""
    file_name = os.path.basename(download_url) if download_url else ""
    if file_name:
        candidate_path = os.path.join(SQUAD_UPLOAD_DIR, file_name)
        if os.path.exists(candidate_path):
            try:
                os.remove(candidate_path)
            except OSError:
                pass

    await squad_collection.update_one(
        {"_id": squad_id},
        {
            "$pull": {"files": {"id": file_id}},
            "$push": {
                "activity_feed": create_activity_event(
                    "file_delete",
                    f"File removed: {file_doc.get('name', 'Unknown file')}",
                )
            },
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    return {"status": "success", "message": "File deleted"}
