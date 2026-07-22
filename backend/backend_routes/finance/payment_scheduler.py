"""Background job: release pending deposits to available after hold period."""

from __future__ import annotations

import asyncio
import logging
import os

from backend_routes.finance.ledger_service import run_settlement_batch

logger = logging.getLogger(__name__)

_task: asyncio.Task | None = None
_INTERVAL_SEC = int(os.getenv("PAYMENT_SETTLEMENT_INTERVAL_SEC", "3600"))


async def _settlement_loop() -> None:
    while True:
        try:
            settled = await run_settlement_batch(limit=200)
            if settled:
                logger.info("Payment settlement released %s deposit(s)", len(settled))
        except Exception as exc:
            logger.warning("Payment settlement tick failed: %s", exc)
        await asyncio.sleep(_INTERVAL_SEC)


def start_payment_settlement_scheduler() -> None:
    global _task
    if _task and not _task.done():
        return
    _task = asyncio.create_task(_settlement_loop())
    logger.info("Payment settlement scheduler started (interval=%ss)", _INTERVAL_SEC)


def stop_payment_settlement_scheduler() -> None:
    global _task
    if _task and not _task.done():
        _task.cancel()
    _task = None
