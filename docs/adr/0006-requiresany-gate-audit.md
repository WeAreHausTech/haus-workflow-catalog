# ADR-0006: requiresAny gate audit convention

## Status

Accepted (2026-06-22)

## Context

Several catalog skills used broad `packageNamePattern` clauses (e.g. `@tanstack/*`, `@sentry/*`, `@nx/*`) or stack OR-branches unrelated to the skill (e.g. `stack: laravel` on Sentry PHP SDK). Any satisfied branch installs the item when tag/dep evidence exists — causing false-positive co-installs.

## Decision

When authoring or reviewing `requiresAny` in `manifest.json`:

1. **No catch-all `packageNamePattern`** unless the scope is intentionally broad and documented in the item `purpose`.
2. **Stack OR-branches must match skill purpose** — do not use a popular stack token as a shortcut for a dependency the scanner should prove (e.g. Laravel ≠ Sentry installed).
3. **Opt-in tiers** use `default: false` plus `requiresAny` (dependency/stack/role). Role-only gates (`redis-ops`, `laravel-plugins`, `database`, workflow opt-in roles) are satisfied via `deep-context.json`, not shallow scanner.
4. **Co-install pairs** (Sentry workflow + SDK, e2e-runner + e2e-testing skill) are handled in CLI `recommend.ts` post-pass when manifest gates alone are insufficient.

## Consequences

- P2g gate fixes applied to tanstack, sentry-php, nx, sentry-workflow, storybook, expo tags.
- Regression fixtures in `haus-workflow` lock false-positive installs.
- `DEEP_CONTEXT_ROLES` in CLI `derive-from-manifest.ts` documents role-only opt-in items for detection-coverage.
