from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field, field_validator

from database import user_collection

router = APIRouter(tags=["Authentication Legacy"])

OTP_TTL_MINUTES = 10


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("otp")
    @classmethod
    def validate_otp_digits(cls, value: str) -> str:
        cleaned = str(value or "").strip()
        if not cleaned.isdigit() or len(cleaned) != 6:
            raise ValueError("OTP must be a 6-digit code.")
        return cleaned


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=8, max_length=128)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200000)
    return f"pbkdf2_sha256${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def _send_otp_email_sync(to_email: str, otp_code: str) -> None:
    """Send OTP via Gmail SMTP using credentials from backend/.env."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_user or not smtp_password:
        raise RuntimeError("Email service is not configured in server.")

    msg = MIMEMultipart()
    msg["From"] = f"EventThon Network <{smtp_user}>"
    msg["To"] = to_email
    msg["Subject"] = f"{otp_code} is your EventThon Password Reset Verification Code"

    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #0f172a;">EventThon Network — Password Reset</h2>
      <p>We received a request to reset your password. Use this verification code:</p>
      <p style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb;">{otp_code}</p>
      <p style="color: #64748b;">This code expires in {OTP_TTL_MINUTES} minutes. If you did not request this, ignore this email.</p>
      <p>— Team EventThon Network</p>
    </div>
    """
    msg.attach(MIMEText(body, "html"))

    server = smtplib.SMTP(smtp_host, smtp_port, timeout=30)
    try:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
    finally:
        server.quit()


async def send_otp_email(to_email: str, otp_code: str) -> None:
    try:
        await asyncio.to_thread(_send_otp_email_sync, to_email, otp_code)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {exc}") from exc


def _otp_is_expired(user: dict) -> bool:
    expires_at = user.get("reset_otp_expires_at")
    if not isinstance(expires_at, datetime):
        return False
    return datetime.utcnow() > expires_at


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    clean_email = data.email.lower().strip()
    user = await user_collection.find_one({"email": clean_email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found in our network.")

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_TTL_MINUTES)

    await user_collection.update_one(
        {"email": clean_email},
        {"$set": {"reset_otp": otp_code, "reset_otp_expires_at": expires_at}},
    )

    await send_otp_email(clean_email, otp_code)

    return {"status": "success", "message": "Verification code sent to your email successfully."}


@router.post("/verify-email-otp")
async def verify_email_otp(data: VerifyOTPRequest):
    clean_email = data.email.lower().strip()
    user = await user_collection.find_one({"email": clean_email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    saved_otp = user.get("reset_otp")
    if not saved_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    if _otp_is_expired(user):
        await user_collection.update_one(
            {"email": clean_email},
            {"$unset": {"reset_otp": "", "reset_otp_expires_at": ""}},
        )
        raise HTTPException(status_code=400, detail="Verification code has expired. Request a new one.")

    if not hmac.compare_digest(str(data.otp).strip(), str(saved_otp).strip()):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    await user_collection.update_one(
        {"email": clean_email},
        {
            "$set": {"password": hash_password(data.new_password.strip())},
            "$unset": {"reset_otp": "", "reset_otp_expires_at": ""},
        },
    )
    return {"status": "success", "message": "Password changed successfully. You can now login."}


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
