"""Wallet ledger enums and MongoDB field conventions."""

from __future__ import annotations

# ET coin bucket inside wallets.balances
ET_CURRENCY = "THON"
FIAT_CURRENCY = "USD"

TX_TYPE_DEPOSIT = "Deposit"
TX_TYPE_WITHDRAWAL = "Withdrawal"
TX_TYPE_GIG_PAYMENT = "Gig_Payment"
TX_TYPE_TRANSFER = "Transfer"
TX_TYPE_ESCROW = "Escrow"

TX_STATUS_PENDING = "Pending"
TX_STATUS_COMPLETED = "Completed"
TX_STATUS_FAILED = "Failed"
TX_STATUS_REFUNDED = "Refunded"

BALANCE_AVAILABLE = "available"
BALANCE_PENDING = "pending"
BALANCE_LOCKED = "locked"
