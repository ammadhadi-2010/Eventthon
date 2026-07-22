"""Merge duplicate wallet documents so user_id can be indexed uniquely."""

from __future__ import annotations

import logging
from typing import Any

from database import wallet_collection

from backend_routes.finance.wallet_core import (
    DEFAULT_BALANCES,
    empty_balance_buckets,
    thon_balance_fields,
    utc_iso,
)

logger = logging.getLogger(__name__)


def _wallet_score(doc: dict) -> tuple[float, int, str]:
    balances = doc.get("balances") or {}
    total = 0.0
    for buckets in balances.values():
        if isinstance(buckets, dict):
            for key in ("available", "pending", "locked"):
                total += float(buckets.get(key, 0) or 0)
    banks = len(doc.get("bank_accounts") or [])
    updated = str(doc.get("updated_at") or doc.get("created_at") or "")
    return total, banks, updated


def _merge_balances(docs: list[dict]) -> dict:
    merged = {k: empty_balance_buckets() for k in DEFAULT_BALANCES}
    for doc in docs:
        for currency, buckets in (doc.get("balances") or {}).items():
            if not isinstance(buckets, dict):
                continue
            if currency not in merged:
                merged[currency] = empty_balance_buckets()
            for key in ("available", "pending", "locked"):
                merged[currency][key] = round(
                    float(merged[currency].get(key, 0)) + float(buckets.get(key, 0) or 0),
                    8,
                )
    return merged


def _merge_bank_accounts(docs: list[dict]) -> list[Any]:
    seen: set[str] = set()
    accounts: list[Any] = []
    for doc in docs:
        for account in doc.get("bank_accounts") or []:
            key = str(account.get("id") or account.get("account_number") or account)
            if key in seen:
                continue
            seen.add(key)
            accounts.append(account)
    return accounts


async def dedupe_wallet_user_ids() -> int:
    pipeline = [
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gt": 1}, "_id": {"$ne": None}}},
    ]
    removed = 0
    async for group in wallet_collection.aggregate(pipeline):
        user_id = group["_id"]
        docs = await wallet_collection.find({"user_id": user_id}).to_list(length=100)
        if len(docs) <= 1:
            continue
        docs.sort(key=_wallet_score, reverse=True)
        canonical = docs[0]
        others = docs[1:]
        merged_balances = _merge_balances(docs)
        merged_banks = _merge_bank_accounts(docs)
        await wallet_collection.update_one(
            {"_id": canonical["_id"]},
            {
                "$set": {
                    "balances": merged_balances,
                    "bank_accounts": merged_banks,
                    **thon_balance_fields(merged_balances),
                    "updated_at": utc_iso(),
                }
            },
        )
        for dup in others:
            result = await wallet_collection.delete_one({"_id": dup["_id"]})
            removed += result.deleted_count
        logger.warning(
            "Merged %d duplicate wallet(s) for user_id=%s (kept _id=%s)",
            len(others),
            user_id,
            canonical["_id"],
        )
    if removed:
        logger.info("Wallet deduplication removed %d duplicate document(s).", removed)
    return removed
