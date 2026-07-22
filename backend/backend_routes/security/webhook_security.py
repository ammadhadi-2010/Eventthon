"""Webhook signature and idempotency guards."""

from __future__ import annotations

import hmac
import os
from typing import Optional

from fastapi import HTTPException, Request

from database import payment_gateway_events_collection
from backend_routes.security.input_sanitize import sanitize_plain_string, sanitize_positive_amount, sanitize_user_id


def require_stripe_signature(sig_header: Optional[str], webhook_secret: str) -> None:
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")
    if not sig_header or not str(sig_header).strip():
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")


def require_lemonsqueezy_signature(signature: Optional[str], webhook_secret: str) -> None:
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="LemonSqueezy webhook secret not configured")
    if not signature or not str(signature).strip():
        raise HTTPException(status_code=400, detail="Missing X-Signature header")


async def require_mock_webhook_secret(request: Request) -> None:
    expected = os.getenv("MOCK_WEBHOOK_SECRET", "").strip()
    if not expected:
        if os.getenv("PAYMENT_MODE", "test").lower() == "live":
            raise HTTPException(status_code=403, detail="Mock webhook disabled")
        return
    provided = request.headers.get("X-Mock-Webhook-Secret", "")
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=403, detail="Invalid mock webhook secret")


async def find_existing_gateway_event(event_id: str) -> Optional[dict]:
    clean_id = sanitize_plain_string(event_id, field="event_id", max_len=256)
    return await payment_gateway_events_collection.find_one({"event_id": clean_id})


def parse_webhook_amount(value: object) -> float:
    try:
        amount = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return 0.0
    return round(max(0.0, amount), 2)


def parse_webhook_user_id(value: object) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    return sanitize_user_id(text)


def parse_webhook_usd_amount(value: object) -> float:
    amount = parse_webhook_amount(value)
    return sanitize_positive_amount(amount, field="amount_usd", max_val=10_000)
