# Workflow

## Implementation steps

1. Confirm the right SDK package for the stack: `@sentry/nextjs` for Next.js, `@sentry/node` for plain Node, `@sentry/nestjs` for NestJS, `@sentry/react-native` for Expo/RN.
2. Add init at the earliest entry point (instrumentation must run before app code imports modules that throw).
3. Set `dsn`, `release`, `environment`, `tracesSampleRate` (≤ 0.2 in prod), and `beforeSend` scrubber.
4. Wire source-map upload via the framework-specific plugin (`withSentryConfig`, `sentryVitePlugin`, etc.).
5. Add `SENTRY_AUTH_TOKEN` to CI environment but never to runtime env.
6. Test by throwing a synthetic error in a non-production environment and verifying it reaches the Sentry dashboard.
7. For PII fields touched by the change, update `beforeSend` to scrub them.
8. Tag releases via `release` matching the commit SHA or app version so source maps resolve.
9. Add a regression test that captures an exception and asserts the scrubber redacted sensitive fields.

## Commands

```bash
# Source-map upload (manual, usually done by build plugin)
yarn sentry-cli releases new "$SENTRY_RELEASE"
yarn sentry-cli releases files "$SENTRY_RELEASE" upload-sourcemaps ./dist
yarn sentry-cli releases finalize "$SENTRY_RELEASE"

# Verify config
yarn sentry-cli info
yarn sentry-cli projects list

# Inspect event in dashboard
open "https://sentry.io/organizations/<org>/issues/?project=<id>"

# Test error capture in dev
yarn dev   # then visit /api/sentry-example-page (Next.js) or trigger your synthetic error route
```

## Validation checklist

- [ ] Correct SDK package for the framework (no mixing `@sentry/node` + `@sentry/nextjs`)
- [ ] Init runs at the earliest entry point
- [ ] `release` and `environment` set on every init
- [ ] `tracesSampleRate` ≤ 0.2 in production (or appropriate for volume)
- [ ] `beforeSend` scrubs `authorization`, `cookie`, `email`, `phone`, and other PII
- [ ] DSN read from env var, not hardcoded
- [ ] `SENTRY_AUTH_TOKEN` only in CI / build env, not runtime
- [ ] Source maps uploaded as part of the build (verified by readable stack traces)
- [ ] No `ignoreErrors` patterns that hide real bugs
- [ ] No `replaysSessionSampleRate: 1.0` in production
- [ ] Synthetic error reaches the dashboard during smoke test
- [ ] Regression test verifies scrubber works for new sensitive fields
- [ ] Errors are re-thrown or handled after `captureException` — not swallowed
