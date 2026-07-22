"""Escrow hold, release, and refund routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from database import escrow_collection
from backend_routes.finance.ledger_constants import TX_STATUS_COMPLETED, TX_TYPE_ESCROW, ET_CURRENCY
from backend_routes.finance.wallet_auth import require_wallet_owner, resolve_authenticated_user
from backend_routes.finance.wallet_core import ensure_wallet, normalize_currency, utc_iso
from backend_routes.finance.wallet_models import EscrowHoldPayload
from backend_routes.finance.wallet_operations import apply_balance_delta
from backend_routes.finance.wallet_transactions import record_transaction

router = APIRouter()


@router.post("/deals/escrow/hold")
async def escrow_hold(payload: EscrowHoldPayload, _actor=Depends(resolve_authenticated_user)):
    amount = round(float(payload.amount), 8)
    currency = normalize_currency(payload.currency)
    existing = await escrow_collection.find_one({"deal_id": payload.deal_id})
    if existing and existing.get("status") in {"held", "released"}:
        raise HTTPException(status_code=400, detail="Escrow already exists for this deal")

    await apply_balance_delta(
        payload.buyer_user_id,
        currency,
        available=-amount,
        locked=amount,
        require_available=amount,
    )
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
    await record_transaction(
        user_id=payload.buyer_user_id,
        tx_type=TX_TYPE_ESCROW,
        thon_amount=amount,
        status=TX_STATUS_COMPLETED,
        currency=currency,
        note=payload.note or f"Escrow hold {payload.deal_id}",
        meta={"deal_id": payload.deal_id, "action": "hold"},
    )
    return {"status": "success", "data": escrow_doc}


@router.post("/deals/escrow/release/{deal_id}")
async def escrow_release(deal_id: str, _actor=Depends(resolve_authenticated_user)):
    escrow = await escrow_collection.find_one({"deal_id": deal_id})
    if not escrow or escrow.get("status") != "held":
        raise HTTPException(status_code=404, detail="Active escrow not found")
    amount = round(float(escrow.get("amount", 0.0)), 8)
    currency = normalize_currency(escrow.get("currency"))
    buyer = escrow.get("buyer_user_id")
    seller = escrow.get("seller_user_id")
    await apply_balance_delta(buyer, currency, locked=-amount, require_locked=amount)
    await apply_balance_delta(seller, currency, available=amount)
    await escrow_collection.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "released", "updated_at": utc_iso()}},
    )
    await record_transaction(
        user_id=seller,
        tx_type=TX_TYPE_ESCROW,
        thon_amount=amount,
        status=TX_STATUS_COMPLETED,
        currency=currency,
        note=f"Escrow release {deal_id}",
        meta={"deal_id": deal_id, "action": "release_in"},
    )
    return {"status": "success", "message": "Escrow released"}


@router.post("/deals/escrow/refund/{deal_id}")
async def escrow_refund(deal_id: str, _actor=Depends(resolve_authenticated_user)):
    escrow = await escrow_collection.find_one({"deal_id": deal_id})
    if not escrow or escrow.get("status") != "held":
        raise HTTPException(status_code=404, detail="Active escrow not found")
    amount = round(float(escrow.get("amount", 0.0)), 8)
    currency = normalize_currency(escrow.get("currency"))
    buyer = escrow.get("buyer_user_id")
    await apply_balance_delta(buyer, currency, locked=-amount, available=amount, require_locked=amount)
    await escrow_collection.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "refunded", "updated_at": utc_iso()}},
    )
    await record_transaction(
        user_id=buyer,
        tx_type=TX_TYPE_ESCROW,
        thon_amount=amount,
        status=TX_STATUS_COMPLETED,
        currency=currency,
        note=f"Escrow refund {deal_id}",
        meta={"deal_id": deal_id, "action": "refund"},
    )
    return {"status": "success", "message": "Escrow refunded"}


@router.get("/deals/{deal_id}")
async def get_deal_escrow(deal_id: str, _actor=Depends(resolve_authenticated_user)):
    escrow = await escrow_collection.find_one({"deal_id": deal_id})
    if not escrow:
        return {"status": "error", "message": "Deal not found"}
    escrow["_id"] = str(escrow["_id"])
    return {"status": "success", "data": escrow}
