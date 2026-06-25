from __future__ import annotations

import base64
import hashlib
import hmac
import os

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr

from database import user_collection

router = APIRouter(tags=["Authentication Legacy"])


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200000)
    return f"pbkdf2_sha256${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


@router.post("/verify-admin-otp")
async def verify_admin_otp(mobile: str = Query(...), otp: str = Query(...)):
    expected_otp = os.getenv("ADMIN_OTP")
    if not expected_otp:
        raise HTTPException(status_code=503, detail="Admin OTP is not configured.")
    if hmac.compare_digest(otp.strip(), expected_otp.strip()):
        user = await user_collection.find_one({"mobile": mobile.strip()})
        if user and user.get("role") == "admin":
            return {"status": "success", "role": "admin", "user_data": {"mobile": mobile, "role": "admin"}}
        raise HTTPException(status_code=403, detail="Not authorized as admin.")
    raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")


@router.get("/get-user/{mobile}")
async def get_user(mobile: str):
    user = await user_collection.find_one({"mobile": mobile.strip()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user["_id"] = str(user["_id"])
    return user


@router.get("/get-user-by-email/{email}")
async def get_user_by_email(email: str):
    user = await user_collection.find_one({"email": email.lower().strip()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user["_id"] = str(user["_id"])
    return user


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    clean_email = data.email.lower().strip()
    user = await user_collection.find_one({"email": clean_email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found in our network.")
    await user_collection.update_one(
        {"email": clean_email},
        {"$set": {"password": hash_password(data.new_password.strip())}},
    )
    return {"status": "success", "message": "Password updated successfully"}
