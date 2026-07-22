"""Resolve active payment gateway for checkout."""

from __future__ import annotations

from typing import Optional

from fastapi import HTTPException

from backend_routes.finance.lemonsqueezy_gateway import create_lemonsqueezy_checkout
from backend_routes.finance.payment_config import PaymentSettings
from backend_routes.finance.stripe_gateway import create_stripe_checkout_session
from backend_routes.finance.ledger_service import usd_to_thon


def create_checkout_session(
    settings: PaymentSettings,
    *,
    user_id: str,
    amount_usd: float,
    success_url: Optional[str],
    cancel_url: Optional[str],
    gateway_override: Optional[str] = None,
) -> dict:
    gateway = (gateway_override or settings.active_gateway or "stripe").lower()
    amount_usd = round(float(amount_usd), 2)

    if gateway == "mock":
        thon_amount = usd_to_thon(amount_usd)
        return {
            "checkout_url": success_url or settings.success_url,
            "session_id": f"mock_sess_{user_id}_{amount_usd}",
            "idempotency_key": f"mock-{user_id}-{amount_usd}",
            "gateway": "mock",
            "amount_usd": amount_usd,
            "thon_amount": thon_amount,
            "mock": True,
        }
    if gateway == "lemonsqueezy":
        return create_lemonsqueezy_checkout(
            settings, user_id=user_id, amount_usd=amount_usd,
            success_url=success_url, cancel_url=cancel_url,
        )
    if gateway == "stripe":
        return create_stripe_checkout_session(
            settings, user_id=user_id, amount_usd=amount_usd,
            success_url=success_url, cancel_url=cancel_url,
        )
    raise HTTPException(status_code=400, detail=f"Unsupported gateway: {gateway}")
