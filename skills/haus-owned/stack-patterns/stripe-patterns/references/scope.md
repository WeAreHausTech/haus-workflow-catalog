# Scope

## In-scope files and dirs

- `lib/stripe-server.ts` / `lib/stripe-client.ts` — SDK init
- `app/api/stripe/**/route.ts` — Stripe-facing route handlers (PaymentIntent create, webhook)
- React components using `<Elements>` / `<PaymentElement>` from `@stripe/react-stripe-js`
- Database migrations adding `stripe_*` columns to user/order tables
- `.env` / `.env.example` — Stripe key env vars
- `package.json` — `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js` versions

## Stack boundaries

- Stripe SDK 14.x+ uses `apiVersion: "2024-10-28.acacia"` style version strings
- Next.js App Router: webhook handler uses `req.text()` for raw body
- Pages Router: webhook handler must disable body parser (`export const config = { api: { bodyParser: false } }`)
- Not in scope: Stripe Connect platform onboarding (separate workflow)
- Not in scope: Qliro, Klarna, Adyen — use matching payment skill
- Database side of the integration → combine with `database-patterns` or `prisma-patterns`

## Triggers

- Adding Stripe to a project for the first time
- Adding a new payment method or Checkout flow
- Adding or modifying a webhook handler
- Switching from CardElement to PaymentElement
- Upgrading Stripe API version (`apiVersion` string)
- Adding subscription / recurring billing
- Adding refund or dispute handling
- Migrating from Stripe Charges API to PaymentIntents
