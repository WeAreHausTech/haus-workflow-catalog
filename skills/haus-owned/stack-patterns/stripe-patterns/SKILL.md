---
name: stripe-patterns
description: Stripe router. Use for Elements, Checkout, payment intents, webhooks, and PCI-safe integration.
---

# Stripe Patterns

## Use when

- task wires Stripe Elements (`@stripe/stripe-js` + `@stripe/react-stripe-js`) into a React/Next.js app
- task creates or modifies a PaymentIntent / SetupIntent / Checkout Session
- task handles a Stripe webhook (`stripe.webhooks.constructEvent`)
- task adjusts Stripe Connect, subscription, or refund flow

## Do not use when

- payment provider is Qliro, Klarna, Adyen, or other non-Stripe (use the matching skill)
- task is generic billing UX with no Stripe API contact
- task is invoice/receipt generation outside Stripe's invoicing product

## Inspect first

- Stripe SDK init: `lib/stripe.ts` / `lib/stripe-server.ts` — separate client (publishable key) and server (secret key) modules
- env vars: `STRIPE_SECRET_KEY` (server), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client), `STRIPE_WEBHOOK_SECRET` (webhook handler)
- webhook route: `app/api/stripe/webhook/route.ts` (Next.js) or framework equivalent — must use raw body
- `package.json` — `stripe` (server SDK) version; major version bumps include API version changes
- Stripe `apiVersion` pinned in SDK init — pinning prevents silent API drift

## Avoid mistakes

- mixing publishable key (client-safe) and secret key (server-only) — secret in client bundle = full account compromise
- parsing webhook body as JSON before `constructEvent` — signature validation requires raw bytes
- not idempotent webhook handlers — Stripe retries; duplicate side effects break ledgers
- using `confirmCardPayment` (deprecated) instead of `confirmPayment` with PaymentElement
- skipping the `apiVersion` pin — Stripe rolls API versions; behavior changes silently
- logging full PaymentIntent or Charge objects — leaks card metadata and customer info

## Router

1. Load `references/conventions.md` for Elements, intent, and webhook patterns.
2. Load `references/scope.md` for in-scope files and SDK boundaries.
3. Load `references/workflow.md` only for webhook diagnosis and intent state-machine flow.
4. Keep secret keys server-only; pin API version; make webhooks idempotent.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
