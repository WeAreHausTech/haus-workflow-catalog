# Scope

## In-scope files and dirs

- `vendure-config.ts` — `QliroPlugin.init({...})` registration
- `src/plugins/qliro/**` — local overrides or extensions of the Qliro plugin behavior
- Storefront Qliro integration: page/component that renders Qliro Checkout snippet
- Push handler route exposed by the plugin (typically `/payments/qliro/push`)
- Refund / cancel service code using `@haus-tech/qliro-plugin` exports
- `.env` / `.env.example` — Qliro env vars
- `package.json` — `@haus-tech/qliro-plugin` version pin

## Stack boundaries

- Requires Vendure backend (`@vendure/core`) and `@haus-tech/qliro-plugin`
- Storefront can be Next.js, Remix, React Router v7 — same Qliro snippet pattern
- Not in scope: non-Vendure Qliro integrations (custom Qliro API client)
- Not in scope: Stripe / Klarna / Adyen (separate skills)
- Database side → combine with `database-patterns`
- Vendure plugin development beyond Qliro → `vendure-plugin-patterns`

## Triggers

- Adding Qliro to a Vendure project
- Modifying Qliro plugin config (`init({...})` options)
- Adding refund / cancel flow
- Switching sandbox ↔ production
- Adjusting push handler logic (status transitions, side effects)
- Upgrading `@haus-tech/qliro-plugin` major version
- Adding new Qliro market (currency, locale, terms URL)
