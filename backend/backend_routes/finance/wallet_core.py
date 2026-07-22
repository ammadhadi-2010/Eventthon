"""Wallet document helpers and balance bucket mutations."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import HTTPException
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database import wallet_collection
from backend_routes.finance.ledger_constants import ET_CURRENCY, BALANCE_AVAILABLE, BALANCE_LOCKED, BALANCE_PENDING


def thon_balance_fields(balances: dict) -> dict:
    thon = balances.get(ET_CURRENCY) or empty_balance_buckets()
    available = round(float(thon.get(BALANCE_AVAILABLE, 0.0)), 8)
    pending = round(float(thon.get(BALANCE_PENDING, 0.0)), 8)
    locked = round(float(thon.get(BALANCE_LOCKED, 0.0)), 8)
    return {
        "available_thon": available,
        "pending_thon": pending,
        "locked_thon": locked,
        "withdrawable_balance": round(max(0.0, available - locked), 8),
    }

DEFAULT_BALANCES = {
    "THON": {"available": 0.0, "pending": 0.0, "locked": 0.0},
    "PKR": {"available": 0.0, "pending": 0.0, "locked": 0.0},
}

DEFAULT_SECURITY = {
    "kyc_verified": False,
    "two_factor_enabled": False,
    "withdrawal_pin_enabled": False,
    "login_alerts": True,
    "withdrawal_pin_hash": None,
}

DEFAULT_PREFERENCES = {
    "theme": "dark",
    "language": "en",
    "base_currency": "PKR",
    "compact_mode": False,
    "email_notifications": True,
}


def utc_iso() -> str:
    return datetime.utcnow().isoformat()


def normalize_currency(value: Optional[str]) -> str:
    return (value or ET_CURRENCY).strip().upper()


def build_wallet_address(user_id: str) -> str:
    clean = str(user_id or "").strip()
    if len(clean) < 8:
        clean = (clean + "00000000")[:8]
    return f"0x{clean[:6]}...{clean[-4:]}"


def empty_balance_buckets() -> dict:
    return {"available": 0.0, "pending": 0.0, "locked": 0.0}


def build_default_wallet(user_id: str) -> dict:
    return {
        "user_id": user_id,
        "currency": "USD",
        "balances": {k: empty_balance_buckets() for k in DEFAULT_BALANCES},
        "available_thon": 0.0,
        "pending_thon": 0.0,
        "locked_thon": 0.0,
        "withdrawable_balance": 0.0,
        "wallet_address": build_wallet_address(user_id),
        "bank_accounts": [],
        "kyc_status": "pending",
        "security": {**DEFAULT_SECURITY},
        "preferences": {**DEFAULT_PREFERENCES},
        "limits": {"daily_transfer": 50000.0, "daily_withdraw": 50000.0},
        "created_at": utc_iso(),
        "updated_at": utc_iso(),
    }


async def ensure_wallet(user_id: str) -> dict:
    clean_user_id = str(user_id or "").strip()
    if not clean_user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    try:
        wallet = await wallet_collection.find_one_and_update(
            {"user_id": clean_user_id},
            {"$setOnInsert": build_default_wallet(clean_user_id)},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError:
        wallet = await wallet_collection.find_one({"user_id": clean_user_id})
        if not wallet:
            raise HTTPException(status_code=500, detail="Wallet creation failed") from None
    updates = {}
    if "balances" not in wallet:
        updates["balances"] = {k: dict(v) for k, v in DEFAULT_BALANCES.items()}
    if "security" not in wallet:
        updates["security"] = {**DEFAULT_SECURITY}
    if "preferences" not in wallet:
        updates["preferences"] = {**DEFAULT_PREFERENCES}
    if updates:
        await wallet_collection.update_one(
            {"user_id": clean_user_id},
            {"$set": {**updates, "updated_at": utc_iso()}},
        )
        wallet = {**wallet, **updates}
    return wallet


def sanitize_wallet(wallet: dict) -> dict:
    data = dict(wallet)
    if "_id" in data:
        data["_id"] = str(data["_id"])
    data["balances"] = data.get("balances") or {k: empty_balance_buckets() for k in DEFAULT_BALANCES}
    thon_fields = thon_balance_fields(data["balances"])
    data.update(thon_fields)
    security = {**DEFAULT_SECURITY, **(data.get("security") or {})}
    security.pop("withdrawal_pin_hash", None)
    data["security"] = security
    data["preferences"] = {**DEFAULT_PREFERENCES, **(data.get("preferences") or {})}
    data["bank_accounts"] = data.get("bank_accounts", [])
    return data


async def sync_wallet_thon_fields(user_id: str, balances: dict) -> None:
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {**thon_balance_fields(balances), "updated_at": utc_iso()}},
    )
