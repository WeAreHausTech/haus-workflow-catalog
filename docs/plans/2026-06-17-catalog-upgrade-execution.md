# Catalog upgrade execution — progress log

Living status for the multi-wave catalog upgrade. Full plan: Cursor plan `catalog_upgrade_execution_60fad24c`.

**Last updated:** 2026-06-17

## Summary

| Step                               | Status      | PR                                                                                         |
| ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| 1 — CLI Phase0                     | merged      | [haus-workflow#121](https://github.com/WeAreHausTech/haus-workflow/pull/121)               |
| 2 — Catalog Phase0                 | merged      | [haus-workflow-catalog#23](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/23) |
| 3 — Wave1 ECC agents               | merged      | [haus-workflow-catalog#24](https://github.com/WeAreHausTech/haus-workflow-catalog/pull/24) |
| 4 — Wave2 skills                   | in progress | `feat/wave2-ecc-jeffallan-skills`                                                          |
| 5a–5c — Wave3a batches             | pending     | —                                                                                          |
| 6 — Wave3b vendors                 | pending     | —                                                                                          |
| 7 — Wave4 llms + deprecations      | pending     | —                                                                                          |
| 8 — CLI fixtures + archetype tests | pending     | —                                                                                          |
| 9 — Release both repos             | pending     | —                                                                                          |

**Next:** open Step4 PR, merge, then start Step5a (`feat/wave3a-frontend-vendor`).

## Step 1 — CLI Phase0 (merged)

- Deprecated items skipped in recommend + apply
- Shared `manifest-item-fields.ts` for provenance/reference validation
- Tests: deprecated gate, provenance negatives, lockfile roundtrip

## Step 2 — Catalog Phase0 (merged)

- `sync-upstream.mjs` generalized (slug-aware mirror; typed select for skill/agent/command)
- Curated provenance required in schema + `manifest-item-fields.mjs`
- `requiresAny` gate for non-default curated items
- llms.txt policy: `references[]` only, never synced files

## Step 3 — Wave1 ECC agents (merged #24)

Imported 5 agents under `agents/ecc/`:

| ID                              | requiresAny                             |
| ------------------------------- | --------------------------------------- |
| `haus.ecc-typescript-reviewer`  | `typescript5`, `dependency: typescript` |
| `haus.ecc-vue-reviewer`         | `vue`                                   |
| `haus.ecc-security-reviewer`    | `security`, `role: nestjs-api`          |
| `haus.ecc-a11y-architect`       | `shadcn`, `radix`                       |
| `haus.ecc-build-error-resolver` | `typescript5`                           |

- `ecc-affaanm` snapshotRef: `ec92b528471df708c2384ebbcc82b390b60f535a`
- Catalog items: 79 → 84

## Step 4 — Wave2 skills (strict-gate subset)

Planned: 16 ECC + 2 Jeffallan skills.  
Imported now (policy-clean subset): 8 skills.

Imported:

- ECC: `frontend-patterns`, `react-testing`, `vite-patterns`, `nestjs-patterns`, `laravel-patterns`, `laravel-verification`, `laravel-plugin-discovery`, `csharp-testing`

Deferred (blocked by current validation policy):

- `frontend-a11y`, `backend-patterns`, `laravel-security`, `mysql-patterns` (blocked by `secret-grep` token/password heuristic in staged lines)
- `prisma-patterns`, `database-migrations`, `kubernetes-patterns`, `laravel-tdd` (forbidden stack or disallowed `npx` in shipped markdown)
- `typescript-pro`, `php-pro` (disallowed `npx`/`http://` in shipped markdown)

Decision in effect: keep strict validator gates, defer blocked skills for later policy/curation pass.

## Remaining scope (not started)

- 16 ECC + 2 Jeffallan skills (Wave 2)
- skills.sh shortlist in 3 batches (Wave 3a)
- Vendor repos: Sentry, Apollo, Auth0, Better Auth, shadcn (Wave 3b)
- 18 llms.txt `references[]` + haus router deprecations (Wave 4)
- CLI fixture sync + archetype golden tests + release
