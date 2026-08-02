from __future__ import annotations

import os
from datetime import datetime
from urllib.parse import urlencode, quote

import httpx
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel

from database import companies_collection, user_collection
from .auth_tokens import create_access_token, create_oauth_state, decode_access_token, verify_oauth_state

router = APIRouter()
legacy_router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
GOOGLE_CALLBACK_URL = (
    os.getenv("GOOGLE_CALLBACK_URL", "").strip()
    or "http://localhost:8000/api/auth/google/callback"
)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3001").strip().rstrip("/")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_SCOPES = "openid email profile"


class TokenBody(BaseModel):
    token: str


def _company_filter(company_id: str) -> dict:
    cid = str(company_id or "").strip()
    if not cid:
        return {}
    if ObjectId.is_valid(cid):
        return {"$or": [{"_id": ObjectId(cid)}, {"_id": cid}]}
    return {"_id": cid}


async def _resolve_company_context(user: dict) -> tuple[str, str]:
    company_id = str(user.get("company_id") or "").strip()
    company_status = ""
    if company_id:
        company = await companies_collection.find_one(_company_filter(company_id), {"status": 1, "is_verified": 1})
        if company:
            company_status = str(company.get("status") or "").strip().lower()
    if not company_status and user.get("role") == "employer":
        by_owner = await companies_collection.find_one(
            {
                "owner_user_id": {
                    "$in": [str(user.get("email") or "").lower(), str(user.get("mobile") or "")]
                }
            },
            {"status": 1, "_id": 1},
        )
        if by_owner:
            company_status = str(by_owner.get("status") or "").strip().lower()
            company_id = str(by_owner.get("_id") or company_id)
            await user_collection.update_one({"_id": user["_id"]}, {"$set": {"company_id": company_id}})
    return company_id, company_status


def build_auth_user_payload(user: dict, *, company_id: str = "", company_status: str = "") -> dict:
    role = str(user.get("role") or "candidate")
    if role == "admin":
        return {
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user.get("email"),
            "mobile": user.get("mobile"),
            "user_id": user.get("user_id") or str(user.get("_id") or ""),
            "wallet_balance": user.get("wallet_balance", 0),
            "role": "admin",
            "rank": "Commander",
            "company_id": company_id,
            "company_status": company_status,
            "picture": user.get("profile_image_url") or user.get("imageurl") or user.get("avatar"),
        }
    return {
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "email": user.get("email"),
        "mobile": user.get("mobile"),
        "user_id": user.get("user_id") or str(user.get("_id") or ""),
        "wallet_balance": user.get("wallet_balance", 0),
        "role": role,
        "rank": user.get("rank", "Recruit"),
        "company_id": company_id,
        "company_status": company_status,
        "picture": user.get("profile_image_url") or user.get("imageurl") or user.get("avatar"),
    }


def _split_google_name(idinfo: dict) -> tuple[str, str]:
    given = str(idinfo.get("given_name") or "").strip()
    family = str(idinfo.get("family_name") or "").strip()
    if given or family:
        return given or "User", family
    full = str(idinfo.get("name") or "User").strip()
    parts = full.split()
    if not parts:
        return "User", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


async def find_or_create_google_user(idinfo: dict) -> dict:
    email = str(idinfo.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    first_name, last_name = _split_google_name(idinfo)
    picture = str(idinfo.get("picture") or "").strip()
    full_name = f"{first_name} {last_name}".strip()

    user = await user_collection.find_one({"email": email})
    now = datetime.utcnow()

    if not user:
        new_user = {
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "display_name": full_name,
            "email": email,
            "mobile": None,
            "user_id": email.split("@")[0],
            "profile_image_url": picture,
            "imageurl": picture,
            "avatar": picture,
            "id_card_verified": False,
            "identity_status": "Not Submitted",
            "is_verified": False,
            "role": "candidate",
            "skill_score": 0.0,
            "wallet_balance": 0.0,
            "skills": [],
            "auth_provider": "google",
            "created_at": now,
            "last_login": now,
        }
        result = await user_collection.insert_one(new_user)
        user = {**new_user, "_id": result.inserted_id}
    else:
        update_data = {
            "last_login": now,
            "auth_provider": user.get("auth_provider") or "google",
        }
        if picture:
            update_data.update(
                {
                    "profile_image_url": picture,
                    "imageurl": picture,
                    "avatar": picture,
                }
            )
        if not str(user.get("first_name") or "").strip() and first_name:
            update_data["first_name"] = first_name
        if not str(user.get("last_name") or "").strip() and last_name:
            update_data["last_name"] = last_name
        if not str(user.get("full_name") or "").strip() and full_name:
            update_data["full_name"] = full_name
            update_data["display_name"] = full_name
        if not user.get("user_id"):
            update_data["user_id"] = str(user.get("mobile") or email.split("@")[0]).strip().lower()
        await user_collection.update_one({"_id": user["_id"]}, {"$set": update_data})
        user = await user_collection.find_one({"_id": user["_id"]})

    return user


async def issue_google_session(user: dict) -> dict:
    company_id, company_status = await _resolve_company_context(user)
    user_payload = build_auth_user_payload(user, company_id=company_id, company_status=company_status)
    access_token = create_access_token(
        {
            "sub": str(user["_id"]),
            "email": user.get("email"),
            "role": user_payload.get("role"),
        }
    )
    return {
        "status": "success",
        "access_token": access_token,
        "user": user_payload,
    }


def _ensure_google_oauth_config() -> None:
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured on the server.")


@router.get("/google")
async def google_auth_start():
    _ensure_google_oauth_config()
    state = create_oauth_state()
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope": GOOGLE_SCOPES,
        "access_type": "online",
        "include_granted_scopes": "true",
        "prompt": "select_account",
        "state": state,
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}", status_code=307)


@router.get("/google/callback")
async def google_auth_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    if error:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/google/callback?error={quote(str(error))}",
            status_code=307,
        )
    if not code or not state:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/google/callback?error={quote('Missing Google OAuth code')}",
            status_code=307,
        )

    _ensure_google_oauth_config()
    try:
        verify_oauth_state(state)
    except Exception:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/google/callback?error={quote('Invalid OAuth state')}",
            status_code=307,
        )

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_CALLBACK_URL,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        if token_response.status_code >= 400:
            detail = token_response.text[:240]
            return RedirectResponse(
                f"{FRONTEND_URL}/auth/google/callback?error={quote('Google token exchange failed')}",
                status_code=307,
            )

        token_data = token_response.json()
        id_token_jwt = token_data.get("id_token")
        if not id_token_jwt:
            return RedirectResponse(
                f"{FRONTEND_URL}/auth/google/callback?error={quote('Google did not return an ID token')}",
                status_code=307,
            )

        idinfo = id_token.verify_oauth2_token(
            id_token_jwt,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
        user = await find_or_create_google_user(idinfo)
        session = await issue_google_session(user)
        token = quote(session["access_token"])
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/google/callback?token={token}",
            status_code=307,
        )
    except HTTPException as exc:
        message = quote(str(exc.detail))
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/google/callback?error={message}",
            status_code=307,
        )
    except Exception:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/google/callback?error={quote('Google sign-in failed')}",
            status_code=307,
        )


@router.post("/google/session")
async def google_auth_session(data: TokenBody):
    try:
        payload = decode_access_token(data.token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired Google session token") from exc

    user_oid = payload.get("sub")
    if not user_oid or not ObjectId.is_valid(str(user_oid)):
        raise HTTPException(status_code=401, detail="Invalid session subject")

    user = await user_collection.find_one({"_id": ObjectId(str(user_oid))})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session = await issue_google_session(user)
    return session


@legacy_router.post("/google-login")
async def google_login_one_tap(data: TokenBody):
    """Legacy Google Identity Services one-tap / button credential flow."""
    try:
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=503, detail="Google auth is not configured.")

        idinfo = id_token.verify_oauth2_token(
            data.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
        user = await find_or_create_google_user(idinfo)
        return await issue_google_session(user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {exc}") from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Google login failed") from exc
