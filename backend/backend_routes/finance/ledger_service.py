"""Atomic wallet ledger operations with idempotent gateway crediting."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from database import payment_gateway_events_collection, transaction_collection, wallet_collection
from backend_routes.finance.ledger_constants import (
    BALANCE_AVAILABLE,
    BALANCE_LOCKED,
    BALANCE_PENDING,
    ET_CURRENCY,
    FIAT_CURRENCY,
    TX_STATUS_COMPLETED,
    TX_STATUS_PENDING,
    TX_TYPE_DEPOSIT,
)
from backend_routes.finance.payment_config import get_payment_settings
from backend_routes.finance.wallet_core import ensure_wallet, thon_balance_fields, utc_iso
from backend_routes.finance.wallet_transactions import thon_amount_from_record


def usd_to_thon(amount_usd: float) -> float:
    settings = get_payment_settings()
    return round(float(amount_usd) * settings.thon_per_usd, 8)


def _new_tx_id() -> str:
    return f"tx-{uuid.uuid4().hex[:12]}"


async def record_gateway_event(
    *,
    provider: str,
    event_id: str,
    event_type: str,
    gateway_tx_id: str,
    user_id: str,
    payload_meta: Optional[dict] = None,
) -> bool:
    """Insert gateway event once. Returns False if already processed (idempotent)."""
    doc = {
        "provider": provider,
        "event_id": event_id,
        "event_type": event_type,
        "gateway_tx_id": gateway_tx_id,
        "user_id": user_id,
        "payload_meta": payload_meta or {},
        "processed_at": utc_iso(),
    }
    try:
        await payment_gateway_events_collection.insert_one(doc)
        return True
    except DuplicateKeyError:
        return False


async def credit_pending_deposit_idempotent(
    *,
    user_id: str,
    amount_usd: float,
    gateway: str,
    gateway_tx_id: str,
    idempotency_key: str,
    event_id: str,
    event_type: str,
    note: str = "",
    meta: Optional[dict] = None,
) -> dict:
    """
    Webhook-safe credit: Thon goes to pending_thon only (balances.THON.pending).
    Idempotent on payment_gateway_events.event_id, gateway_tx_id, idempotency_key.
    """
    clean_user = str(user_id or "").strip()
    if not clean_user:
        raise HTTPException(status_code=400, detail="user_id required")
    if amount_usd <= 0:
        raise HTTPException(status_code=400, detail="amount_usd must be positive")

    clean_event_id = str(event_id or "").strip()
    if not clean_event_id:
        raise HTTPException(status_code=400, detail="event_id required")

    prior_event = await payment_gateway_events_collection.find_one({"event_id": clean_event_id})
    if prior_event:
        existing = await transaction_collection.find_one(
            {"$or": [{"gateway_tx_id": gateway_tx_id}, {"idempotency_key": idempotency_key}]}
        )
        if existing:
            return existing
        return {"status": "duplicate", "event_id": clean_event_id, "processed": True}

    existing = await transaction_collection.find_one(
        {"$or": [{"gateway_tx_id": gateway_tx_id}, {"idempotency_key": idempotency_key}]}
    )
    if existing:
        return existing

    inserted = await record_gateway_event(
        provider=gateway,
        event_id=clean_event_id,
        event_type=event_type,
        gateway_tx_id=gateway_tx_id,
        user_id=clean_user,
        payload_meta=meta,
    )
    if not inserted:
        dup = await transaction_collection.find_one({"gateway_tx_id": gateway_tx_id})
        if dup:
            return dup
        dup_event = await payment_gateway_events_collection.find_one({"event_id": clean_event_id})
        if dup_event:
            return {"status": "duplicate", "event_id": clean_event_id, "processed": True}
        raise HTTPException(status_code=409, detail="Duplicate gateway event without transaction")

    thon_amount = usd_to_thon(amount_usd)
    tx_id = _new_tx_id()
    now = utc_iso()
    tx_doc = {
        "id": tx_id,
        "transaction_id": tx_id,
        "user_id": clean_user,
        "amount": thon_amount,
        "amount_usd": round(float(amount_usd), 2),
        "thon_amount": thon_amount,
        "currency": ET_CURRENCY,
        "type": TX_TYPE_DEPOSIT,
        "status": TX_STATUS_PENDING,
        "gateway": gateway,
        "gateway_tx_id": gateway_tx_id,
        "idempotency_key": idempotency_key,
        "note": note or f"USD deposit via {gateway}",
        "meta": meta or {},
        "created_at": now,
        "cleared_at": None,
    }

    try:
        await transaction_collection.insert_one(tx_doc)
    except DuplicateKeyError:
        existing = await transaction_collection.find_one({"gateway_tx_id": gateway_tx_id})
        return existing or tx_doc

    await ensure_wallet(clean_user)
    result = await wallet_collection.find_one_and_update(
        {"user_id": clean_user},
        {
            "$inc": {f"balances.{ET_CURRENCY}.{BALANCE_PENDING}": thon_amount},
            "$set": {"currency": FIAT_CURRENCY, "updated_at": now},
        },
        return_document=True,
    )
    if not result:
        await transaction_collection.delete_one({"transaction_id": tx_id})
        raise HTTPException(status_code=500, detail="Wallet update failed after transaction insert")

    await wallet_collection.update_one(
        {"user_id": clean_user},
        {"$set": {**thon_balance_fields(result.get("balances", {})), "updated_at": now}},
    )
    return tx_doc


async def settle_pending_deposit(tx_id: str, admin_note: str = "") -> dict:
    """Move pending Thon → available atomically for a single deposit transaction."""
    tx = await transaction_collection.find_one(
        {"transaction_id": tx_id, "type": TX_TYPE_DEPOSIT, "status": TX_STATUS_PENDING}
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Pending deposit transaction not found")

    user_id = tx["user_id"]
    thon_amount = thon_amount_from_record(tx)
    if thon_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid transaction amount")

    wallet = await wallet_collection.find_one({"user_id": user_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    pending = float((wallet.get("balances", {}).get(ET_CURRENCY) or {}).get(BALANCE_PENDING, 0.0))
    if pending < thon_amount:
        raise HTTPException(status_code=400, detail="Insufficient pending balance for settlement")

    now = utc_iso()
    updated_wallet = await wallet_collection.find_one_and_update(
        {
            "user_id": user_id,
            f"balances.{ET_CURRENCY}.{BALANCE_PENDING}": {"$gte": thon_amount},
        },
        {
            "$inc": {
                f"balances.{ET_CURRENCY}.{BALANCE_PENDING}": -thon_amount,
                f"balances.{ET_CURRENCY}.{BALANCE_AVAILABLE}": thon_amount,
            },
            "$set": {"updated_at": now},
        },
        return_document=True,
    )
    if not updated_wallet:
        raise HTTPException(status_code=409, detail="Concurrent settlement conflict — retry")

    await wallet_collection.update_one(
        {"user_id": user_id},
        {"$set": {**thon_balance_fields(updated_wallet.get("balances", {})), "updated_at": now}},
    )

    updated_tx = await transaction_collection.find_one_and_update(
        {"transaction_id": tx_id, "type": TX_TYPE_DEPOSIT, "status": TX_STATUS_PENDING},
        {
            "$set": {
                "status": TX_STATUS_COMPLETED,
                "cleared_at": now,
                **({"meta.admin_note": admin_note} if admin_note else {}),
            }
        },
        return_document=True,
    )
    if not updated_tx:
        raise HTTPException(status_code=409, detail="Deposit already settled or concurrent update")

    tx["status"] = TX_STATUS_COMPLETED
    tx["cleared_at"] = now
    return tx


def settlement_cutoff_iso(hold_hours: float) -> str:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hold_hours)
    return cutoff.replace(tzinfo=None).isoformat()


async def find_deposits_ready_for_settlement(limit: int = 100) -> list[dict]:
    settings = get_payment_settings()
    cutoff = settlement_cutoff_iso(settings.hold_hours)
    cursor = transaction_collection.find(
        {
            "type": TX_TYPE_DEPOSIT,
            "status": TX_STATUS_PENDING,
            "created_at": {"$lte": cutoff},
        }
    ).sort("created_at", 1).limit(limit)
    return await cursor.to_list(length=limit)


async def run_settlement_batch(limit: int = 100) -> list[str]:
    rows = await find_deposits_ready_for_settlement(limit=limit)
    settled: list[str] = []
    for row in rows:
        tx_id = str(row.get("transaction_id") or row.get("id") or "")
        if not tx_id:
            continue
        try:
            await settle_pending_deposit(tx_id)
            settled.append(tx_id)
        except HTTPException:
            continue
    return settled
