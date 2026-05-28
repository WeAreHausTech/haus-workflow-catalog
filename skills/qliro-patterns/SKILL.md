---
name: qliro-patterns
description: Qliro Checkout router. Use for `@haus-tech/qliro-plugin` integration in Vendure storefronts.
---

# Qliro Patterns

## Use when

- task wires Qliro Checkout via `@haus-tech/qliro-plugin` in a Vendure backend or Next.js storefront
- task touches Qliro order callbacks, refund flow, or merchant API config
- task adds or modifies Qliro webhook handlers (order status updates)

## Do not use when

- payment provider is Stripe / Klarna / Adyen (use the matching skill)
- task is generic e-commerce checkout UX with no Qliro API contact
- project does not use `@haus-tech/qliro-plugin`

## Inspect first

- `@haus-tech/qliro-plugin` install + config in Vendure's `vendure-config.ts`
- env vars: `QLIRO_MERCHANT_API_KEY`, `QLIRO_MERCHANT_ID`, `QLIRO_API_URL` (production vs sandbox URL differs)
- storefront integration: where Qliro Checkout HTML / iframe snippet is rendered
- order callback / push notification endpoint (Qliro pushes order status changes)
- refund flow: server-side endpoint hitting Qliro API with proper auth

## Avoid mistakes

- mixing sandbox + production env vars — order corruption
- exposing `QLIRO_MERCHANT_API_KEY` to client — full merchant compromise
- treating order push as authoritative without idempotency — Qliro retries on 5xx
- relying on user-side checkout completion redirect — push notifications are the source of truth
- skipping signature validation on Qliro push payloads
- hard-coding currency / locale — Nordic markets have per-country requirements

## Router

1. Load `references/conventions.md` for plugin config, push, and refund patterns.
2. Load `references/scope.md` for in-scope files and Vendure-vs-storefront boundaries.
3. Load `references/workflow.md` only for order push diagnosis and refund flow.
4. Keep merchant key server-only; push handlers idempotent; respect sandbox/production split.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
