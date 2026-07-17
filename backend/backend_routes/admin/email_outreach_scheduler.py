"""Email Outreach — asyncio background scheduler for sends and inbox replies."""

from __future__ import annotations

import asyncio
import logging

from .email_outreach_replies import ingest_inbox_replies
from .email_outreach_schedule import process_due_scheduled_emails

logger = logging.getLogger(__name__)

_task: asyncio.Task | None = None
REPLY_POLL_SECONDS = 60


async def _scheduler_loop() -> None:
    while True:
        try:
            sent_count = await process_due_scheduled_emails()
            if sent_count:
                logger.info("Outreach scheduler sent %s scheduled email(s)", sent_count)
        except Exception as exc:
            logger.warning("Outreach scheduler tick failed: %s", exc)

        try:
            reply_count = await ingest_inbox_replies()
            if reply_count:
                logger.info("Outreach reply worker ingested %s new reply(ies)", reply_count)
        except Exception as exc:
            logger.warning("Outreach reply worker failed: %s", exc)

        await asyncio.sleep(REPLY_POLL_SECONDS)


def start_outreach_scheduler() -> None:
    global _task
    if _task and not _task.done():
        return
    _task = asyncio.create_task(_scheduler_loop())


def stop_outreach_scheduler() -> None:
    global _task
    if _task and not _task.done():
        _task.cancel()
    _task = None
