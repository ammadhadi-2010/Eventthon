from datetime import datetime
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

from database import escrow_collection, transaction_collection, wallet_collection

router = APIRouter()


DEFAULT_BALANCES = {
    "THON": {"available": 0.0, "pending": 0.0, "locked": 0.0},
    "PKR": {"available": 0.0, "pending": 0.0, "locked": 0.0},
}

DEFAULT_SECURITY = {
    "kyc_verified": False,
    "two_factor_enabled": False,
    "withdrawal_pin_enabled": False,
    "login_alerts": True,
}

DEFAULT_PREFERENCES = {
    "theme": "dark",
    "language": "en",
    "base_currency": "PKR",
    "compact_mode": False,
    "email_notifications": True,
}


class AmountPayload(BaseModel):
    amount: float
    currency: str = "THON"
    note: Optional[str] = None


class TransferPayload(BaseModel):
    from_user_id: str
    to_user_id: str
    amount: float
    currency: str = "THON"
    note: Optional[str] = None


class EscrowHoldPayload(BaseModel):
    deal_id: str
    buyer_user_id: str
    seller_user_id: str
    amount: float
    currency: str = "THON"
    note: Optional[str] = None


class UpdateSecurityPayload(BaseModel):
    kyc_verified: Optional[bool] = None
    two_factor_enabled: Optional[bool] = None
    withdrawal_pin_enabled: Optional[bool] = None
    login_alerts: Optional[bool] = None


class UpdatePreferencesPayload(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    base_currency: Optional[str] = None
    compact_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None


def utc_iso() -> str:
    return datetime.utcnow().isoformat()


def normalize_currency(value: Optional[str]) -> str:
    return (value or "THON").strip().upper()


def build_wallet_address(user_id: str) -> str:
    clean = str(user_id or "").strip()
    if len(clean) < 8:
        clean = (clean + "00000000")[:8]
    return f"0x{clean[:6]}...{clean[-4:]}"


def build_default_wallet(user_id: str):
    return {
        "user_id": user_id,
        "balances": {k: dict(v) for k, v in DEFAULT_BALANCES.items()},
        "wallet_address": build_wallet_address(user_id),
        "bank_accounts": [],
        "kyc_status": "pending",
        "security": {**DEFAULT_SECURITY},
        "preferences": {**DEFAULT_PREFERENCES},
        "limits": {"daily_transfer": 50000.0, "daily_withdraw": 50000.0},
        "created_at": utc_iso(),
        "updated_at": utc_iso(),
    }


async def ensure_wallet(user_id: str):
    clean_user_id = str(user_id or "").strip()
    if not clean_user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    wallet = await wallet_collection.find_one({"user_id": clean_user_id})
    if wallet:
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
    new_wallet = build_default_wallet(clean_user_id)
    await wallet_collection.insert_one(new_wallet)
    return new_wallet


def sanitize_wallet(wallet: dict):
    data = dict(wallet)
    if "_id" in data:
        data["_id"] = str(data["_id"])
    data["balances"] = data.get("balances") or {k: dict(v) for k, v in DEFAULT_BALANCES.items()}
    data["bank_accounts"] = data.get("bank_accounts", [])
    data["security"] = {**DEFAULT_SECURITY, **(data.get("security") or {})}
    data["preferences"] = {**DEFAULT_PREFERENCES, **(data.get("preferences") or {})}
    return data


async def append_transaction(
    user_id: str,
    tx_type: str,
    amount: float,
    currency: str,
    status: str = "completed",
    note: Optional[str] = None,
    meta: Optional[dict] = None,
):
    tx = {
        "id": f"tx-{uuid.uuid4().hex[:10]}",
        "user_id": user_id,
        "type": tx_type,
        "amount": round(float(amount), 8),
        "currency": currency,
        "status": status,
        "note": note or "",
        "meta": meta or {},
        "created_at": utc_iso(),
    }
    await transaction_collection.insert_one(tx)
    return tx


async def move_balance(user_id: str, currency: str, bucket_from: str, bucket_to: str, amount: float):
    wallet = await ensure_wallet(user_id)
    balances = wallet.get("balances", {})
    currency_bal = balances.get(currency) or {"available": 0.0, "pending": 0.0, "locked": 0.0}
    from_amount = float(currency_bal.get(bucket_from, 0.0))
    if from_amount < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient {bucket_from} balance")
    currency_bal[bucket_from] = round(from_amount - amount, 8)
    currency_bal[bucket_to] = round(float(currency_bal.get(bucket_to, 0.0)) + amount, 8)
    balances[currency] = currency_bal
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"balances": balances, "updated_at": utc_iso()}},
    )
    return balances


async def credit_balance(user_id: str, currency: str, amount: float):
    wallet = await ensure_wallet(user_id)
    balances = wallet.get("balances", {})
    currency_bal = balances.get(currency) or {"available": 0.0, "pending": 0.0, "locked": 0.0}
    currency_bal["available"] = round(float(currency_bal.get("available", 0.0)) + amount, 8)
    balances[currency] = currency_bal
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"balances": balances, "updated_at": utc_iso()}},
    )
    return balances


async def debit_available_balance(user_id: str, currency: str, amount: float):
    wallet = await ensure_wallet(user_id)
    balances = wallet.get("balances", {})
    currency_bal = balances.get(currency) or {"available": 0.0, "pending": 0.0, "locked": 0.0}
    available_amount = float(currency_bal.get("available", 0.0))
    if available_amount < amount:
        raise HTTPException(status_code=400, detail="Insufficient available balance")
    currency_bal["available"] = round(available_amount - amount, 8)
    balances[currency] = currency_bal
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"balances": balances, "updated_at": utc_iso()}},
    )
    return balances


# Backward compatible endpoint
@router.get("/get_wallet/{user_id}")
async def get_wallet(user_id: str):
    wallet = await ensure_wallet(user_id)
    return {"status": "success", "data": sanitize_wallet(wallet)}


@router.get("/wallet/{user_id}")
async def get_wallet_summary(user_id: str):
    wallet = await ensure_wallet(user_id)
    return {"status": "success", "data": sanitize_wallet(wallet)}


@router.get("/wallet/{user_id}/transactions")
async def get_wallet_transactions(user_id: str, limit: int = 50):
    safe_limit = max(1, min(int(limit), 200))
    rows = await transaction_collection.find({"user_id": user_id}).sort("created_at", -1).to_list(length=safe_limit)
    for row in rows:
        if "_id" in row:
            row["_id"] = str(row["_id"])
    return {"status": "success", "data": rows}


@router.post("/wallet/{user_id}/deposit")
async def deposit_wallet(user_id: str, payload: AmountPayload):
    amount = round(float(payload.amount), 8)
    currency = normalize_currency(payload.currency)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be positive")
    balances = await credit_balance(user_id, currency, amount)
    await append_transaction(user_id, "deposit", amount, currency, note=payload.note)
    return {"status": "success", "balances": balances}


@router.post("/wallet/{user_id}/withdraw")
async def withdraw_wallet(user_id: str, payload: AmountPayload):
    amount = round(float(payload.amount), 8)
    currency = normalize_currency(payload.currency)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be positive")
    balances = await move_balance(user_id, currency, "available", "pending", amount)
    await append_transaction(user_id, "withdraw", amount, currency, status="pending", note=payload.note)
    return {"status": "success", "balances": balances}


@router.post("/wallet/transfer")
async def transfer_wallet(payload: TransferPayload):
    amount = round(float(payload.amount), 8)
    currency = normalize_currency(payload.currency)
    from_user_id = payload.from_user_id.strip()
    to_user_id = payload.to_user_id.strip()
    if not from_user_id or not to_user_id:
        raise HTTPException(status_code=400, detail="from_user_id and to_user_id required")
    if from_user_id == to_user_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to same wallet")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be positive")

    await debit_available_balance(from_user_id, currency, amount)
    await credit_balance(to_user_id, currency, amount)
    tx_meta = {"from_user_id": from_user_id, "to_user_id": to_user_id}
    await append_transaction(from_user_id, "transfer_out", amount, currency, note=payload.note, meta=tx_meta)
    await append_transaction(to_user_id, "transfer_in", amount, currency, note=payload.note, meta=tx_meta)
    return {"status": "success", "message": "Transfer completed"}


@router.post("/deals/escrow/hold")
async def escrow_hold(payload: EscrowHoldPayload):
    amount = round(float(payload.amount), 8)
    currency = normalize_currency(payload.currency)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be positive")
    existing = await escrow_collection.find_one({"deal_id": payload.deal_id})
    if existing and existing.get("status") in {"held", "released"}:
        raise HTTPException(status_code=400, detail="Escrow already exists for this deal")

    await move_balance(payload.buyer_user_id, currency, "available", "locked", amount)
    escrow_doc = {
        "deal_id": payload.deal_id,
        "buyer_user_id": payload.buyer_user_id,
        "seller_user_id": payload.seller_user_id,
        "amount": amount,
        "currency": currency,
        "status": "held",
        "note": payload.note or "",
        "created_at": utc_iso(),
        "updated_at": utc_iso(),
    }
    await escrow_collection.update_one({"deal_id": payload.deal_id}, {"$set": escrow_doc}, upsert=True)
    await append_transaction(payload.buyer_user_id, "escrow_hold", amount, currency, status="held", note=payload.note, meta={"deal_id": payload.deal_id})
    return {"status": "success", "data": escrow_doc}


@router.post("/deals/escrow/release/{deal_id}")
async def escrow_release(deal_id: str):
    escrow = await escrow_collection.find_one({"deal_id": deal_id})
    if not escrow or escrow.get("status") != "held":
        raise HTTPException(status_code=404, detail="Active escrow not found")
    amount = round(float(escrow.get("amount", 0.0)), 8)
    currency = normalize_currency(escrow.get("currency"))
    buyer_user_id = escrow.get("buyer_user_id")
    seller_user_id = escrow.get("seller_user_id")

    buyer_wallet = await ensure_wallet(buyer_user_id)
    buyer_balances = buyer_wallet.get("balances", {})
    buyer_cur = buyer_balances.get(currency) or {"available": 0.0, "pending": 0.0, "locked": 0.0}
    locked_amount = float(buyer_cur.get("locked", 0.0))
    if locked_amount < amount:
        raise HTTPException(status_code=400, detail="Insufficient escrow locked balance")
    buyer_cur["locked"] = round(locked_amount - amount, 8)
    buyer_balances[currency] = buyer_cur
    await wallet_collection.update_one(
        {"user_id": buyer_user_id},
        {"$set": {"balances": buyer_balances, "updated_at": utc_iso()}},
    )
    await credit_balance(seller_user_id, currency, amount)

    await escrow_collection.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "released", "updated_at": utc_iso()}},
    )
    await append_transaction(seller_user_id, "escrow_release_in", amount, currency, note=f"Deal {deal_id}", meta={"deal_id": deal_id})
    await append_transaction(buyer_user_id, "escrow_release_out", amount, currency, note=f"Deal {deal_id}", meta={"deal_id": deal_id})
    return {"status": "success", "message": "Escrow released"}


@router.post("/deals/escrow/refund/{deal_id}")
async def escrow_refund(deal_id: str):
    escrow = await escrow_collection.find_one({"deal_id": deal_id})
    if not escrow or escrow.get("status") != "held":
        raise HTTPException(status_code=404, detail="Active escrow not found")
    amount = round(float(escrow.get("amount", 0.0)), 8)
    currency = normalize_currency(escrow.get("currency"))
    buyer_user_id = escrow.get("buyer_user_id")

    await move_balance(buyer_user_id, currency, "locked", "available", amount)
    await escrow_collection.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "refunded", "updated_at": utc_iso()}},
    )
    await append_transaction(buyer_user_id, "escrow_refund", amount, currency, note=f"Deal {deal_id}", meta={"deal_id": deal_id})
    return {"status": "success", "message": "Escrow refunded"}


@router.get("/deals/{deal_id}")
async def get_deal_escrow(deal_id: str):
    escrow = await escrow_collection.find_one({"deal_id": deal_id})
    if not escrow:
        return {"status": "error", "message": "Deal not found"}
    escrow["_id"] = str(escrow["_id"])
    return {"status": "success", "data": escrow}


# Backward compatible endpoint
@router.post("/save_bank_account/{user_id}")
async def save_bank(user_id: str, account_data: dict = Body(...)):
    await ensure_wallet(user_id)
    account_doc = {
        "id": f"bank-{uuid.uuid4().hex[:8]}",
        "type": account_data.get("type", "Bank"),
        "title": account_data.get("title", "Untitled"),
        "number": account_data.get("number", ""),
        "created_at": utc_iso(),
    }
    result = await wallet_collection.update_one(
        {"user_id": user_id},
        {"$push": {"bank_accounts": account_doc}, "$set": {"updated_at": utc_iso()}},
    )
    if result.modified_count > 0:
        return {"status": "success", "data": account_doc}
    raise HTTPException(status_code=400, detail="Unable to save bank account")


@router.get("/wallet/{user_id}/bank-accounts")
async def get_bank_accounts(user_id: str):
    wallet = await ensure_wallet(user_id)
    return {"status": "success", "data": wallet.get("bank_accounts", [])}


@router.get("/wallet/{user_id}/security")
async def get_wallet_security(user_id: str):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    return {"status": "success", "data": wallet.get("security", {**DEFAULT_SECURITY})}


@router.put("/wallet/{user_id}/security")
async def update_wallet_security(user_id: str, payload: UpdateSecurityPayload):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    current = wallet.get("security", {**DEFAULT_SECURITY})
    updates = payload.model_dump(exclude_none=True)
    merged = {**current, **updates}
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"security": merged, "updated_at": utc_iso()}},
    )
    return {"status": "success", "data": merged}


@router.get("/wallet/{user_id}/preferences")
async def get_wallet_preferences(user_id: str):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    return {"status": "success", "data": wallet.get("preferences", {**DEFAULT_PREFERENCES})}


@router.put("/wallet/{user_id}/preferences")
async def update_wallet_preferences(user_id: str, payload: UpdatePreferencesPayload):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    current = wallet.get("preferences", {**DEFAULT_PREFERENCES})
    updates = payload.model_dump(exclude_none=True)
    if "base_currency" in updates and updates["base_currency"]:
        updates["base_currency"] = str(updates["base_currency"]).upper().strip()
    merged = {**current, **updates}
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"preferences": merged, "updated_at": utc_iso()}},
    )
    return {"status": "success", "data": merged}