from fastapi import APIRouter, HTTPException, Body
from database import user_collection
from pydantic import BaseModel
from typing import Optional, List

# Mounted in main.py at prefix "/api/admin" — do not add another "/admin" here or routes become /api/admin/admin/...
router = APIRouter(tags=["Admin Controls"])

# --- Models ---
class AdminAction(BaseModel):
    mobile: str
    action: str  # 'approve' or 'reject'

class StatusUpdate(BaseModel):
    mobile: str
    status: str
    id_front: Optional[str] = None
    id_back: Optional[str] = None

from backend_routes.admin.user_format import format_user_data

@router.get("/pending-users")
async def get_pending_users():
    # Wo users jo review ka intezar kar rahay hain
    cursor = user_collection.find({"identity_status": "Pending Review"})
    users = await cursor.to_list(length=100)
    return [format_user_data(u) for u in users]

@router.get("/verified-users")
async def get_verified_users():
    # Wo users jo verified (Active) hain
    cursor = user_collection.find({"identity_status": "Active"})
    users = await cursor.to_list(length=100)
    return [format_user_data(u) for u in users]

@router.post("/verify-user")
async def verify_user(data: AdminAction):
    search_number = str(data.mobile).strip()
    
    # Action ke mutabiq status set karein
    if data.action == "approve":
        new_status = "Active"
        is_verified = True
    else:
        new_status = "Rejected"
        is_verified = False

    admin_status = "approved" if data.action == "approve" else "rejected"
    result = await user_collection.update_one(
        {"mobile": search_number}, # Ensure karein DB mein field 'mobile' hi hy
        {"$set": {
            "identity_status": new_status,
            "status": new_status,
            "verified": is_verified,
            "admin_status": admin_status,
        }}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Operative not found in database")

    return {"status": "success", "message": f"User status updated to {new_status}"}

@router.post("/update-status")
async def update_user_status(data: StatusUpdate):
    # Ye user side se ID submit karne ke liye hy
    search_number = str(data.mobile).strip()
    update_data = {
        "identity_status": data.status,
        "id_front": data.id_front,
        "id_back": data.id_back
    }
    
    # Sync with DB field name 'mobile'
    await user_collection.update_one({"mobile": search_number}, {"$set": update_data})
    return {"status": "success", "message": "Identity Documents Submitted to HQ"}