## Naming conventions

- Init files (Next.js): `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts` at project root
- Init file (Node): `instrument.ts` imported FIRST in `main.ts` / `index.ts` (before any other module)
- Init file (NestJS): `src/sentry.ts` invoked in `bootstrap()` before `NestFactory.create`
- Env vars: `SENTRY_DSN` (server), `NEXT_PUBLIC_SENTRY_DSN` (client), `SENTRY_AUTH_TOKEN` (build-time source map upload)
- Release tag: `release: process.env.SENTRY_RELEASE` — typically commit SHA or app version
- Environment tag: `environment: process.env.NODE_ENV` (or explicit `production` / `staging`)
- Scrubber function: named `scrubSentryEvent` in `lib/sentry-scrubber.ts`

## Do / don't

DO: Set `tracesSampleRate` to a low value in production (0.05–0.2) — DON'T: leave it at 1.0
DO: Set `release` and `environment` on every init — DON'T: leave them undefined (breaks source map matching)
DO: Use `Sentry.setUser({ id })` with internal IDs only — DON'T: pass email/IP without scrubbing
DO: Use `beforeSend` to redact request headers (`authorization`, `cookie`, `x-api-key`) — DON'T: send raw headers
DO: For Next.js, use `@sentry/nextjs` and wrap `next.config.js` with `withSentryConfig` — DON'T: combine `@sentry/node` + manual instrumentation
DO: Tag spans with low-cardinality dimensions (route name, queue name) — DON'T: tag with user IDs (high cardinality)
DO: Re-throw or return after `Sentry.captureException` — DON'T: swallow the error silently
DO: Use `Sentry.startSpan` for performance tracing — DON'T: instrument with old `startTransaction` API (deprecated in v8+)

## Forbidden patterns

NEVER: hardcode the DSN in source files — env var only
NEVER: ship `SENTRY_AUTH_TOKEN` in client bundle — build-time only
NEVER: enable Sentry in dev by default — too noisy; opt in via `SENTRY_DSN_DEV` or explicit flag
NEVER: send full request body or response body in breadcrumbs — leaks PII and customer data
NEVER: ignore errors via `ignoreErrors: [/.*/]` — defeats the purpose
NEVER: deploy without source maps uploaded — stack traces unreadable in production
NEVER: log PII fields (`email`, `phone`, `ssn`, `address`) in `extra` or `tags` without scrubbing
NEVER: keep `replaysSessionSampleRate: 1.0` in production — replay storage explodes
NEVER: instrument every fetch call with custom spans — auto-instrumentation usually suffices
