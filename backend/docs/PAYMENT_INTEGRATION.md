# EventThon International Payments — Integration Workflow

## Architecture overview

```
User → POST /finance/payments/checkout/deposit
     → Stripe Checkout / LemonSqueezy (Cards, Apple Pay, Google Pay via Stripe)
     → Gateway webhook → POST /finance/payments/webhooks/{stripe|lemonsqueezy}
     → Ledger credits pending_thon (balances.THON.pending)
     → Settlement cron OR admin API → available_thon
```

Switch **test ↔ live** with env only (`PAYMENT_MODE=test|live`). No code changes.

---

## Step 1 — Install & configure

```bash
cd backend
pip install -r requirements.txt
```

Copy payment block from `.env.example` into `.env`:

| Variable | Purpose |
|----------|---------|
| `PAYMENT_MODE` | `test` or `live` |
| `PAYMENT_GATEWAY` | `stripe`, `lemonsqueezy`, or `mock` |
| `THON_PER_USD` | Conversion rate (default 100 Thon = $1) |
| `PAYMENT_HOLD_HOURS` | Pending hold before auto-release (default 48h) |
| `STRIPE_TEST_*` | Sandbox keys from Stripe Dashboard |

Restart API. Indexes are created on startup.

---

## Step 2 — Stripe Sandbox

1. Create account at [dashboard.stripe.com](https://dashboard.stripe.com).
2. **Developers → API keys** → copy `sk_test_…` and `pk_test_…`.
3. **Developers → Webhooks → Add endpoint**
   - URL: `https://YOUR_API/finance/payments/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy signing secret → `STRIPE_TEST_WEBHOOK_SECRET`
4. Local testing: `stripe listen --forward-to localhost:8000/finance/payments/webhooks/stripe`

---

## Step 3 — Initiate checkout (frontend / Postman)

```http
POST /finance/payments/checkout/deposit
Content-Type: application/json

{
  "user_id": "USER_MONGO_ID",
  "amount_usd": 25.00,
  "success_url": "http://localhost:3000/wallet?deposit=success",
  "cancel_url": "http://localhost:3000/wallet?deposit=cancelled"
}
```

Response:

```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "gateway": "stripe",
  "amount_usd": 25,
  "thon_amount": 2500,
  "idempotency_key": "chk-..."
}
```

Redirect user to `checkout_url`. Use test card `4242 4242 4242 4242`.

Public config (publishable key only):

```http
GET /finance/payments/config
```

---

## Step 4 — Webhook verification

- Stripe: `stripe.Webhook.construct_event` with raw body + `Stripe-Signature` header.
- LemonSqueezy: HMAC-SHA256 of body vs `X-Signature` header.

On success:

- Insert `payment_gateway_events` (unique `event_id`) — **duplicate events are ignored**.
- Insert `transactions` with `status: Pending`, `gateway_tx_id` unique.
- `$inc` wallet `balances.THON.pending` — **never touches `available`**.

---

## Step 5 — Settlement (pending → available)

**Automatic:** background scheduler every `PAYMENT_SETTLEMENT_INTERVAL_SEC` (default 1h) releases deposits older than `PAYMENT_HOLD_HOURS`.

**Manual (admin, requires JWT admin or `X-User-Email` with admin role):**

```http
POST /finance/payments/admin/settle
Authorization: Bearer <admin_jwt>
{ "transaction_id": "tx-abc123", "admin_note": "Manual approval" }

POST /finance/payments/admin/settle-batch?limit=100
Authorization: Bearer <admin_jwt>
```

Unauthorized requests return **403 Forbidden**.

Settlement uses conditional wallet update: pending must be ≥ amount before decrement/increment.

---

## Step 6 — LemonSqueezy Test Mode

1. Create store + product variant in LemonSqueezy dashboard.
2. Set `PAYMENT_GATEWAY=lemonsqueezy` and test API keys.
3. Webhook URL: `/finance/payments/webhooks/lemonsqueezy`
4. Subscribe to `order_created`.

Custom checkout metadata must include `user_id`, `amount_usd`, `idempotency_key`.

---

## Step 7 — Production cutover

1. Set `PAYMENT_MODE=live`.
2. Configure `STRIPE_LIVE_*` or `LEMONSQUEEZY_LIVE_*` keys.
3. Update webhook endpoints to production URLs (HTTPS required).
4. Verify idempotency: replay same webhook → no double credit.
5. Monitor logs: `Pending Thon credited to pending_thon` and settlement release logs.

---

## API summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finance/payments/config` | Public gateway config |
| POST | `/finance/payments/checkout/deposit` | Start USD deposit checkout |
| POST | `/finance/payments/webhooks/stripe` | Stripe webhook |
| POST | `/finance/payments/webhooks/lemonsqueezy` | LemonSqueezy webhook |
| POST | `/finance/payments/admin/settle` | Manual single settlement (admin) |
| POST | `/finance/payments/admin/settle-batch` | Auto-release eligible pending (admin) |
| GET | `/finance/wallet/{user_id}` | Wallet balances |

---

## Security notes

- Never store CVV or bank PIN on EventThon servers.
- Webhook endpoints must reject unsigned payloads.
- Admin settle routes require `admin_guard` (JWT `is_admin: true` or `role: "admin"`).
- Use HTTPS in production for all webhook URLs.
