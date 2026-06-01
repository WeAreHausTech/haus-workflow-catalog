## Naming conventions

- Server SDK init: `lib/stripe-server.ts` exporting `stripe` (`new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "..." })`)
- Client SDK loader: `lib/stripe-client.ts` exporting `getStripe()` memoizing `loadStripe(publishableKey)`
- Webhook route: `app/api/stripe/webhook/route.ts` (Next.js App Router) or `pages/api/stripe/webhook.ts` (Pages)
- PaymentIntent metadata: include `orderId` for ledger reconciliation
- Stripe object IDs: prefixed in DB columns (`stripe_payment_intent_id`, `stripe_customer_id`)
- Env var names: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- API version: pinned in SDK init as a string (`apiVersion: "2024-10-28.acacia"`)

## Do / don't

DO: Use PaymentElement + `confirmPayment` for new integrations — DON'T: use CardElement + `confirmCardPayment` (deprecated)
DO: Make webhook handlers idempotent via `event.id` dedup table — DON'T: rely on "delivered once" semantics (Stripe retries)
DO: Read raw body for webhook signature validation (`req.text()` in Next.js App Router) — DON'T: parse JSON first
DO: Store `stripe_customer_id` on your user record so future intents reuse it — DON'T: create a new customer per intent
DO: Use `automatic_payment_methods: { enabled: true }` so Stripe picks valid methods per region — DON'T: hard-code method types
DO: Pass `idempotencyKey` on every server-side create call — DON'T: rely on Stripe's default retry behavior alone
DO: Use `metadata` for cross-system correlation (orderId, userId) — DON'T: stuff PII into metadata
DO: Set `apiVersion` explicitly — DON'T: let SDK default to latest (silent breakage on upgrade)
DO: Show payment errors via Stripe's localized `error.message` — DON'T: invent your own copy that won't be translated

## Forbidden patterns

NEVER: ship `STRIPE_SECRET_KEY` to client bundle (no `NEXT_PUBLIC_` prefix, no inline literal)
NEVER: trust webhook payload without `constructEvent` signature validation — easy spoofing
NEVER: parse webhook body as JSON before signature check — invalidates signature
NEVER: handle webhook events synchronously when they trigger external work — return 200 fast, queue the work
NEVER: log full PaymentIntent / Charge / PaymentMethod objects — card metadata leaks
NEVER: store full card numbers, CVCs, or expiry dates — PCI scope explodes; tokens only
NEVER: deploy without `STRIPE_WEBHOOK_SECRET` set per environment — handler accepts any payload
NEVER: skip `apiVersion` pinning — Stripe upgrades the default; subtle behavior changes
NEVER: mix Stripe test keys and live keys in the same env — order ledger corruption
NEVER: rely on PaymentIntent `status` polling — webhooks are the source of truth
