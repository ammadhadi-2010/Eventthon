"""Admin wallet oversight — stats, settlements, withdrawals."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from database import transaction_collection, user_collection, wallet_collection
from backend_routes.auth.admin_guard import admin_guard
from backend_routes.finance.ledger_constants import TX_STATUS_PENDING, TX_TYPE_DEPOSIT, TX_TYPE_WITHDRAWAL
from backend_routes.finance.ledger_service import (
    credit_pending_deposit_idempotent,
    run_settlement_batch,
    settle_pending_deposit,
)
from backend_routes.finance.wallet_transactions import thon_amount_from_record
from backend_routes.finance.payment_schemas import SettleTransactionRequest, SettlementBatchResponse
from backend_routes.finance.wallet_core import ensure_wallet, sanitize_wallet
from backend_routes.finance.wallet_operations import approve_withdrawal, reject_withdrawal

router = APIRouter(prefix="/wallet", tags=["Admin Wallet"])


class WithdrawActionRequest(BaseModel):
    transaction_id: str
    admin_note: Optional[str] = None


def _iso_day_start() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0).replace(tzinfo=None).isoformat()


def _user_display(user: Optional[dict]) -> str:
    if not user:
        return "Platform User"
    name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
    return name or user.get("email") or user.get("mobile") or "Platform User"


def _format_tx_row(tx: dict, index: int, user: Optional[dict] = None) -> dict[str, Any]:
    thon = thon_amount_from_record(tx)
    return {
        "transaction_id": str(tx.get("transaction_id") or tx.get("id") or f"tx-{index}"),
        "user_id": str(tx.get("user_id") or ""),
        "user": _user_display(user),
        "type": str(tx.get("type") or "Transaction"),
        "amount_usd": float(tx.get("amount_usd") or 0),
        "thon_amount": thon,
        "amount_label": f"{thon:,.0f} Thon",
        "status": str(tx.get("status") or "Pending"),
        "gateway": str(tx.get("gateway") or ""),
        "created_at": tx.get("created_at"),
        "cleared_at": tx.get("cleared_at"),
    }


async def _resolve_user(user_id: str) -> Optional[dict]:
    uid = str(user_id or "").strip()
    if not uid:
        return None
    return await user_collection.find_one(
        {"$or": [{"user_id": uid}, {"_id": uid}, {"mobile": uid}, {"email": uid}]}
    )


@router.get("/stats")
async def wallet_platform_stats(_admin: dict = Depends(admin_guard)):
    agg = await wallet_collection.aggregate(
        [
            {
                "$project": {
                    "available": {"$ifNull": ["$balances.THON.available", 0]},
                    "pending": {"$ifNull": ["$balances.THON.pending", 0]},
                    "locked": {"$ifNull": ["$balances.THON.locked", 0]},
                }
            },
            {
                "$group": {
                    "_id": None,
                    "available_thon": {"$sum": "$available"},
                    "pending_thon": {"$sum": "$pending"},
                    "locked_thon": {"$sum": "$locked"},
                    "wallet_count": {"$sum": 1},
                }
            },
        ]
    ).to_list(length=1)
    totals = agg[0] if agg else {}
    pending_deposits = await transaction_collection.count_documents(
        {"type": TX_TYPE_DEPOSIT, "status": TX_STATUS_PENDING}
    )
    pending_withdrawals = await transaction_collection.count_documents(
        {"type": TX_TYPE_WITHDRAWAL, "status": TX_STATUS_PENDING}
    )
    today_start = _iso_day_start()
    deposits_today = await transaction_collection.count_documents(
        {"type": TX_TYPE_DEPOSIT, "created_at": {"$gte": today_start}}
    )
    return {
        "status": "success",
        "data": {
            "wallet_count": int(totals.get("wallet_count", 0)),
            "available_thon": round(float(totals.get("available_thon", 0)), 2),
            "pending_thon": round(float(totals.get("pending_thon", 0)), 2),
            "locked_thon": round(float(totals.get("locked_thon", 0)), 2),
            "pending_deposits": pending_deposits,
            "pending_withdrawals": pending_withdrawals,
            "deposits_today": deposits_today,
        },
    }


@router.get("/pending")
async def list_pending_deposits(
    limit: int = Query(100, ge=1, le=500),
    _admin: dict = Depends(admin_guard),
):
    docs = await transaction_collection.find(
        {"type": TX_TYPE_DEPOSIT, "status": TX_STATUS_PENDING}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    rows = [_format_tx_row(tx, i, await _resolve_user(str(tx.get("user_id") or ""))) for i, tx in enumerate(docs)]
    return {"status": "success", "rows": rows, "total": len(rows)}


@router.get("/withdrawals/pending")
async def list_pending_withdrawals(
    limit: int = Query(100, ge=1, le=500),
    _admin: dict = Depends(admin_guard),
):
    docs = await transaction_collection.find(
        {"type": TX_TYPE_WITHDRAWAL, "status": TX_STATUS_PENDING}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    rows = [_format_tx_row(tx, i, await _resolve_user(str(tx.get("user_id") or ""))) for i, tx in enumerate(docs)]
    return {"status": "success", "rows": rows, "total": len(rows)}


@router.get("/transactions")
async def list_wallet_transactions(
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None),
    tx_type: Optional[str] = Query(None, alias="type"),
    _admin: dict = Depends(admin_guard),
):
    query: dict[str, Any] = {}
    if status:
        query["status"] = status
    if tx_type:
        query["type"] = tx_type
    docs = await transaction_collection.find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
    rows = [_format_tx_row(tx, i, await _resolve_user(str(tx.get("user_id") or ""))) for i, tx in enumerate(docs)]
    return {"status": "success", "rows": rows, "total": len(rows)}


@router.get("/users/{user_id}")
async def admin_user_wallet(
    user_id: str,
    tx_limit: int = Query(30, ge=1, le=200),
    _admin: dict = Depends(admin_guard),
):
    user = await _resolve_user(user_id)
    resolved_id = str((user or {}).get("user_id") or user_id).strip()
    wallet = sanitize_wallet(await ensure_wallet(resolved_id))
    txs = await transaction_collection.find({"user_id": resolved_id}).sort("created_at", -1).limit(tx_limit).to_list(length=tx_limit)
    tx_rows = [_format_tx_row(tx, i, user) for i, tx in enumerate(txs)]
    return {
        "status": "success",
        "data": {"user": {"user_id": resolved_id, "name": _user_display(user), "email": (user or {}).get("email"), "mobile": (user or {}).get("mobile")}, "wallet": wallet, "transactions": tx_rows},
    }


@router.post("/settle", response_model=SettlementBatchResponse)
async def admin_settle_deposit(payload: SettleTransactionRequest, _admin: dict = Depends(admin_guard)):
    tx = await settle_pending_deposit(payload.transaction_id, admin_note=payload.admin_note or "")
    return SettlementBatchResponse(status="success", settled_count=1, transaction_ids=[tx["transaction_id"]])


@router.post("/settle-batch", response_model=SettlementBatchResponse)
async def admin_settle_batch(limit: int = Query(100, ge=1, le=500), _admin: dict = Depends(admin_guard)):
    settled = await run_settlement_batch(limit=limit)
    return SettlementBatchResponse(status="success", settled_count=len(settled), transaction_ids=settled)


@router.post("/withdrawals/approve")
async def admin_approve_withdrawal(payload: WithdrawActionRequest, _admin: dict = Depends(admin_guard)):
    tx = await approve_withdrawal(payload.transaction_id, admin_note=payload.admin_note or "")
    return {"status": "success", "transaction_id": tx["transaction_id"]}


@router.post("/withdrawals/reject")
async def admin_reject_withdrawal(payload: WithdrawActionRequest, _admin: dict = Depends(admin_guard)):
    tx = await reject_withdrawal(payload.transaction_id, admin_note=payload.admin_note or "")
    return {"status": "success", "transaction_id": tx["transaction_id"]}
