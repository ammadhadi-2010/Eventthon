"""MongoDB indexes for idempotent payment processing."""

from __future__ import annotations

import logging

from backend_routes.finance.wallet_dedup import dedupe_wallet_user_ids
from database import (
    escrow_collection,
    payment_checkout_sessions_collection,
    payment_gateway_events_collection,
    transaction_collection,
    wallet_collection,
)

logger = logging.getLogger(__name__)


async def ensure_payment_indexes() -> None:
    await transaction_collection.create_index("transaction_id", unique=True)
    await transaction_collection.create_index("id", unique=True, sparse=True)
    await transaction_collection.create_index("gateway_tx_id", unique=True, sparse=True)
    await transaction_collection.create_index("idempotency_key", unique=True, sparse=True)
    await transaction_collection.create_index([("user_id", 1), ("created_at", -1)])
    await transaction_collection.create_index([("status", 1), ("type", 1), ("created_at", 1)])

    await payment_gateway_events_collection.create_index("event_id", unique=True)
    await payment_gateway_events_collection.create_index("gateway_tx_id")

    await payment_checkout_sessions_collection.create_index("session_id", unique=True)
    await payment_checkout_sessions_collection.create_index([("user_id", 1), ("created_at", -1)])

    await dedupe_wallet_user_ids()
    await wallet_collection.create_index("user_id", unique=True)
    await escrow_collection.create_index("deal_id", unique=True)

    logger.info("Payment ledger indexes ensured.")
