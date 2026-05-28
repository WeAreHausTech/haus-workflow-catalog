# Scope

## In-scope files and dirs

- `sentry.server.config.ts` / `sentry.client.config.ts` / `sentry.edge.config.ts` — Next.js init files
- `instrument.ts` — Node app init (must be imported first)
- `lib/sentry-scrubber.ts` — `beforeSend` scrubber implementation
- `next.config.js` — `withSentryConfig` wrapping + source map plugin config
- `webpack.config.js` / `vite.config.ts` — `@sentry/webpack-plugin` / `@sentry/vite-plugin` config
- `.env` / `.env.example` — DSN, release, auth token env vars
- Error boundaries that wrap `Sentry.captureException` calls

## Stack boundaries

- `@sentry/nextjs` (Next.js): integrated wrapper, handles client + server + edge
- `@sentry/node` (Node services): pure Node runtime
- `@sentry/nestjs` (NestJS): NestJS-aware integrations
- `@sentry/react-native` (mobile): native crash reporting + JS error capture
- Not in scope: Datadog, New Relic, OpenTelemetry without Sentry adapter
- Frontend perf monitoring beyond Sentry → Vercel Analytics / Speed Insights
- Logging (separate from error monitoring) → pino / winston

## Triggers

- Adding Sentry to a project for the first time
- Switching from `@sentry/node` to `@sentry/nextjs` (or framework-specific package)
- Adding source-map upload to the build pipeline
- Adjusting `tracesSampleRate` or `replaysSessionSampleRate`
- Adding PII scrubbing for new sensitive fields
- Upgrading Sentry SDK major version (v7 → v8, v8 → v9)
- Adding custom breadcrumbs for a domain workflow
- Tagging errors with custom scope (organization, feature flag)
