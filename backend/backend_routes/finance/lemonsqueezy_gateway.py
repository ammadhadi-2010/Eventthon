"""LemonSqueezy checkout + webhook verification."""

from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from typing import Optional

import httpx
from fastapi import HTTPException

from backend_routes.finance.ledger_service import usd_to_thon
from backend_routes.finance.payment_config import PaymentSettings

LS_API = "https://api.lemonsqueezy.com/v1"


def create_lemonsqueezy_checkout(
    settings: PaymentSettings,
    *,
    user_id: str,
    amount_usd: float,
    success_url: Optional[str],
    cancel_url: Optional[str],
) -> dict:
    if not settings.lemonsqueezy_api_key or not settings.lemonsqueezy_store_id:
        raise HTTPException(status_code=503, detail="LemonSqueezy not configured")

    idempotency_key = f"ls-{uuid.uuid4().hex}"
    thon_amount = usd_to_thon(amount_usd)
    variant_id = settings.lemonsqueezy_variant_id
    if not variant_id:
        raise HTTPException(status_code=503, detail="LEMONSQUEEZY_VARIANT_ID required for checkout")

    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "custom": {
                        "user_id": user_id,
                        "amount_usd": str(amount_usd),
                        "thon_amount": str(thon_amount),
                        "idempotency_key": idempotency_key,
                    },
                },
                "product_options": {
                    "redirect_url": success_url or settings.success_url,
                },
            },
            "relationships": {
                "store": {"data": {"type": "stores", "id": str(settings.lemonsqueezy_store_id)}},
                "variant": {"data": {"type": "variants", "id": str(variant_id)}},
            },
        }
    }
    headers = {
        "Authorization": f"Bearer {settings.lemonsqueezy_api_key}",
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
    }
    with httpx.Client(timeout=30.0) as client:
        res = client.post(f"{LS_API}/checkouts", headers=headers, json=payload)
    if res.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"LemonSqueezy checkout failed: {res.text[:200]}")

    body = res.json()
    attrs = (body.get("data") or {}).get("attributes") or {}
    return {
        "checkout_url": attrs.get("url") or "",
        "session_id": str((body.get("data") or {}).get("id") or idempotency_key),
        "idempotency_key": idempotency_key,
        "gateway": "lemonsqueezy",
        "amount_usd": amount_usd,
        "thon_amount": thon_amount,
    }


def verify_lemonsqueezy_signature(raw_body: bytes, signature: str, secret: str) -> dict:
    if not secret:
        raise HTTPException(status_code=503, detail="LemonSqueezy webhook secret not configured")
    if not signature or not str(signature).strip():
        raise HTTPException(status_code=400, detail="Missing X-Signature header")
    digest = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(digest, signature or ""):
        raise HTTPException(status_code=400, detail="Invalid LemonSqueezy webhook signature")
    try:
        return json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid LemonSqueezy JSON payload") from exc
