"""Checkout initiation and settlement admin APIs."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from pymongo.errors import DuplicateKeyError

from database import payment_checkout_sessions_collection
from backend_routes.security.input_sanitize import reject_mongo_operators, sanitize_user_id

from database import payment_checkout_sessions_collection
from backend_routes.auth.admin_guard import admin_guard
from backend_routes.finance.ledger_service import run_settlement_batch, settle_pending_deposit, credit_pending_deposit_idempotent
from backend_routes.finance.payment_config import get_payment_settings, public_payment_config
from backend_routes.finance.payment_gateway_factory import create_checkout_session
from backend_routes.finance.payment_schemas import (
    CheckoutDepositRequest,
    CheckoutDepositResponse,
    SettleTransactionRequest,
    SettlementBatchResponse,
)
from backend_routes.finance.wallet import ensure_wallet, utc_iso

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/config")
async def payment_public_config():
    return {"status": "success", "data": public_payment_config()}


@router.post("/checkout/deposit", response_model=CheckoutDepositResponse)
async def initiate_deposit_checkout(payload: CheckoutDepositRequest):
    reject_mongo_operators(payload.model_dump())
    user_id = sanitize_user_id(payload.user_id)

    await ensure_wallet(user_id)
    settings = get_payment_settings()
    session = create_checkout_session(
        settings,
        user_id=user_id,
        amount_usd=payload.amount_usd,
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
        gateway_override=payload.gateway,
    )

    try:
        await payment_checkout_sessions_collection.insert_one(
            {
                "session_id": session["session_id"],
                "user_id": user_id,
                "gateway": session["gateway"],
                "amount_usd": session["amount_usd"],
                "thon_amount": session["thon_amount"],
                "idempotency_key": session["idempotency_key"],
                "status": "created",
                "created_at": utc_iso(),
            }
        )
    except DuplicateKeyError:
        pass

    if session.get("gateway") == "mock":
        await credit_pending_deposit_idempotent(
            user_id=user_id,
            amount_usd=session["amount_usd"],
            gateway="mock",
            gateway_tx_id=session["session_id"],
            idempotency_key=session["idempotency_key"],
            event_id=f"mock-{session['session_id']}",
            event_type="mock.checkout.completed",
            meta={"mock": True},
        )
        await payment_checkout_sessions_collection.update_one(
            {"session_id": session["session_id"]},
            {"$set": {"status": "completed"}},
        )

    return CheckoutDepositResponse(
        checkout_url=session["checkout_url"],
        session_id=session["session_id"],
        gateway=session["gateway"],
        amount_usd=session["amount_usd"],
        thon_amount=session["thon_amount"],
        idempotency_key=session["idempotency_key"],
    )


@router.post("/admin/settle", response_model=SettlementBatchResponse)
async def admin_settle_single(
    payload: SettleTransactionRequest,
    _admin: dict = Depends(admin_guard),
):
    tx = await settle_pending_deposit(payload.transaction_id, admin_note=payload.admin_note or "")
    return SettlementBatchResponse(status="success", settled_count=1, transaction_ids=[tx["transaction_id"]])


@router.post("/admin/settle-batch", response_model=SettlementBatchResponse)
async def admin_settle_batch(
    limit: int = 100,
    _admin: dict = Depends(admin_guard),
):
    settled = await run_settlement_batch(limit=max(1, min(limit, 500)))
    return SettlementBatchResponse(status="success", settled_count=len(settled), transaction_ids=settled)
