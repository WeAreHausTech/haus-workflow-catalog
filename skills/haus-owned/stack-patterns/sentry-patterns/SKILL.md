---
name: sentry-patterns
description: Sentry router. Use for SDK init, error capture, performance tracing, scope/breadcrumb config, and PII scrubbing.
---

# Sentry Patterns

## Use when

- task initializes or modifies Sentry SDK (`Sentry.init({...})`)
- task adds breadcrumbs, scope tags, user context, or custom error capture
- task wires source-map upload (`@sentry/cli` / `@sentry/webpack-plugin` / `@sentry/nextjs`)
- task adds performance tracing (`Sentry.startSpan`, transaction sampling)
- task configures PII scrubbing (`beforeSend`, `denyUrls`, `ignoreErrors`)

## Do not use when

- project uses Datadog, New Relic, or another APM
- task is generic error handling without Sentry instrumentation
- task is observability metrics (Prometheus, OpenTelemetry without Sentry adapter)

## Inspect first

- Sentry init file: `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts` (Next.js); `instrument.ts` (Node)
- `package.json` — `@sentry/*` package versions; major versions have breaking changes (v7 → v8 → v9)
- DSN config: env vars (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`) — public for client SDK, private for server
- Sample rate: `tracesSampleRate`, `replaysSessionSampleRate` — production must be < 1.0 (cost control)
- `beforeSend` / `beforeBreadcrumb` hooks if PII scrubbing is wired
- Source-map upload config in `next.config.js` (Next.js) or webpack/vite config

## Avoid mistakes

- shipping `dsn` in client code without `NEXT_PUBLIC_*` prefix — env var not exposed to bundle
- forgetting `release` field — events can't be tied to source maps
- using `tracesSampleRate: 1.0` in production — explodes ingest cost
- logging user emails / PII without a `beforeSend` scrubber — GDPR risk
- swallowing the original error after `Sentry.captureException` — UX shows stale data
- mixing `@sentry/node` and `@sentry/nextjs` in a Next.js app — pick `@sentry/nextjs`
- enabling Sentry in dev without explicit opt-in — noise in dashboard

## Router

1. Load `references/conventions.md` for init, scope, and PII patterns.
2. Load `references/scope.md` for in-scope files and SDK-package boundaries.
3. Load `references/workflow.md` only for source-map upload and event diagnosis flow.
4. Sample aggressively in production; scrub PII; tag releases.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
