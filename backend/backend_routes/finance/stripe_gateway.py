"""Stripe Checkout Session creation (Cards, Apple Pay, Google Pay)."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException

from backend_routes.finance.ledger_service import usd_to_thon
from backend_routes.finance.payment_config import PaymentSettings


def _import_stripe():
    try:
        import stripe
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Stripe SDK not installed. Run: pip install stripe",
        ) from exc
    return stripe


def create_stripe_checkout_session(
    settings: PaymentSettings,
    *,
    user_id: str,
    amount_usd: float,
    success_url: Optional[str],
    cancel_url: Optional[str],
) -> dict:
    stripe = _import_stripe()
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe secret key not configured")

    stripe.api_key = settings.stripe_secret_key
    amount_cents = int(round(amount_usd * 100))
    if amount_cents < 50:
        raise HTTPException(status_code=400, detail="Minimum deposit is $0.50 USD")

    idempotency_key = f"chk-{uuid.uuid4().hex}"
    thon_amount = usd_to_thon(amount_usd)

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": amount_cents,
                    "product_data": {
                        "name": "EventThon Thon Wallet Deposit",
                        "description": f"{thon_amount:,.0f} Thon (pending settlement)",
                    },
                },
                "quantity": 1,
            }
        ],
        success_url=success_url or settings.success_url,
        cancel_url=cancel_url or settings.cancel_url,
        client_reference_id=user_id,
        metadata={
            "user_id": user_id,
            "amount_usd": str(amount_usd),
            "thon_amount": str(thon_amount),
            "idempotency_key": idempotency_key,
        },
        payment_intent_data={
            "metadata": {
                "user_id": user_id,
                "amount_usd": str(amount_usd),
                "thon_amount": str(thon_amount),
                "idempotency_key": idempotency_key,
            }
        },
    )
    return {
        "checkout_url": session.url,
        "session_id": session.id,
        "idempotency_key": idempotency_key,
        "gateway": "stripe",
        "amount_usd": amount_usd,
        "thon_amount": thon_amount,
    }


def verify_stripe_webhook(payload: bytes, sig_header: str, webhook_secret: str) -> dict:
    stripe = _import_stripe()
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")
    if not sig_header or not str(sig_header).strip():
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")
    try:
        return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook payload") from exc
