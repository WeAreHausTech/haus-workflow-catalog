## Naming conventions

- Plugin config: registered in `vendure-config.ts` `plugins` array as `QliroPlugin.init({...})`
- Env vars: `QLIRO_MERCHANT_API_KEY` (server-only), `QLIRO_MERCHANT_ID`, `QLIRO_API_URL`, `QLIRO_TERMS_URL`
- Order metadata: `qliro_order_id` and `qliro_status` columns on `Order` entity
- Push handler route: `/payments/qliro/push` (POST) — accepts Qliro callbacks
- Refund flow: `qliroRefund(orderId, amount, reason)` service method, never inlined in controller

## Do / don't

DO: Use the official `@haus-tech/qliro-plugin` — DON'T: implement Qliro Checkout from scratch in Vendure code
DO: Store `qliro_order_id` on the Vendure `Order` for reconciliation — DON'T: rely on user session alone
DO: Make the push handler idempotent (check current `qliro_status` before mutating) — DON'T: assume each push is a new event
DO: Use sandbox `QLIRO_API_URL` (`https://pago.qit.nu` etc.) in dev/staging — DON'T: hit live API from non-production
DO: Validate push payload signature where the plugin exposes a verification helper — DON'T: trust raw body
DO: Surface Qliro's localized error copy back to checkout UI — DON'T: replace with English fallbacks (Nordic UX expects native language)
DO: Pin Qliro plugin version explicitly — DON'T: track `latest`

## Forbidden patterns

NEVER: ship `QLIRO_MERCHANT_API_KEY` to client bundle
NEVER: trust browser-side checkout completion as the order-finalize trigger — Qliro push is authoritative
NEVER: mutate order state on push without idempotency guard — Qliro retries cause double-completion
NEVER: log Qliro payloads containing customer personal numbers / addresses — Nordic PII regulations
NEVER: hard-code currency to SEK — Qliro supports multiple Nordic currencies; read from order
NEVER: skip the sandbox/production env split — order ledger corruption
NEVER: deploy without a working push endpoint (404 / 500 means Qliro retries forever)
NEVER: roll your own Qliro API client when the plugin exposes one — duplicates auth + retry logic
