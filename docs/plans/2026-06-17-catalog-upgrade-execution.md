# Catalog upgrade execution — progress log

Living status for the multi-wave catalog upgrade. Full plan: Cursor plan `catalog_upgrade_execution_60fad24c`.

**Last updated:** 2026-06-17

## Summary

| Step                               | Status      | PR                                                                                         |
| ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| 1 — CLI Phase0                     | merged      | [haus-workflow#121](https://github.com/WeAreHausTech/haus-workflow/pull/121)               |
| 2 — Catalog Phase0                 | merged      | [haus-workflow-catalog#23](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/23) |
| 3 — Wave1 ECC agents               | merged      | [haus-workflow-catalog#24](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/24) |
| 4 — Wave2 skills                   | merged      | [haus-workflow-catalog#25](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/25) |
| 5a–5c — Wave3 skills.sh (bulk PR)  | merged      | [haus-workflow-catalog#26](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/26) |
| 6 — Wave3b vendors                 | merged      | [haus-workflow-catalog#27](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/27) |
| 7 — Wave4 llms + deprecations      | in progress | —                                                                                          |
| 8 — CLI fixtures + archetype tests | pending     | —                                                                                          |
| 9 — Release both repos             | pending     | —                                                                                          |

**Next:** Open PR for Wave4; then CLI fixture sync (step 8).

## Step 7 — Wave4 llms.txt + deprecations (in progress)

**llms.txt `references[]`** on 18 vendor feeds (manifest-only): nextjs, react, vite, vue, prisma, nx, turbo, tanstack, vitest, storybook, bullmq, i18next, strapi, sanity, vendure (existing), elasticsearch, nova, shadcn. Also `haus.sanity-content-modeling-best-practices`.

**Deprecations:** `haus.sanity-patterns` → `haus.sanity-content-modeling-best-practices` + docs.sanity.io llms; `haus.database-patterns` → `haus.wshobson-postgresql-table-design`, `haus.redis-redis-*`, elastic llms.

**Held:** `haus.radix-shadcn-patterns` deprecation until shadcn skill lands.

## Remaining scope

- CLI fixture sync + archetype golden tests + release

## Step 6 — Wave3b vendors (merged #27)

**Imported (4 skills, 102 → 106 items):**

| Source                  | Skills                              |
| ----------------------- | ----------------------------------- |
| getsentry/sentry-for-ai | `sentry-workflow`, `sentry-php-sdk` |
| apollographql/skills    | `apollo-server`, `graphql-schema`   |

**Dropped (content policy — wizard/CLI `npx`/`pnpm dlx` in upstream, not sanitized):** `sentry-nextjs-sdk`, `sentry-react-sdk`, `sentry-nestjs-sdk`, `apollo-client`, `graphql-operations`.

**Deprecations:** `haus.sentry-patterns` → Sentry upstream; `haus.nestjs-graphql-patterns` → Apollo GraphQL skills.

**Deferred:** Auth0 (Apache-2.0), Better Auth (no LICENSE), shadcn (`npx` policy).

## Step 5 — Wave3 skills.sh consolidated import (merged #26)

**Strategy:** merge planned 5a + 5b + partial 5c into one PR to reduce review churn.

**Imported (11 skills, 91 → 102 items):**

| Source   | Skills                                                       |
| -------- | ------------------------------------------------------------ |
| stripe   | `stripe-best-practices`, `upgrade-stripe`, `stripe-projects` |
| supabase | `supabase`                                                   |
| redis    | `redis-connections`, `redis-security`, `redis-observability` |
| sanity   | `content-modeling-best-practices`                            |
| sickn33  | `docker-expert`                                              |
| wshobson | `tailwind-design-system`, `postgresql-table-design`          |

**Dropped from PR:** hyf0 vue pack, jezweb wordpress-elementor, `laravel-boost`, `supabase-postgres-best-practices`, `wshobson/dotnet-backend-patterns`.

**Deprecations (partial wave4):** `haus.stripe-patterns`, `haus.supabase-patterns`, `haus.tailwind-scss-patterns`, `haus.laravel-patterns`. Held: `haus.sanity-patterns`, `haus.database-patterns` (addressed in step 7).

## Step 4 — Wave2 skills (merged #25)

Merged strict-gate subset: 7 ECC skills.

Deferred: policy blockers (`npx`, forbidden stacks, `secret-grep`, dead cross-links).
