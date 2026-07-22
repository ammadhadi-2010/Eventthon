# EventThon Payment Ledger — Database Schema

EventThon uses **MongoDB** (Motor async). A **PostgreSQL equivalent** is documented at the bottom for teams migrating to SQL.

---

## Collection: `wallets`

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string (unique) | Platform user identifier |
| `currency` | string | Default fiat reference (`USD`) |
| `balances.THON.available` | float | Thon ready to spend |
| `balances.THON.pending` | float | Thon awaiting settlement |
| `balances.THON.locked` | float | Thon in escrow / holds |
| `available_thon` | float | Cached mirror of `balances.THON.available` |
| `pending_thon` | float | Cached mirror of `balances.THON.pending` |
| `locked_thon` | float | Cached mirror of `balances.THON.locked` |
| `withdrawable_balance` | float | Cached: `available_thon - locked_thon` |
| `wallet_address` | string | Display / receive address |
| `bank_accounts` | array | Linked payout methods |
| `security` | object | 2FA, PIN flags |
| `created_at` / `updated_at` | ISO8601 | Audit timestamps |

**Indexes:** `{ user_id: 1 }` unique

---

## Collection: `transactions`

| Field | Type | Description |
|-------|------|-------------|
| `transaction_id` | string (unique) | Internal ledger ID |
| `user_id` | string | Owner |
| `amount_usd` | float | Fiat amount for deposits |
| `thon_amount` | float | Thon credited |
| `amount` | float | Back-compat alias of `thon_amount` |
| `currency` | string | `THON` |
| `type` | enum | `Deposit`, `Withdrawal`, `Gig_Payment`, `Transfer`, `Escrow`, … |
| `status` | enum | `Pending`, `Completed`, `Failed`, `Refunded` |
| `gateway` | string | `stripe`, `lemonsqueezy`, … |
| `gateway_tx_id` | string (unique, sparse) | Stripe PI / LS order ID |
| `idempotency_key` | string (unique, sparse) | Webhook dedup key |
| `note` | string | Human-readable label |
| `meta` | object | Gateway payload references |
| `created_at` | ISO8601 | When recorded |
| `cleared_at` | ISO8601 \| null | When pending → available |

**Indexes:** unique on `transaction_id`, `gateway_tx_id`, `idempotency_key`; compound on `(user_id, created_at)`, `(status, type, created_at)`

---

## Collection: `payment_gateway_events`

Idempotency log for webhook retries.

| Field | Type |
|-------|------|
| `event_id` | string (unique) — Stripe `evt_…` or synthetic LS id |
| `provider` | string |
| `event_type` | string |
| `gateway_tx_id` | string |
| `user_id` | string |
| `processed_at` | ISO8601 |

---

## Collection: `payment_checkout_sessions`

| Field | Type |
|-------|------|
| `session_id` | string (unique) |
| `user_id` | string |
| `gateway` | string |
| `amount_usd` / `thon_amount` | float |
| `idempotency_key` | string |
| `status` | `created` \| `completed` |
| `created_at` | ISO8601 |

---

## Dual-stage balance rules

1. **Webhook success** → credit **`pending_thon` only** (never `available_thon`).
2. **Settlement job** (after `PAYMENT_HOLD_HOURS`) or **admin trigger** → atomic move `pending` → `available`.
3. All moves use conditional `find_one_and_update` (`$gte` guard) to reduce race conditions.
4. Duplicate webhook deliveries are ignored via unique `payment_gateway_events.event_id`.

---

## PostgreSQL equivalent (reference)

```sql
CREATE TABLE wallets (
  user_id           TEXT PRIMARY KEY,
  currency          TEXT NOT NULL DEFAULT 'USD',
  available_thon    NUMERIC(18,8) NOT NULL DEFAULT 0,
  pending_thon      NUMERIC(18,8) NOT NULL DEFAULT 0,
  locked_thon       NUMERIC(18,8) NOT NULL DEFAULT 0,
  withdrawable_balance NUMERIC(18,8) GENERATED ALWAYS AS (GREATEST(available_thon - locked_thon, 0)) STORED,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  transaction_id    TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES wallets(user_id),
  amount_usd        NUMERIC(12,2),
  thon_amount       NUMERIC(18,8) NOT NULL,
  type              TEXT NOT NULL,
  status            TEXT NOT NULL,
  gateway_tx_id     TEXT UNIQUE,
  idempotency_key   TEXT UNIQUE,
  gateway           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleared_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_gateway_events ON payment_gateway_events(event_id);
```

Use `SELECT … FOR UPDATE` on wallet rows inside a SQL transaction for settlement.
