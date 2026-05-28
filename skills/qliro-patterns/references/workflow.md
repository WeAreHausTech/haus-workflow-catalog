# Workflow

## Implementation steps

1. Install: `yarn add @haus-tech/qliro-plugin` in the Vendure project.
2. Register `QliroPlugin.init({...})` in `vendure-config.ts` `plugins` array.
3. Set env vars in `.env`: `QLIRO_MERCHANT_API_KEY`, `QLIRO_MERCHANT_ID`, `QLIRO_API_URL`, `QLIRO_TERMS_URL`.
4. Confirm sandbox URL is used in dev/staging; live URL only in production.
5. Storefront: render the Qliro Checkout snippet returned by the plugin's order-creation mutation.
6. Implement the push handler endpoint (often shipped by the plugin) — ensure it's reachable from Qliro's IPs.
7. Make the push handler idempotent: check current `qliro_status` on the order before applying state changes.
8. For refunds, call the plugin's refund service with `orderId`, `amount`, and `reason`.
9. For new markets, set currency + locale + terms URL per country.
10. Add a regression test that simulates a Qliro push event and asserts idempotency.

## Commands

```bash
# Local plugin dev
yarn dev                                       # Vendure backend with plugin loaded

# Inspect Vendure logs for Qliro push receipts
grep -i "qliro" logs/vendure-*.log

# Verify env vars
node -e 'console.log(process.env.QLIRO_API_URL)'   # confirm sandbox vs prod URL

# Test push handler with a sample payload (replace with real Qliro payload shape)
curl -X POST http://localhost:3000/payments/qliro/push \
  -H "Content-Type: application/json" \
  -d '{"OrderId":"<id>","Status":"Completed"}'
```

## Validation checklist

- [ ] `@haus-tech/qliro-plugin` registered in `vendure-config.ts`
- [ ] All Qliro env vars set per environment with correct sandbox/production separation
- [ ] `QLIRO_MERCHANT_API_KEY` server-only, never `NEXT_PUBLIC_*`
- [ ] Push handler endpoint reachable from Qliro IPs (firewall / load balancer rules verified)
- [ ] Push handler idempotent (re-sending the same event produces no extra side effects)
- [ ] Push payload signature validated when the plugin exposes a helper
- [ ] `qliro_order_id` persisted on Vendure `Order` for reconciliation
- [ ] Currency / locale / terms URL configured per market
- [ ] Refund flow exercised in sandbox before live deploy
- [ ] No customer PII (personal numbers, addresses) logged from Qliro payloads
- [ ] Regression test for push handler idempotency
