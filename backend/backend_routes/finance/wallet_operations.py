"""Wallet balance mutations: transfer, withdraw, escrow helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from pymongo import ReturnDocument

from database import transaction_collection, wallet_collection
from backend_routes.finance.ledger_constants import (
    BALANCE_AVAILABLE,
    BALANCE_LOCKED,
    BALANCE_PENDING,
    ET_CURRENCY,
    TX_STATUS_COMPLETED,
    TX_STATUS_FAILED,
    TX_STATUS_PENDING,
    TX_TYPE_TRANSFER,
    TX_TYPE_WITHDRAWAL,
)
from backend_routes.finance.wallet_auth import resolve_recipient_user_id
from backend_routes.finance.wallet_core import (
    ensure_wallet,
    normalize_currency,
    sync_wallet_thon_fields,
    utc_iso,
)
from backend_routes.finance.wallet_transactions import record_transaction, thon_amount_from_record


def _iso_day_start() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0).replace(tzinfo=None).isoformat()


async def _daily_total(user_id: str, tx_type: str) -> float:
    rows = await transaction_collection.find(
        {"user_id": user_id, "type": tx_type, "created_at": {"$gte": _iso_day_start()}}
    ).to_list(length=500)
    return round(sum(thon_amount_from_record(row) for row in rows), 8)


async def _assert_daily_limit(user_id: str, tx_type: str, amount: float, limit_key: str) -> None:
    wallet = await ensure_wallet(user_id)
    limit = float((wallet.get("limits") or {}).get(limit_key, 50000.0))
    used = await _daily_total(user_id, tx_type)
    if used + amount > limit:
        raise HTTPException(status_code=400, detail=f"Daily {limit_key.replace('_', ' ')} limit exceeded")


async def apply_balance_delta(
    user_id: str,
    currency: str,
    *,
    available: float = 0.0,
    pending: float = 0.0,
    locked: float = 0.0,
    require_available: Optional[float] = None,
    require_pending: Optional[float] = None,
    require_locked: Optional[float] = None,
) -> dict:
    """Atomic conditional balance update using find_one_and_update ($gte guards)."""
    currency = normalize_currency(currency)
    await ensure_wallet(user_id)

    inc_fields: dict[str, float] = {}
    if available:
        inc_fields[f"balances.{currency}.{BALANCE_AVAILABLE}"] = round(available, 8)
    if pending:
        inc_fields[f"balances.{currency}.{BALANCE_PENDING}"] = round(pending, 8)
    if locked:
        inc_fields[f"balances.{currency}.{BALANCE_LOCKED}"] = round(locked, 8)

    if not inc_fields:
        wallet = await wallet_collection.find_one({"user_id": user_id})
        return (wallet or {}).get("balances", {})

    query: dict = {"user_id": user_id}
    if require_available is not None:
        query[f"balances.{currency}.{BALANCE_AVAILABLE}"] = {"$gte": round(require_available, 8)}
    if require_pending is not None:
        query[f"balances.{currency}.{BALANCE_PENDING}"] = {"$gte": round(require_pending, 8)}
    if require_locked is not None:
        query[f"balances.{currency}.{BALANCE_LOCKED}"] = {"$gte": round(require_locked, 8)}

    result = await wallet_collection.find_one_and_update(
        query,
        {"$inc": inc_fields, "$set": {"updated_at": utc_iso()}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=409, detail="Insufficient balance or concurrent update conflict")

    bucket = (result.get("balances") or {}).get(currency) or {}
    if (
        float(bucket.get(BALANCE_AVAILABLE, 0)) < -1e-9
        or float(bucket.get(BALANCE_PENDING, 0)) < -1e-9
        or float(bucket.get(BALANCE_LOCKED, 0)) < -1e-9
    ):
        raise HTTPException(status_code=409, detail="Balance invariant violated")

    await sync_wallet_thon_fields(user_id, result.get("balances", {}))
    return result.get("balances", {})


async def transfer_thon(
    *,
    from_user_id: str,
    to_identifier: str,
    amount: float,
    currency: str = ET_CURRENCY,
    note: str = "",
) -> dict:
    amount = round(float(amount), 8)
    currency = normalize_currency(currency)
    to_user_id = await resolve_recipient_user_id(to_identifier)
    if from_user_id == to_user_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to same wallet")
    await _assert_daily_limit(from_user_id, TX_TYPE_TRANSFER, amount, "daily_transfer")

    debited = False
    try:
        await apply_balance_delta(from_user_id, currency, available=-amount, require_available=amount)
        debited = True
        await apply_balance_delta(to_user_id, currency, available=amount)
    except Exception:
        if debited:
            await apply_balance_delta(from_user_id, currency, available=amount)
        raise

    meta = {"from_user_id": from_user_id, "to_user_id": to_user_id}
    out_tx = await record_transaction(
        user_id=from_user_id,
        tx_type=TX_TYPE_TRANSFER,
        thon_amount=-amount,
        status=TX_STATUS_COMPLETED,
        currency=currency,
        note=note or f"Transfer to {to_user_id}",
        meta={**meta, "direction": "out"},
    )
    in_tx = await record_transaction(
        user_id=to_user_id,
        tx_type=TX_TYPE_TRANSFER,
        thon_amount=amount,
        status=TX_STATUS_COMPLETED,
        currency=currency,
        note=note or f"Transfer from {from_user_id}",
        meta={**meta, "direction": "in"},
    )
    return {"status": "success", "outgoing": out_tx, "incoming": in_tx}


async def request_withdrawal(
    *,
    user_id: str,
    amount: float,
    currency: str = ET_CURRENCY,
    note: str = "",
) -> dict:
    amount = round(float(amount), 8)
    currency = normalize_currency(currency)
    await _assert_daily_limit(user_id, TX_TYPE_WITHDRAWAL, amount, "daily_withdraw")
    await apply_balance_delta(user_id, currency, available=-amount, pending=amount, require_available=amount)
    tx = await record_transaction(
        user_id=user_id,
        tx_type=TX_TYPE_WITHDRAWAL,
        thon_amount=amount,
        status=TX_STATUS_PENDING,
        currency=currency,
        note=note or "Withdrawal request",
        meta={"stage": "awaiting_admin"},
    )
    return {"status": "success", "transaction": tx}


async def _finalize_withdrawal_tx(transaction_id: str, status: str, meta: dict) -> dict:
    updated = await transaction_collection.find_one_and_update(
        {"transaction_id": transaction_id, "type": TX_TYPE_WITHDRAWAL, "status": TX_STATUS_PENDING},
        {"$set": {"status": status, "cleared_at": utc_iso(), "meta": meta}},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=409, detail="Withdrawal already processed or not found")
    return updated


async def approve_withdrawal(transaction_id: str, admin_note: str = "") -> dict:
    tx = await transaction_collection.find_one(
        {"transaction_id": transaction_id, "type": TX_TYPE_WITHDRAWAL, "status": TX_STATUS_PENDING}
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Pending withdrawal not found")
    user_id = tx["user_id"]
    amount = thon_amount_from_record(tx)
    currency = normalize_currency(tx.get("currency"))
    await apply_balance_delta(user_id, currency, pending=-amount, require_pending=amount)
    meta = {**(tx.get("meta") or {}), "admin_note": admin_note, "stage": "paid_out"}
    return await _finalize_withdrawal_tx(transaction_id, TX_STATUS_COMPLETED, meta)


async def reject_withdrawal(transaction_id: str, admin_note: str = "") -> dict:
    tx = await transaction_collection.find_one(
        {"transaction_id": transaction_id, "type": TX_TYPE_WITHDRAWAL, "status": TX_STATUS_PENDING}
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Pending withdrawal not found")
    user_id = tx["user_id"]
    amount = thon_amount_from_record(tx)
    currency = normalize_currency(tx.get("currency"))
    await apply_balance_delta(
        user_id, currency, pending=-amount, available=amount, require_pending=amount
    )
    meta = {**(tx.get("meta") or {}), "admin_note": admin_note, "stage": "rejected"}
    return await _finalize_withdrawal_tx(transaction_id, TX_STATUS_FAILED, meta)
