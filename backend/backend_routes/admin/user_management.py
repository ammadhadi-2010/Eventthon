"""
Admin User Management API — list, stats, export CSV, create user, status updates.
"""
from __future__ import annotations

import csv
import io
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from pymongo import DESCENDING

from database import companies_collection, user_collection
from backend_routes.auth.auth import hash_password
from backend_routes.admin.admin import format_user_data
from backend_routes.admin.user_format import _resolve_url

router = APIRouter(tags=["Admin User Management"])

# --- Pydantic ---
class AdminCreateUser(BaseModel):
    email: EmailStr
    mobile: str = Field(..., min_length=6, max_length=32)
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: Optional[str] = Field(None, max_length=80)
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[str] = Field("user", max_length=32)
    status: Optional[str] = Field("unverified", max_length=32)


class AdminUserStatusBody(BaseModel):
    action: str  # suspend | activate | approve_verification | reject_verification
    feedback: Optional[str] = Field(None, max_length=2000)


# --- Helpers ---
def _tab_filter(tab: str) -> Dict[str, Any]:
    t = (tab or "all").lower()
    if t == "all":
        return {}
    if t == "active":
        return {"$or": [{"identity_status": "Active"}, {"admin_status": "approved"}]}
    if t == "verified":
        return {"$or": [{"verified": True}, {"is_verified": True}, {"admin_status": "approved"}]}
    if t == "unverified":
        return {
            "$or": [
                {"identity_status": "Pending Review"},
                {"admin_status": "pending"},
                {"identity_status": "Not Submitted"},
            ]
        }
    if t == "suspended":
        return {
            "$or": [
                {"identity_status": "Suspended"},
                {"account_status": "suspended"},
            ]
        }
    if t == "deleted":
        return {"deleted_at": {"$exists": True, "$ne": None}}
    return {}


def _search_clause(q: str) -> Optional[Dict[str, Any]]:
    text = (q or "").strip()
    if not text:
        return None
    rx = {"$regex": text, "$options": "i"}
    return {
        "$or": [
            {"email": rx},
            {"mobile": rx},
            {"first_name": rx},
            {"last_name": rx},
            {"user_id": rx},
            {"public_id": rx},
        ]
    }


def _merge_filters(tab_filter: Dict[str, Any], search: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not search:
        return tab_filter
    if not tab_filter:
        return search
    return {"$and": [tab_filter, search]}


def _exclude_demo_users() -> Dict[str, Any]:
    """Hide seeded placeholder accounts from admin lists."""
    return {"email": {"$not": {"$regex": r"@example\.com$", "$options": "i"}}}


def _with_demo_filter(filt: Dict[str, Any]) -> Dict[str, Any]:
    demo = _exclude_demo_users()
    if not filt:
        return demo
    return {"$and": [filt, demo]}


async def _find_user_by_lookup(
    mobile: Optional[str] = None,
    email: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Resolve a user by mobile, email, Mongo id, or stable user_id handle."""
    raw_mobile = str(mobile or "").strip()
    if raw_mobile:
        user = await user_collection.find_one({"mobile": raw_mobile})
        if not user:
            user = await user_collection.find_one({"mobile": {"$regex": f"^{raw_mobile}$", "$options": "i"}})
        if user:
            return user

    raw_email = str(email or "").strip().lower()
    if raw_email:
        user = await user_collection.find_one({"email": raw_email})
        if not user:
            user = await user_collection.find_one({"email": {"$regex": f"^{raw_email}$", "$options": "i"}})
        if user:
            return user

    raw_id = str(user_id or "").strip()
    if raw_id:
        try:
            user = await user_collection.find_one({"_id": ObjectId(raw_id)})
            if user:
                return user
        except Exception:
            pass
        user = await user_collection.find_one({"user_id": raw_id})
        if user:
            return user
        user = await user_collection.find_one({"public_id": raw_id})
        if user:
            return user

    return None


def _map_row_admin_status(doc: Dict[str, Any]) -> str:
    if doc.get("deleted_at"):
        return "deleted"
    st = (doc.get("account_status") or "").lower()
    if st == "suspended" or doc.get("identity_status") == "Suspended":
        return "suspended"
    ast = (doc.get("admin_status") or "").lower()
    if ast == "approved":
        return "approved"
    if ast == "pending":
        return "pending"
    if ast == "rejected":
        return "unverified"
    if doc.get("identity_status") == "Active" or doc.get("verified") or doc.get("is_verified"):
        return "approved"
    if doc.get("identity_status") == "Pending Review":
        return "pending"
    return "unverified"


def _rank_key(doc: Dict[str, Any]) -> str:
    r = (doc.get("rank_tier") or doc.get("rank") or "recruit").lower()
    if r in ("frontline", "frontline_recruit", "frontline-recruit"):
        return "frontline"
    if r in ("specialist",):
        return "specialist"
    if r in ("squad", "squad_leader", "squad-leader"):
        return "squad"
    if r in ("recruit",):
        return "recruit"
    return "recruit"


def _relative_last_active(doc: Dict[str, Any]) -> str:
    ts = doc.get("last_active_at") or doc.get("updated_at") or doc.get("created_at")
    if not ts:
        return "—"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            return "—"
    delta = datetime.utcnow() - ts.replace(tzinfo=None) if hasattr(ts, "replace") else datetime.utcnow() - ts
    sec = int(delta.total_seconds())
    if sec < 120:
        return f"{max(1, sec // 60) or 1} min ago"
    if sec < 3600:
        return f"{sec // 60} min ago"
    if sec < 86400:
        return f"{sec // 3600} hr ago"
    return f"{sec // 86400} days ago"


def _presence(doc: Dict[str, Any]) -> str:
    ts = doc.get("last_active_at") or doc.get("updated_at")
    if not ts:
        return "offline"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            return "offline"
    delta = datetime.utcnow() - ts.replace(tzinfo=None)
    if delta < timedelta(minutes=15):
        return "online"
    if delta < timedelta(hours=24):
        return "away"
    return "offline"


def serialize_user_row(doc: Dict[str, Any]) -> Dict[str, Any]:
    oid = str(doc["_id"])
    fn = doc.get("first_name") or ""
    ln = doc.get("last_name") or ""
    name = f"{fn} {ln}".strip() or "User"
    email = doc.get("email") or ""
    handle_src = doc.get("user_id") or (email.split("@")[0] if "@" in email else oid[-6:])
    handle = str(handle_src).replace(" ", "").lower()[:40]
    pid = doc.get("public_id") or f"ETU-{oid[-6:].upper()}"
    created = doc.get("created_at")
    joined = ""
    if hasattr(created, "strftime"):
        joined = created.strftime("%Y-%m-%d")
    elif isinstance(created, str):
        joined = created[:10]

    image_raw = doc.get("profile_image_url") or doc.get("imageurl") or doc.get("avatar") or ""
    imageurl = _resolve_url(str(image_raw).strip()) if image_raw else ""

    return {
        "id": oid,
        "mobile": doc.get("mobile") or "",
        "displayName": name,
        "handle": handle,
        "avatarSeed": name,
        "imageurl": imageurl,
        "publicId": pid,
        "email": email,
        "role": (doc.get("role") or "user").title() if doc.get("role") else "User",
        "rank": _rank_key(doc),
        "adminStatus": _map_row_admin_status(doc),
        "identityStatus": doc.get("identity_status") or "",
        "requestType": "Identity Verification",
        "documentsCount": _count_verification_documents(doc),
        "submittedOn": _submitted_on_label(doc),
        "joined": joined or datetime.utcnow().strftime("%Y-%m-%d"),
        "lastActive": _relative_last_active(doc),
        "presence": _presence(doc),
    }


def _submitted_on_label(doc: Dict[str, Any]) -> str:
    ts = doc.get("verification_submitted_at") or doc.get("created_at")
    if hasattr(ts, "strftime"):
        return ts.strftime("%Y-%m-%d")
    if isinstance(ts, str) and ts.strip():
        return ts[:10]
    return datetime.utcnow().strftime("%Y-%m-%d")


def _count_verification_documents(doc: Dict[str, Any]) -> int:
    count = 0
    for key in ("id_front", "id_back", "banner_url", "banner_image_url", "cv_url"):
        if doc.get(key):
            count += 1
    for list_key in ("portfolio_files", "qualifications", "project_images"):
        value = doc.get(list_key)
        if isinstance(value, list):
            count += len([item for item in value if item])
    projects = doc.get("projects")
    if isinstance(projects, list):
        count += len(
            [
                p
                for p in projects
                if isinstance(p, dict)
                and (p.get("image_url") or p.get("cover") or p.get("thumbnail"))
            ]
        )
    return count


def _serialize_verification_history(items: Any) -> List[Dict[str, Any]]:
    if not isinstance(items, list):
        return []
    history: List[Dict[str, Any]] = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        action = str(item.get("action") or "reviewed").strip().lower()
        note = str(item.get("note") or item.get("feedback") or "").strip()
        actor = str(item.get("actor") or "admin").strip()
        at = item.get("at") or item.get("created_at")
        if hasattr(at, "strftime"):
            at_label = at.strftime("%Y-%m-%d %H:%M")
        elif isinstance(at, str) and at.strip():
            at_label = at.replace("T", " ")[:16]
        else:
            at_label = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        history.append(
            {
                "id": str(item.get("id") or f"vh-{index}"),
                "action": action,
                "actor": actor,
                "note": note,
                "at": at_label,
            }
        )
    return history


def _build_verification_request_payload(user_doc: Dict[str, Any]) -> Dict[str, Any]:
    row = serialize_user_row(user_doc)
    history = _serialize_verification_history(user_doc.get("verification_history"))
    return {
        "request": {
            "id": row["id"],
            "mobile": row["mobile"],
            "requestType": row["requestType"],
            "submittedOn": row["submittedOn"],
            "status": row["identityStatus"] or row["adminStatus"] or "Pending Review",
            "documentsCount": row["documentsCount"],
            "feedback": user_doc.get("verification_feedback") or "",
        },
        "history": history,
        "user": format_user_data(dict(user_doc)),
        "row": row,
    }


# --- Routes ---
@router.get("/users/stats")
async def get_user_management_stats():
    """Aggregate counts for dashboard stat cards."""
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    demo = _exclude_demo_users()
    total = await user_collection.count_documents(demo)
    active = await user_collection.count_documents(
        _with_demo_filter({"$or": [{"identity_status": "Active"}, {"admin_status": "approved"}]})
    )
    verified = await user_collection.count_documents(
        _with_demo_filter({"$or": [{"verified": True}, {"is_verified": True}, {"admin_status": "approved"}]})
    )
    new_month = await user_collection.count_documents(
        _with_demo_filter({"created_at": {"$gte": month_start}})
    )
    suspended = await user_collection.count_documents(
        _with_demo_filter({"$or": [{"identity_status": "Suspended"}, {"account_status": "suspended"}]})
    )

    def fmt(n: int) -> str:
        return f"{n:,}"

    return {
        "total": {"value": fmt(total), "raw": total},
        "active": {"value": fmt(active), "raw": active},
        "verified": {"value": fmt(verified), "raw": verified},
        "newThisMonth": {"value": fmt(new_month), "raw": new_month},
        "suspended": {"value": fmt(suspended), "raw": suspended},
    }


@router.get("/users")
async def list_users(
    tab: str = Query("all"),
    q: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    filt = _with_demo_filter(_merge_filters(_tab_filter(tab), _search_clause(q)))
    total = await user_collection.count_documents(filt)
    skip = (page - 1) * page_size
    cursor = (
        user_collection.find(filt)
        .sort("created_at", DESCENDING)
        .skip(skip)
        .limit(page_size)
    )
    docs = await cursor.to_list(length=page_size)
    rows = []
    for d in docs:
        d["_id"] = str(d["_id"])
        rows.append(serialize_user_row(d))

    return {
        "rows": rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@router.get("/users/detail")
async def get_admin_user_detail(
    mobile: Optional[str] = Query(None, min_length=1, description="User mobile"),
    email: Optional[str] = Query(None, min_length=3, description="User email"),
    user_id: Optional[str] = Query(None, alias="id", min_length=3, description="Mongo or public user id"),
):
    """Full user record for admin profile detail (password stripped)."""
    user = await _find_user_by_lookup(mobile=mobile, email=email, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    safe = format_user_data(dict(user))
    safe.pop("password", None)
    safe["_id"] = str(safe.get("_id", ""))
    row = serialize_user_row(user)
    return {"user": safe, "row": row}


@router.get("/users/{mobile}/verification-request")
async def get_verification_request_detail(mobile: str):
    raw = str(mobile).strip()
    user = await user_collection.find_one({"mobile": raw})
    if not user:
        user = await user_collection.find_one({"mobile": {"$regex": f"^{raw}$", "$options": "i"}})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    payload = _build_verification_request_payload(user)
    payload["user"].pop("password", None)
    payload["user"]["_id"] = str(payload["user"].get("_id", ""))
    return payload


@router.get("/users/export")
async def export_users_csv(
    tab: str = Query("all"),
    q: str = Query(""),
):
    filt = _with_demo_filter(_merge_filters(_tab_filter(tab), _search_clause(q)))
    cursor = user_collection.find(filt).sort("created_at", DESCENDING).limit(5000)
    docs = await cursor.to_list(length=5000)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "Public ID",
            "Name",
            "Handle",
            "Email",
            "Mobile",
            "Role",
            "Rank",
            "Status",
            "Joined",
        ]
    )
    for d in docs:
        row = serialize_user_row(d)
        writer.writerow(
            [
                row["publicId"],
                row["displayName"],
                row["handle"],
                d.get("email", ""),
                d.get("mobile", ""),
                row["role"],
                row["rank"],
                row["adminStatus"],
                row["joined"],
            ]
        )

    data = buffer.getvalue().encode("utf-8")
    filename = f"eventthon-users-{datetime.utcnow().strftime('%Y%m%d-%H%M')}.csv"
    return StreamingResponse(
        iter([data]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/users")
async def admin_create_user(body: AdminCreateUser):
    clean_mobile = str(body.mobile).strip()
    clean_email = str(body.email).lower().strip()
    stable_user_id = clean_mobile.lower()

    existing = await user_collection.find_one({"$or": [{"mobile": clean_mobile}, {"email": clean_email}]})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists with this mobile or email")

    role = (body.role or "user").strip().lower()
    if role not in ("user", "candidate", "employer", "admin"):
        role = "user"
    status = (body.status or "unverified").strip().lower()

    doc = {
        "first_name": body.first_name.strip(),
        "last_name": (body.last_name or "").strip(),
        "email": clean_email,
        "mobile": clean_mobile,
        "user_id": stable_user_id,
        "password": hash_password(body.password.strip()),
        "role": role,
        "identity_status": "Not Submitted",
        "admin_status": None,
        "id_card_verified": False,
        "verified": False,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "wallet_balance": 0.0,
        "skill_score": 0.0,
        "skills": [],
        "language_preference": "en",
        "auth_provider": "manual",
    }
    if status == "active":
        doc.update(
            {
                "identity_status": "Active",
                "admin_status": "approved",
                "verified": True,
                "is_verified": True,
                "account_status": "active",
            }
        )
    elif status == "suspended":
        doc.update(
            {
                "identity_status": "Suspended",
                "account_status": "suspended",
                "verified": False,
                "is_verified": False,
            }
        )
    result = await user_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"status": "success", "id": str(result.inserted_id), "user": serialize_user_row(doc)}


@router.patch("/users/{mobile}/status")
async def admin_update_user_status(mobile: str, body: AdminUserStatusBody):
    raw = str(mobile).strip()
    user = await _find_user_by_lookup(mobile=raw, email=raw, user_id=raw)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    action = (body.action or "").lower().strip()
    updates: Dict[str, Any] = {}

    history_entry: Dict[str, Any] = {"action": action, "actor": "admin", "at": datetime.utcnow()}
    if action == "suspend":
        updates["identity_status"] = "Suspended"
        updates["account_status"] = "suspended"
        updates["verified"] = False
        history_entry["note"] = "Account suspended by admin."
    elif action == "activate":
        updates["identity_status"] = "Active"
        updates["account_status"] = "active"
        updates["verified"] = True
        updates["admin_status"] = "approved"
        updates["is_verified"] = True
        updates["credentials_approved_at"] = datetime.utcnow()
        if not user.get("credentials_last_changed_at"):
            updates["credentials_last_changed_at"] = datetime.utcnow()
        history_entry["note"] = "Account activated by admin."
    elif action == "approve_verification":
        updates["identity_status"] = "Active"
        updates["verified"] = True
        updates["is_verified"] = True
        updates["admin_status"] = "approved"
        updates["account_status"] = "active"
        updates["credentials_approved_at"] = datetime.utcnow()
        if not user.get("credentials_last_changed_at"):
            updates["credentials_last_changed_at"] = datetime.utcnow()
        history_entry["note"] = "Verification approved."
    elif action == "reject_verification":
        updates["identity_status"] = "Rejected"
        updates["verified"] = False
        updates["is_verified"] = False
        updates["admin_status"] = "rejected"
        note = (body.feedback or "").strip()
        if note:
            updates["verification_feedback"] = note
            updates["admin_verification_note"] = note
            history_entry["note"] = note
        else:
            history_entry["note"] = "Verification rejected."
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    updates["updated_at"] = datetime.utcnow()
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": updates, "$push": {"verification_history": history_entry}},
    )
    fresh = await user_collection.find_one({"_id": user["_id"]})
    fresh["_id"] = str(fresh["_id"])
    return {"status": "success", "user": serialize_user_row(fresh)}


@router.delete("/users/{mobile}")
async def admin_delete_user(mobile: str, hard: bool = Query(True)):
    raw = str(mobile).strip()
    user = await _find_user_by_lookup(mobile=raw, email=raw, user_id=raw)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if hard:
        company_id = str(user.get("company_id") or "").strip()
        if company_id:
            if ObjectId.is_valid(company_id):
                await companies_collection.delete_one({"$or": [{"_id": ObjectId(company_id)}, {"_id": company_id}]})
            else:
                await companies_collection.delete_one({"_id": company_id})
        owner_keys = [str(user.get("email") or "").lower().strip(), str(user.get("mobile") or "").strip()]
        owner_keys = [k for k in owner_keys if k]
        if owner_keys:
            await companies_collection.delete_many({"owner_user_id": {"$in": owner_keys}})
        await user_collection.delete_one({"_id": user["_id"]})
        return {"status": "success", "deleted": True, "hard": True}

    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"deleted_at": datetime.utcnow(), "account_status": "deleted", "admin_status": "deleted"}},
    )
    return {"status": "success", "deleted": True, "hard": False}
