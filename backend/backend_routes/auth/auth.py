from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from datetime import datetime
from bson import ObjectId
import base64
import hashlib
import hmac
import os
from database import companies_collection, user_collection
from pydantic import BaseModel
from typing import Optional
from .company_onboarding import create_pending_company_for_employer, save_company_proof_upload
from .legacy_routes import router as legacy_router
def _company_filter(company_id: str) -> dict:
    cid = str(company_id or "").strip()
    if not cid:
        return {}
    if ObjectId.is_valid(cid):
        return {"$or": [{"_id": ObjectId(cid)}, {"_id": cid}]}
    return {"_id": cid}


router = APIRouter(tags=["Authentication"])

class LoginRequest(BaseModel):
    identifier: str  
    password: str

def normalize_identifier(value: str) -> str:
    return value.strip().lower()

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200000)
    return f"pbkdf2_sha256${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored_password: str) -> bool:
    if not stored_password:
        return False

    if stored_password.startswith("pbkdf2_sha256$"):
        try:
            _, salt_b64, digest_b64 = stored_password.split("$", 2)
            salt = base64.b64decode(salt_b64.encode())
            expected = base64.b64decode(digest_b64.encode())
            calculated = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200000)
            return hmac.compare_digest(calculated, expected)
        except Exception:
            return False

    # Backward compatibility for existing plain-text passwords.
    return hmac.compare_digest(stored_password.strip(), password.strip())

@router.post("/register")
async def register_user(
    first_name: str = Form(..., min_length=1, max_length=120),
    last_name: str = Form(..., min_length=1, max_length=120),
    email: str = Form(..., min_length=3, max_length=180),
    password: str = Form(..., min_length=6, max_length=180),
    mobile: str = Form(..., min_length=3, max_length=40),
    birth_day: Optional[int] = Form(None),
    birth_month: Optional[int] = Form(None),
    birth_year: Optional[int] = Form(None),
    gender: Optional[str] = Form("Male"),
    role: str = Form("candidate"),
    register_as_company: bool = Form(False),
    company_name: str = Form("", max_length=160),
    country: str = Form("", max_length=80),
    tax_id: str = Form("", max_length=160),
    registration_number: str = Form("", max_length=160),
    imageurl: UploadFile | None = File(None),
):
    clean_mobile = str(mobile).strip()
    clean_email = str(email).lower().strip()
    clean_role = "employer" if register_as_company or str(role).lower() == "employer" else "candidate"
    # Keep account identity stable and independent from provider/account changes.
    # Existing app behavior uses mobile heavily, so we mirror that as persistent user_id.
    stable_user_id = clean_mobile.lower()
    
    # Check if exists (Using 'mobile' key for DB)
    existing_user = await user_collection.find_one({
        "$or": [{"mobile": clean_mobile}, {"email": clean_email}]
    })
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this mobile or email!")

    new_user_dict = {
        "first_name": first_name.strip(),
        "last_name": last_name.strip(),
        "email": clean_email,
        "mobile": clean_mobile,
        "user_id": stable_user_id,
        "password": hash_password(password.strip()),
        "birth_day": birth_day,
        "birth_month": birth_month,
        "birth_year": birth_year,
        "gender": gender,
        "role": clean_role,
        "identity_status": "Not Submitted",
        "id_card_verified": False,
        "is_verified": False,
        "niche": None,
        "id_front": None,
        "id_back": None,
        "wallet_balance": 0.0,
        "skill_score": 0.0,
        "skills": [],
        "language_preference": "en",
        "auth_provider": "manual",
        "created_at": datetime.utcnow(),
        "company_id": None,
    }
    
    try:
        result = await user_collection.insert_one(new_user_dict)
        user_oid = result.inserted_id
        company_id = None
        if clean_role == "employer":
            proof_url = await save_company_proof_upload(imageurl)
            company_id = await create_pending_company_for_employer(
                owner_user_id=clean_email,
                company_name=company_name.strip() or f"{first_name.strip()} {last_name.strip()}",
                contact_email=clean_email,
                country=country.strip(),
                registration_number=registration_number.strip(),
                tax_id=tax_id.strip(),
                imageurl=proof_url,
            )
            await user_collection.update_one({"_id": user_oid}, {"$set": {"company_id": company_id}})
        return {"status": "success", "user_id": str(user_oid), "company_id": company_id, "role": clean_role}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

@router.post("/login")
async def login_user(data: LoginRequest):
    val = data.identifier.strip()
    normalized_val = normalize_identifier(val)
    # Backward-compatible lookup:
    # - user_id for stable custom IDs
    # - email for standard login
    # - mobile for legacy records and existing frontend flows
    query = {
        "$or": [
            {"user_id": normalized_val},
            {"email": normalized_val},
            {"mobile": val},
        ]
    }

    user = await user_collection.find_one(query)
    
    if not user:
        print(f"❌ LOGIN FAIL: Account not found for {val}")
        raise HTTPException(status_code=401, detail="Account not found. Please register first.")
    if user.get("deleted_at") or str(user.get("account_status") or "").lower() == "deleted":
        raise HTTPException(status_code=401, detail="This account was deleted by admin. Please register again.")

    db_password = str(user.get("password", ""))
    input_password = str(data.password).strip()

    if not verify_password(input_password, db_password):
        print(f"❌ LOGIN FAIL: Incorrect Password for {val}")
        raise HTTPException(status_code=401, detail="Invalid credentials. Incorrect password.")

    # Auto-backfill stable user_id for old accounts so identity remains consistent.
    if not user.get("user_id"):
        fallback_user_id = str(user.get("mobile") or user.get("email") or "").strip().lower()
        if fallback_user_id:
            await user_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"user_id": fallback_user_id}}
            )
            user["user_id"] = fallback_user_id

    # Auto-migrate old plain-text password to hashed format.
    if not db_password.startswith("pbkdf2_sha256$"):
        await user_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hash_password(input_password)}}
        )
    
    company_id = str(user.get("company_id") or "").strip()
    company_status = ""
    if company_id:
        company = await companies_collection.find_one(_company_filter(company_id), {"status": 1, "is_verified": 1})
        if company:
            company_status = str(company.get("status") or "").strip().lower()
    if not company_status and user.get("role") == "employer":
        by_owner = await companies_collection.find_one(
            {"owner_user_id": {"$in": [str(user.get("email") or "").lower(), str(user.get("mobile") or "")]}},
            {"status": 1},
        )
        if by_owner:
            company_status = str(by_owner.get("status") or "").strip().lower()
            company_id = str(by_owner.get("_id") or company_id)
            await user_collection.update_one({"_id": user["_id"]}, {"$set": {"company_id": company_id}})

    if user.get("role") == "admin":
        print(f"✅ ADMIN LOGIN SUCCESS: {val}")
        return {
            "status": "success",
            "user": {
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "email": user.get("email"),
                "mobile": user.get("mobile"),
                "user_id": user.get("user_id"),
                "wallet_balance": user.get("wallet_balance", 0),
                "role": "admin",
                "rank": "Commander",
                "company_id": company_id,
                "company_status": company_status,
            }
        }
    # NORMAL USER SUCCESS
    print(f"✅ LOGIN SUCCESS: {user.get('email')}")
    return {
        "status": "success",
        "user": {
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user.get("email"),
            "mobile": user.get("mobile"), # ✅ Updated key
            "user_id": user.get("user_id"),
            "wallet_balance": user.get("wallet_balance", 0),
            "role": user.get("role"),
            "rank": user.get("rank", "Recruit"),
            "company_id": company_id,
            "company_status": company_status,
        }
    }

router.include_router(legacy_router)