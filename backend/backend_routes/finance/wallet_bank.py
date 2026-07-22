"""Bank account management for wallet payouts."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException

from database import wallet_collection
from backend_routes.finance.wallet_auth import require_wallet_owner
from backend_routes.finance.wallet_core import ensure_wallet, utc_iso
from backend_routes.finance.wallet_models import BankAccountPayload

router = APIRouter()


@router.get("/wallet/{user_id}/bank-accounts")
async def get_bank_accounts(user_id: str, _actor=Depends(require_wallet_owner)):
    wallet = await ensure_wallet(user_id)
    return {"status": "success", "data": wallet.get("bank_accounts", [])}


@router.post("/save_bank_account/{user_id}")
async def save_bank_account(
    user_id: str,
    payload: BankAccountPayload,
    _actor=Depends(require_wallet_owner),
):
    await ensure_wallet(user_id)
    account_doc = {
        "id": f"bank-{uuid.uuid4().hex[:8]}",
        "type": payload.type,
        "title": payload.title,
        "number": payload.number,
        "is_primary": payload.is_primary,
        "created_at": utc_iso(),
    }
    update: dict = {"$push": {"bank_accounts": account_doc}, "$set": {"updated_at": utc_iso()}}
    if payload.is_primary:
        wallet = await ensure_wallet(user_id)
        accounts = []
        for row in wallet.get("bank_accounts", []):
            item = dict(row)
            item["is_primary"] = False
            accounts.append(item)
        accounts.append(account_doc)
        update = {"$set": {"bank_accounts": accounts, "updated_at": utc_iso()}}
    result = await wallet_collection.update_one({"user_id": user_id}, update)
    if result.modified_count == 0 and "$push" in update:
        raise HTTPException(status_code=400, detail="Unable to save bank account")
    return {"status": "success", "data": account_doc}


@router.delete("/wallet/{user_id}/bank-accounts/{account_id}")
async def delete_bank_account(
    user_id: str,
    account_id: str,
    _actor=Depends(require_wallet_owner),
):
    wallet = await ensure_wallet(user_id)
    accounts = [row for row in wallet.get("bank_accounts", []) if row.get("id") != account_id]
    if len(accounts) == len(wallet.get("bank_accounts", [])):
        raise HTTPException(status_code=404, detail="Bank account not found")
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"bank_accounts": accounts, "updated_at": utc_iso()}},
    )
    return {"status": "success", "message": "Bank account removed"}
