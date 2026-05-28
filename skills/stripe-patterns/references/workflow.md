# Workflow

## Implementation steps

1. Server SDK init: create `lib/stripe-server.ts` exporting `new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "<pinned>" })`.
2. Client loader: create `lib/stripe-client.ts` exporting `getStripe()` that memoizes `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`.
3. For checkout, create a PaymentIntent server-side via `stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true }, idempotencyKey, metadata: { orderId } })`.
4. Pass `clientSecret` to the client; render `<Elements stripe={getStripe()} options={{ clientSecret }}>` with `<PaymentElement />` inside.
5. On submit, call `stripe.confirmPayment({ elements, confirmParams: { return_url } })`.
6. Implement webhook handler that reads raw body, validates with `stripe.webhooks.constructEvent(body, sig, webhookSecret)`, dedups by `event.id`, returns 200 fast.
7. Queue downstream work from webhook (BullMQ / similar) — don't block on slow operations inside the handler.
8. Persist `stripe_payment_intent_id`, `stripe_customer_id` on relevant DB records for reconciliation.
9. For test mode, use Stripe test keys + test card numbers (4242 4242 4242 4242 etc.).
10. Add a regression test for the webhook handler that simulates a `payment_intent.succeeded` event.

## Commands

```bash
# Local webhook testing — forwards Stripe events to localhost
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed

# Inspect events
stripe events list --limit 10
stripe events retrieve evt_<id>

# Test card simulation (via Stripe CLI)
stripe payment_intents create --amount 1000 --currency sek --payment-method-types card

# Verify env wiring
node -e 'console.log(process.env.STRIPE_SECRET_KEY?.slice(0,7))'   # confirm test_ / live_ prefix
```

## Validation checklist

- [ ] `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only env vars; not in client bundle
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the only Stripe env var exposed to client
- [ ] `apiVersion` pinned in SDK init
- [ ] Webhook handler reads raw body and validates signature via `constructEvent`
- [ ] Webhook handler is idempotent (event.id dedup or natural key check)
- [ ] PaymentIntent created with `idempotencyKey` and `metadata.orderId`
- [ ] Uses PaymentElement + `confirmPayment` (not deprecated CardElement)
- [ ] Webhook returns 200 quickly; slow work queued
- [ ] No full PaymentIntent / Charge objects logged
- [ ] Test mode keys clearly separated from live mode (different env vars per environment)
- [ ] Stripe customer reused across intents (one `stripe_customer_id` per user)
- [ ] Regression test simulates a webhook event and asserts idempotency
