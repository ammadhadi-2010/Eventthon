"""Wallet read/write HTTP routes."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from database import transaction_collection, wallet_collection
from backend_routes.auth.admin_guard import admin_guard
from backend_routes.security.input_sanitize import reject_mongo_operators, sanitize_user_id
from backend_routes.finance.wallet_auth import require_wallet_owner, resolve_authenticated_user
from backend_routes.finance.wallet_core import ensure_wallet, sanitize_wallet, utc_iso
from backend_routes.finance.wallet_models import (
    AmountPayload,
    TransferPayload,
    UpdatePreferencesPayload,
    UpdateSecurityPayload,
)
from backend_routes.finance.wallet_operations import request_withdrawal, transfer_thon
from backend_routes.finance.wallet_transactions import (
    build_transaction_query,
    serialize_transaction,
)

router = APIRouter()


@router.get("/get_wallet/{user_id}")
async def get_wallet_legacy(user_id: str, _actor=Depends(require_wallet_owner)):
    wallet = await ensure_wallet(user_id)
    return {"status": "success", "data": sanitize_wallet(wallet)}


@router.get("/wallet/{user_id}")
async def get_wallet_summary(user_id: str, _actor=Depends(require_wallet_owner)):
    wallet = await ensure_wallet(user_id)
    return {"status": "success", "data": sanitize_wallet(wallet)}


@router.get("/wallet/{user_id}/transactions")
async def get_wallet_transactions(
    user_id: str,
    limit: int = Query(50, ge=1, le=200),
    tx_type: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = Query(None),
    _actor=Depends(require_wallet_owner),
):
    query = build_transaction_query(user_id, tx_type=tx_type, status=status)
    rows = await transaction_collection.find(query).sort("created_at", -1).to_list(length=limit)
    return {"status": "success", "data": [serialize_transaction(row) for row in rows]}


@router.post("/wallet/{user_id}/withdraw")
async def withdraw_wallet(
    user_id: str,
    payload: AmountPayload,
    _actor=Depends(require_wallet_owner),
):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    security = wallet.get("security") or {}
    if security.get("withdrawal_pin_enabled") and not payload.withdrawal_pin:
        raise HTTPException(status_code=400, detail="Withdrawal PIN required")
    result = await request_withdrawal(
        user_id=user_id,
        amount=payload.amount,
        currency=payload.currency,
        note=payload.note or "",
    )
    return {"status": "success", "data": result["transaction"]}


@router.post("/wallet/transfer")
async def transfer_wallet(payload: TransferPayload, actor=Depends(resolve_authenticated_user)):
    reject_mongo_operators(payload.model_dump())
    from_id = sanitize_user_id(payload.from_user_id)
    actor_id = str(actor.get("user_id") or actor.get("mobile") or actor.get("_id") or "")
    if from_id != actor_id and str(actor.get("role") or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Transfer not authorized")
    result = await transfer_thon(
        from_user_id=from_id,
        to_identifier=payload.to_user_id,
        amount=payload.amount,
        currency=payload.currency,
        note=payload.note or "",
    )
    return {"status": "success", "message": "Transfer completed", "data": result}


@router.post("/wallet/{user_id}/deposit")
async def deposit_wallet_admin(
    user_id: str,
    payload: AmountPayload,
    _admin=Depends(admin_guard),
):
    raise HTTPException(
        status_code=410,
        detail="Direct deposits disabled. Use POST /finance/payments/checkout/deposit",
    )


@router.get("/wallet/{user_id}/security")
async def get_wallet_security(user_id: str, _actor=Depends(require_wallet_owner)):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    return {"status": "success", "data": wallet.get("security")}


@router.put("/wallet/{user_id}/security")
async def update_wallet_security(
    user_id: str,
    payload: UpdateSecurityPayload,
    _actor=Depends(require_wallet_owner),
):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    current = wallet.get("security") or {}
    updates = payload.model_dump(exclude_none=True)
    updates.pop("withdrawal_pin", None)
    merged = {**current, **updates}
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"security": merged, "updated_at": utc_iso()}},
    )
    return {"status": "success", "data": merged}


@router.get("/wallet/{user_id}/preferences")
async def get_wallet_preferences(user_id: str, _actor=Depends(require_wallet_owner)):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    return {"status": "success", "data": wallet.get("preferences")}


@router.put("/wallet/{user_id}/preferences")
async def update_wallet_preferences(
    user_id: str,
    payload: UpdatePreferencesPayload,
    _actor=Depends(require_wallet_owner),
):
    wallet = sanitize_wallet(await ensure_wallet(user_id))
    current = wallet.get("preferences") or {}
    updates = payload.model_dump(exclude_none=True)
    if updates.get("base_currency"):
        updates["base_currency"] = str(updates["base_currency"]).upper().strip()
    merged = {**current, **updates}
    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {"preferences": merged, "updated_at": utc_iso()}},
    )
    return {"status": "success", "data": merged}
