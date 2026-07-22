"""Stripe / LemonSqueezy webhook listeners — credit pending_thon only."""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Request

from backend_routes.finance.ledger_service import credit_pending_deposit_idempotent
from backend_routes.finance.lemonsqueezy_gateway import verify_lemonsqueezy_signature
from backend_routes.finance.payment_config import get_payment_settings
from backend_routes.finance.stripe_gateway import verify_stripe_webhook
from backend_routes.security.webhook_security import (
    find_existing_gateway_event,
    parse_webhook_usd_amount,
    parse_webhook_user_id,
    require_lemonsqueezy_signature,
    require_mock_webhook_secret,
    require_stripe_signature,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments/webhooks", tags=["Payment Webhooks"])


async def _handle_deposit_credit(
    *,
    user_id: str,
    amount_usd: float,
    gateway: str,
    gateway_tx_id: str,
    idempotency_key: str,
    event_id: str,
    event_type: str,
    meta: Optional[dict] = None,
) -> dict:
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id in gateway metadata")
    tx = await credit_pending_deposit_idempotent(
        user_id=user_id,
        amount_usd=amount_usd,
        gateway=gateway,
        gateway_tx_id=gateway_tx_id,
        idempotency_key=idempotency_key,
        event_id=event_id,
        event_type=event_type,
        meta=meta,
    )
    if tx.get("status") == "duplicate":
        logger.info("Duplicate webhook ignored event_id=%s gateway=%s", event_id, gateway)
        return tx
    logger.info(
        "Pending Thon credited to pending_thon user=%s gateway_tx=%s thon=%s",
        user_id, gateway_tx_id, tx.get("thon_amount"),
    )
    return tx


@router.post("/stripe")
async def stripe_webhook(request: Request):
    settings = get_payment_settings()
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    require_stripe_signature(sig, settings.stripe_webhook_secret)
    event = verify_stripe_webhook(payload, sig, settings.stripe_webhook_secret)

    event_id = str(event.get("id") or "").strip()
    if not event_id:
        raise HTTPException(status_code=400, detail="Missing Stripe event id")
    if await find_existing_gateway_event(event_id):
        return {"status": "duplicate", "event_id": event_id}

    event_type = str(event.get("type") or "")
    data_obj = (event.get("data") or {}).get("object") or {}

    if event_type not in {"checkout.session.completed", "payment_intent.succeeded"}:
        return {"status": "ignored", "event_type": event_type}

    metadata = data_obj.get("metadata") or {}
    user_id = parse_webhook_user_id(metadata.get("user_id") or data_obj.get("client_reference_id") or "")
    amount_usd = parse_webhook_usd_amount(metadata.get("amount_usd"))
    if amount_usd <= 0 and event_type == "checkout.session.completed":
        amount_usd = parse_webhook_usd_amount(float(data_obj.get("amount_total", 0)) / 100.0)
    if amount_usd <= 0 and event_type == "payment_intent.succeeded":
        amount_usd = parse_webhook_usd_amount(float(data_obj.get("amount_received", 0)) / 100.0)
    if amount_usd <= 0:
        raise HTTPException(status_code=400, detail="Invalid deposit amount")

    gateway_tx_id = str(data_obj.get("payment_intent") or data_obj.get("id") or event_id)
    idempotency_key = str(metadata.get("idempotency_key") or gateway_tx_id)

    result = await _handle_deposit_credit(
        user_id=user_id,
        amount_usd=amount_usd,
        gateway="stripe",
        gateway_tx_id=gateway_tx_id,
        idempotency_key=idempotency_key,
        event_id=event_id,
        event_type=event_type,
        meta={"stripe_event": event_type},
    )
    if result.get("status") == "duplicate":
        return {"status": "duplicate", "event_id": event_id}
    return {"status": "ok"}


@router.post("/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request):
    settings = get_payment_settings()
    payload = await request.body()
    signature = request.headers.get("X-Signature", "")
    require_lemonsqueezy_signature(signature, settings.lemonsqueezy_webhook_secret)
    body = verify_lemonsqueezy_signature(payload, signature, settings.lemonsqueezy_webhook_secret)

    event_name = str(((body.get("meta") or {}).get("event_name")) or "")
    if event_name not in {"order_created", "subscription_payment_success"}:
        return {"status": "ignored", "event": event_name}

    data = body.get("data") or {}
    attrs = data.get("attributes") or {}
    custom = ((attrs.get("first_order_item") or {}).get("custom") or attrs.get("custom") or {})
    user_id = parse_webhook_user_id(custom.get("user_id") or "")
    amount_usd = parse_webhook_usd_amount(custom.get("amount_usd") or attrs.get("total_usd", 0))
    order_id = str(data.get("id") or event_name)
    idempotency_key = str(custom.get("idempotency_key") or order_id)
    event_id = f"ls-{order_id}-{event_name}"

    if await find_existing_gateway_event(event_id):
        return {"status": "duplicate", "event_id": event_id}

    result = await _handle_deposit_credit(
        user_id=user_id,
        amount_usd=amount_usd,
        gateway="lemonsqueezy",
        gateway_tx_id=order_id,
        idempotency_key=idempotency_key,
        event_id=event_id,
        event_type=event_name,
        meta={"lemonsqueezy_event": event_name},
    )
    if result.get("status") == "duplicate":
        return {"status": "duplicate", "event_id": event_id}
    return {"status": "ok"}


@router.post("/mock")
async def mock_webhook(request: Request):
    """Local/dev mock gateway — credits pending_thon idempotently."""
    settings = get_payment_settings()
    if settings.mode == "live" and settings.active_gateway != "mock":
        raise HTTPException(status_code=403, detail="Mock webhook disabled in live mode")
    await require_mock_webhook_secret(request)

    body = await request.json()
    user_id = parse_webhook_user_id(body.get("user_id") or "")
    amount_usd = parse_webhook_usd_amount(body.get("amount_usd"))
    session_id = str(body.get("session_id") or f"mock-{user_id}-{amount_usd}")
    idempotency_key = str(body.get("idempotency_key") or session_id)
    event_id = f"mock-{session_id}"

    if await find_existing_gateway_event(event_id):
        return {"status": "duplicate", "event_id": event_id}

    result = await _handle_deposit_credit(
        user_id=user_id,
        amount_usd=amount_usd,
        gateway="mock",
        gateway_tx_id=session_id,
        idempotency_key=idempotency_key,
        event_id=event_id,
        event_type="mock.checkout.completed",
        meta={"mock": True},
    )
    if result.get("status") == "duplicate":
        return {"status": "duplicate", "event_id": event_id}
    return {"status": "ok"}
