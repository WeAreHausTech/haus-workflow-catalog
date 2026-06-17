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
| 5a–5c — Wave3 skills.sh (bulk PR)  | in progress | `feat/wave3a-frontend-vendor`                                                              |
| 6 — Wave3b vendors                 | pending     | —                                                                                          |
| 7 — Wave4 llms + deprecations      | pending     | —                                                                                          |
| 8 — CLI fixtures + archetype tests | pending     | —                                                                                          |
| 9 — Release both repos             | pending     | —                                                                                          |

**Next:** open consolidated Wave3 PR (`feat/wave3a-frontend-vendor`), merge, then Wave3b vendors.

## Step 4 — Wave2 skills (merged #25)

Merged strict-gate subset: 7 ECC skills.

Deferred: policy blockers (`npx`, forbidden stacks, `secret-grep`, dead cross-links).

## Step 5 — Wave3 skills.sh consolidated import (in progress)

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

**Dropped from PR:** hyf0 vue pack, jezweb wordpress-elementor, `laravel-boost`, `supabase-postgres-best-practices` (14k overlap with `postgresql-table-design`), `wshobson/dotnet-backend-patterns` (20k overlap with ECC + Haus dotnet routers).

**Wave4 deprecations (in this PR):** `reviewStatus: deprecated` on Haus stack routers superseded by upstream — `haus.stripe-patterns` → `haus.stripe-stripe-best-practices`, `haus.supabase-patterns` → `haus.supabase-supabase`, `haus.tailwind-scss-patterns` → `haus.wshobson-tailwind-design-system`, `haus.laravel-patterns` → `haus.ecc-laravel-patterns`. Held: `haus.sanity-patterns` (no full Sanity upstream yet), `haus.database-patterns` (multi-engine).

**Tooling:** `assertMitLicense` now accepts `The MIT License` headers and `LICENSE.md`.

**Deferred (strict gates):**

- License gate: `vercel-agent-skills`, `vercel-nextjs-skills`, `deckardger-tanstack-agent-skills` (no upstream `LICENSE`/`LICENSE.md`)
- License gate: `wordpress/agent-skills` (GPL), `currents-playwright-best-practices` (MIT body without MIT title)
- Content policy: `vue-testing-best-practices`, all expo pack (5), `prisma-upgrade-v7`, `sanity-migration`, `monorepo-management` (disallowed `npx`)
- Content policy: `redis-core` (`http://` in references), `iris-development` (forbidden `python` mention)
- Dropped from PR: hyf0 vue pack (4 skills) — oversized reference trees per skill; defer to later wave or slimmer upstream pick

## Remaining scope

- Wave3b vendor repos (Sentry, Apollo, Auth0, Better Auth, shadcn) — import workflow + detected SDK only, not full trees
- 18 llms.txt `references[]` + further router deprecations (`sanity-patterns`, `database-patterns`, `sentry-patterns` when upstream lands)
- CLI fixture sync + archetype golden tests + release
