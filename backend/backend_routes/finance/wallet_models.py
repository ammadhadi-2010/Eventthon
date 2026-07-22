"""Pydantic payloads for wallet API routes."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class AmountPayload(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = "THON"
    note: Optional[str] = None
    withdrawal_pin: Optional[str] = None


class TransferPayload(BaseModel):
    from_user_id: str
    to_user_id: str
    amount: float = Field(..., gt=0)
    currency: str = "THON"
    note: Optional[str] = None


class EscrowHoldPayload(BaseModel):
    deal_id: str
    buyer_user_id: str
    seller_user_id: str
    amount: float = Field(..., gt=0)
    currency: str = "THON"
    note: Optional[str] = None


class UpdateSecurityPayload(BaseModel):
    kyc_verified: Optional[bool] = None
    two_factor_enabled: Optional[bool] = None
    withdrawal_pin_enabled: Optional[bool] = None
    login_alerts: Optional[bool] = None
    withdrawal_pin: Optional[str] = None


class UpdatePreferencesPayload(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    base_currency: Optional[str] = None
    compact_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None


class BankAccountPayload(BaseModel):
    type: str = "Bank"
    title: str = "Untitled"
    number: str = ""
    is_primary: bool = False
