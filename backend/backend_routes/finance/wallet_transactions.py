"""Unified wallet transaction records."""

from __future__ import annotations

import uuid
from typing import Any, Optional

from database import transaction_collection
from backend_routes.finance.ledger_constants import ET_CURRENCY, TX_STATUS_COMPLETED
from backend_routes.finance.wallet_core import utc_iso


def new_transaction_id() -> str:
    return f"tx-{uuid.uuid4().hex[:12]}"


def thon_amount_from_record(record: dict) -> float:
    return float(record.get("thon_amount") or record.get("et_coins") or record.get("amount") or 0.0)


async def record_transaction(
    *,
    user_id: str,
    tx_type: str,
    thon_amount: float,
    status: str = TX_STATUS_COMPLETED,
    currency: str = ET_CURRENCY,
    note: str = "",
    meta: Optional[dict] = None,
    amount_usd: Optional[float] = None,
    gateway: str = "",
    gateway_tx_id: str = "",
    idempotency_key: str = "",
) -> dict:
    tx_id = new_transaction_id()
    amount = round(float(thon_amount), 8)
    doc = {
        "id": tx_id,
        "transaction_id": tx_id,
        "user_id": user_id,
        "amount": amount,
        "thon_amount": amount,
        "amount_usd": round(float(amount_usd), 2) if amount_usd is not None else None,
        "currency": currency,
        "type": tx_type,
        "status": status,
        "gateway": gateway or None,
        "gateway_tx_id": gateway_tx_id or None,
        "idempotency_key": idempotency_key or None,
        "note": note or "",
        "meta": meta or {},
        "created_at": utc_iso(),
        "cleared_at": utc_iso() if status == TX_STATUS_COMPLETED else None,
    }
    await transaction_collection.insert_one(doc)
    return doc


def serialize_transaction(row: dict) -> dict:
    data = dict(row)
    if "_id" in data:
        data["_id"] = str(data["_id"])
    data["transaction_id"] = str(data.get("transaction_id") or data.get("id") or "")
    data["thon_amount"] = thon_amount_from_record(data)
    return data


def build_transaction_query(
    user_id: str,
    *,
    tx_type: Optional[str] = None,
    status: Optional[str] = None,
) -> dict[str, Any]:
    query: dict[str, Any] = {"user_id": user_id}
    if tx_type:
        query["type"] = tx_type
    if status:
        query["status"] = status
    return query
