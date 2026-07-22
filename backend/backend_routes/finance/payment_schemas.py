"""Pydantic models for payment checkout and settlement APIs."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class CheckoutDepositRequest(BaseModel):
    user_id: str
    amount_usd: float = Field(..., gt=0, le=10000, description="Deposit amount in USD")
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None
    gateway: Optional[Literal["stripe", "lemonsqueezy", "mock"]] = None


class CheckoutDepositResponse(BaseModel):
    status: str = "success"
    checkout_url: str
    session_id: str
    gateway: str
    amount_usd: float
    thon_amount: float
    idempotency_key: str


class SettleTransactionRequest(BaseModel):
    transaction_id: str
    admin_note: Optional[str] = None


class SettlementBatchResponse(BaseModel):
    status: str
    settled_count: int
    transaction_ids: list[str]
