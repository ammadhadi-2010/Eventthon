"""Payment gateway configuration — test/production via environment only."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Literal

GatewayProvider = Literal["stripe", "lemonsqueezy", "mock"]


@dataclass(frozen=True)
class PaymentSettings:
    mode: Literal["test", "live"]
    active_gateway: GatewayProvider
    thon_per_usd: float
    hold_hours: float
    success_url: str
    cancel_url: str
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    lemonsqueezy_api_key: str
    lemonsqueezy_store_id: str
    lemonsqueezy_webhook_secret: str
    lemonsqueezy_variant_id: str


def _mode() -> Literal["test", "live"]:
    raw = os.getenv("PAYMENT_MODE", "test").strip().lower()
    return "live" if raw == "live" else "test"


def get_payment_settings() -> PaymentSettings:
    mode = _mode()
    gateway = os.getenv("PAYMENT_GATEWAY", "stripe").strip().lower()
    if gateway not in {"stripe", "lemonsqueezy", "mock"}:
        gateway = "stripe"

    prefix = "STRIPE_LIVE" if mode == "live" else "STRIPE_TEST"
    ls_prefix = "LEMONSQUEEZY_LIVE" if mode == "live" else "LEMONSQUEEZY_TEST"
    thon_rate = os.getenv("THON_PER_USD") or os.getenv("ET_COINS_PER_USD") or "100"

    return PaymentSettings(
        mode=mode,
        active_gateway=gateway,  # type: ignore[arg-type]
        thon_per_usd=float(thon_rate),
        hold_hours=float(os.getenv("PAYMENT_HOLD_HOURS", "48")),
        success_url=os.getenv("PAYMENT_SUCCESS_URL", "http://localhost:3000/wallet?deposit=success"),
        cancel_url=os.getenv("PAYMENT_CANCEL_URL", "http://localhost:3000/wallet?deposit=cancelled"),
        stripe_secret_key=os.getenv(f"{prefix}_SECRET_KEY", os.getenv("STRIPE_SECRET_KEY", "")),
        stripe_publishable_key=os.getenv(
            f"{prefix}_PUBLISHABLE_KEY", os.getenv("STRIPE_PUBLISHABLE_KEY", "")
        ),
        stripe_webhook_secret=os.getenv(
            f"{prefix}_WEBHOOK_SECRET", os.getenv("STRIPE_WEBHOOK_SECRET", "")
        ),
        lemonsqueezy_api_key=os.getenv(f"{ls_prefix}_API_KEY", os.getenv("LEMONSQUEEZY_API_KEY", "")),
        lemonsqueezy_store_id=os.getenv(f"{ls_prefix}_STORE_ID", os.getenv("LEMONSQUEEZY_STORE_ID", "")),
        lemonsqueezy_webhook_secret=os.getenv(
            f"{ls_prefix}_WEBHOOK_SECRET", os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET", "")
        ),
        lemonsqueezy_variant_id=os.getenv(
            f"{ls_prefix}_VARIANT_ID", os.getenv("LEMONSQUEEZY_VARIANT_ID", "")
        ),
    )


def public_payment_config() -> dict:
    settings = get_payment_settings()
    return {
        "mode": settings.mode,
        "gateway": settings.active_gateway,
        "thon_per_usd": settings.thon_per_usd,
        "hold_hours": settings.hold_hours,
        "stripe_publishable_key": settings.stripe_publishable_key or None,
        "supports_apple_pay": settings.active_gateway == "stripe",
        "supports_google_pay": settings.active_gateway == "stripe",
    }
