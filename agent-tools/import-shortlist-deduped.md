# Import shortlist — deduped (2026-06-16)

Curated catalog additions after user cuts, content/source review, and duplicate resolution.

**Supersedes:** informal lists in chat; use with [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml) for repo paths (minus dropped items).

**Strategy:** sync third-party upstream; deprecate matching haus `stack-patterns/*` routers when imported.

---

## Totals

| Bucket                     | Count    |
| -------------------------- | -------- |
| ECC agents (new)           | **5**    |
| ECC skills                 | **16**   |
| Jeffallan skills           | **2**    |
| skills.sh shortlist        | **41**   |
| Wave 3 planned (repos TBD) | **~40+** |
| llms.txt reference packs   | **18**   |

---

## Wave 1 — ECC agents (`affaan-m/ECC`)

**Already in catalog (8):** `react-reviewer`, `react-build-resolver`, `php-reviewer`, `csharp-reviewer`, `database-reviewer`, `e2e-runner`, `performance-optimizer`, `refactor-cleaner`

### Add (5)

| Agent                  | Stacks                          |
| ---------------------- | ------------------------------- |
| `typescript-reviewer`  | typescript, react, vitest, jest |
| `vue-reviewer`         | vue, radix, typescript          |
| `security-reviewer`    | security, expressjs             |
| `a11y-architect`       | frontend, radix, shadcn         |
| `build-error-resolver` | CI/build, TypeScript errors     |

### Skipped (user)

Tier A: `healthcare-reviewer`, `mle-reviewer`, `network-config-reviewer`, `fsharp-reviewer`

Tier B: all except `build-error-resolver`

Tier C: all

---

## Wave 2 — ECC skills (`affaan-m/ECC`)

### Frontend (4)

- `frontend-patterns`
- `frontend-a11y`
- `react-testing`
- `vite-patterns`

### Backend (2)

- `nestjs-patterns`
- `backend-patterns`

### PHP / Laravel (5)

- `laravel-patterns`
- `laravel-security`
- `laravel-tdd`
- `laravel-verification`
- `laravel-plugin-discovery`

### Data (3)

- `prisma-patterns`
- `mysql-patterns`
- `database-migrations`

### .NET (1)

- `csharp-testing`

### Infra (1)

- `kubernetes-patterns`

### Skipped (user + dedup)

User cuts: `design-system`, `angular-developer`, `nuxt4-patterns`, `motion-patterns`, `ui-to-vue`, `api-design`, `error-handling`, `deployment-patterns`, `jpa-patterns`, `fsharp-testing`, `windows-desktop-e2e`, all “other”, all Tier B adjuncts.

Dedup drops: `react-patterns`, `accessibility`, `react-performance`, `nextjs-turbopack`, `vue-patterns`, `postgres-patterns`, `redis-patterns`, `dotnet-patterns`, `e2e-testing`, `docker-patterns`

---

## Wave 2 — Jeffallan (`Jeffallan/claude-skills`)

New `sources.yaml` entry — **2 skills only** after dedup.

| Skill            | Stacks                           | Why kept                              |
| ---------------- | -------------------------------- | ------------------------------------- |
| `typescript-pro` | typescript, nx21, turbo, graphql | Advanced TS type system; unique angle |
| `php-pro`        | php, laravel, wordpress, prisma  | General PHP 8.3; not Laravel-only     |

### Dedup drops

`nestjs-expert`, `graphql-architect`, `nextjs-developer`, `react-expert`, `react-native-expert`, `vue-expert`, `vue-expert-js`, `laravel-specialist`, `wordpress-pro`, `csharp-developer`, `dotnet-core-expert`, `playwright-expert`, `postgres-pro`, `sql-pro`, `security-reviewer`, `api-designer`, `mcp-developer`, `cli-developer`, `kubernetes-specialist`, `monitoring-expert`, `game-developer`, `salesforce-developer`, `shopify-expert`; all Tier B.

---

## Wave 3 — skills.sh (`skills_sh_import_shortlist_2026-06-16.yaml`)

41 skills across 16 source IDs. Paths in YAML unless noted dropped.

| Source ID                            | Skills                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `vercel-agent-skills`                | `react-best-practices`, `composition-patterns`                                                                                  |
| `vercel-nextjs-skills`               | `next-best-practices`, `next-upgrade`                                                                                           |
| `stripe-ai`                          | `stripe-best-practices`, `upgrade-stripe`, `stripe-projects`                                                                    |
| `supabase-agent-skills`              | `supabase`, `supabase-postgres-best-practices`                                                                                  |
| `hyf0-vue-skills`                    | `vue-best-practices`, `vue-debug-guides`, `vue-pinia-best-practices`, `vue-router-best-practices`, `vue-testing-best-practices` |
| `wordpress-agent-skills-extra`       | `wp-plugin-development`, `wp-rest-api`, `wp-block-themes`, `wp-performance`, `wp-block-development`, `wp-project-triage`        |
| `prisma-skills-extra`                | `prisma-upgrade-v7`                                                                                                             |
| `redis-agent-skills-extra`           | `redis-core`, `redis-connections`, `redis-security`, `redis-observability`, `iris-development`                                  |
| `sanity-agent-toolkit-extra`         | `content-modeling-best-practices`, `sanity-migration`                                                                           |
| `expo-skills-extra`                  | `building-native-ui`, `native-data-fetching`, `upgrading-expo`, `expo-dev-client`, `expo-api-routes`                            |
| `currents-playwright-best-practices` | `playwright-best-practices`                                                                                                     |
| `deckardger-tanstack-agent-skills`   | `tanstack-query`, `tanstack-router`                                                                                             |
| `laravel-boost`                      | `laravel-best-practices`                                                                                                        |
| `jezweb-claude-skills`               | `wordpress-elementor`                                                                                                           |
| `sickn33-antigravity-awesome-skills` | `docker-expert`                                                                                                                 |
| `wshobson-agents`                    | `tailwind-design-system`, `postgresql-table-design`, `monorepo-management`, `dotnet-backend-patterns`                           |

### Skipped (user)

`webapp-testing`, `vue-i18n-skilld`, `nova-resource-patterns`, `qa-testing-playwright`, `tdd`, `tanstack-start`, `multi-stage-dockerfile`, `strapi-v5-expert`, `workflow-orchestration-patterns`

### Dedup drops (remove from YAML when merging)

| Item                                               | Reason                              |
| -------------------------------------------------- | ----------------------------------- |
| `ecc-affaanm-extra` / `laravel-tdd`                | Duplicate ECC `laravel-tdd`         |
| `vercel-agent-skills` / `react-native-skills`      | `expo-skills-extra`                 |
| `prisma-skills-extra` / `prisma-postgres`          | ECC `prisma-patterns`               |
| `kadajett-nestjs-skills`                           | ECC `nestjs-patterns`               |
| `wshobson-agents` / `nx-workspace-patterns`        | `monorepo-management` + nx llms.txt |
| `wshobson-agents` / `react-state-management`       | ECC `frontend-patterns`             |
| `wshobson-agents` / `auth-implementation-patterns` | Planned Auth0 + Better Auth         |

### Audit flags

- **wordpress/agent-skills** — GPL-2.0-or-later; license audit before mirror
- **redis** — skills.sh name `redis-development` maps to upstream `iris-development`
- **stripe/ai** — official skills synced from Stripe; skills only (no MCP in catalog)
- **supabase/agent-skills** — `supabase` covers product workflow; `supabase-postgres-best-practices` complements `wshobson/postgresql-table-design` for Supabase Postgres

### Vendor gaps filled (2026-06-16)

| Vendor       | Added                                                                       | Not in catalog                                    |
| ------------ | --------------------------------------------------------------------------- | ------------------------------------------------- |
| **Stripe**   | `stripe-best-practices`, `upgrade-stripe` (plus existing `stripe-projects`) | `stripe-directory` (discovery helper); Stripe MCP |
| **Supabase** | `supabase`, `supabase-postgres-best-practices`                              | Supabase MCP                                      |
| **Firebase** | —                                                                           | skipped (not on stack allowlist)                  |

---

## Wave 3 — planned (not in shortlist yet)

Pin from vendor GitHub repos (VoltAgent index as discovery only).

| Publisher          | Scope                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| **Sentry**         | ~16 SDK skills (`sentry-workflow`, `sentry-nextjs-sdk`, `sentry-nestjs-sdk`, …) |
| **Apollo GraphQL** | ~12 skills (replaces Jeffallan `graphql-architect`)                             |
| **Auth0**          | ~9 skills (replaces `auth-implementation-patterns`)                             |
| **Better Auth**    | ~7 skills (nextauth migration path)                                             |
| **shadcn/ui**      | official skill from `shadcn-ui/ui` repo                                         |

### Skipped (user)

Microsoft Playwright CLI bundle, Addy Osmani web-quality/accessibility/seo, Trail of Bits security trio, testdino `playwright-skill`, CallStack RN pair, Neon/Netlify trio.

---

## Wave 4 — llms.txt reference packs

URL-only items (`reference-pack` or `references[]`). Complement skills; not deduped away.

| Feed                                     |
| ---------------------------------------- |
| https://docs.vendure.io/llms.txt         |
| https://nextjs.org/llms.txt              |
| https://nextjs.org/docs/llms-full.txt    |
| https://react.dev/llms.txt               |
| https://vite.dev/llms.txt                |
| https://vite.dev/llms-full.txt           |
| https://vuejs.org/llms.txt               |
| https://vuejs.org/llms-full.txt          |
| https://www.prisma.io/llms.txt           |
| https://www.prisma.io/docs/llms-full.txt |
| https://nx.dev/llms.txt                  |
| https://nx.dev/llms-full.txt             |
| https://turbo.build/docs/llms.txt        |
| https://tanstack.com/llms.txt            |
| https://vitest.dev/llms.txt              |
| https://storybook.js.org/llms.txt        |
| https://storybook.js.org/llms-full.txt   |
| https://docs.bullmq.io/llms.txt          |
| https://www.i18next.com/llms.txt         |
| https://www.i18next.com/llms-full.txt    |
| https://docs.strapi.io/llms.txt          |
| https://docs.sanity.io/llms.txt          |
| https://www.elastic.co/docs/llms.txt     |
| https://nova.laravel.com/docs/llms.txt   |
| https://ui.shadcn.com/llms.txt           |

---

## Haus-only (not importing)

- `qliro-patterns`
- Enterprise auth: oidc, azure-ad, bankid, saml2
- `bedrock-patterns`, `acf-pro`, deep `elementor-pro`, `jetengine-patterns`
- Vendure plugin / app specifics (`meriley/vendure-developing` unresolved)
- Haus workflow: `writing-documentation`, `lefthook-security`, `agentic-workflow-standard`

---

## Flat keep list (64 skills + 5 agents + ~40 planned)

### Agents (5)

`typescript-reviewer`, `vue-reviewer`, `security-reviewer`, `a11y-architect`, `build-error-resolver`

### Skills (64)

`frontend-patterns`, `frontend-a11y`, `react-testing`, `vite-patterns`, `nestjs-patterns`, `backend-patterns`, `laravel-patterns`, `laravel-security`, `laravel-tdd`, `laravel-verification`, `laravel-plugin-discovery`, `prisma-patterns`, `mysql-patterns`, `database-migrations`, `csharp-testing`, `kubernetes-patterns`, `typescript-pro`, `php-pro`, `react-best-practices`, `composition-patterns`, `next-best-practices`, `next-upgrade`, `stripe-best-practices`, `upgrade-stripe`, `stripe-projects`, `supabase`, `supabase-postgres-best-practices`, `vue-best-practices`, `vue-debug-guides`, `vue-pinia-best-practices`, `vue-router-best-practices`, `vue-testing-best-practices`, `wp-plugin-development`, `wp-rest-api`, `wp-block-themes`, `wp-performance`, `wp-block-development`, `wp-project-triage`, `prisma-upgrade-v7`, `redis-core`, `redis-connections`, `redis-security`, `redis-observability`, `iris-development`, `content-modeling-best-practices`, `sanity-migration`, `building-native-ui`, `native-data-fetching`, `upgrading-expo`, `expo-dev-client`, `expo-api-routes`, `playwright-best-practices`, `tanstack-query`, `tanstack-router`, `laravel-best-practices`, `wordpress-elementor`, `docker-expert`, `tailwind-design-system`, `postgresql-table-design`, `monorepo-management`, `dotnet-backend-patterns`

---

## Related

- [upstream-vendor-skills-audit.md](./upstream-vendor-skills-audit.md) — llms.txt + strategy
- [agent-audit.md](./agent-audit.md) — raw ECC/Jeffallan/VoltAgent discovery
- [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml) — repo paths (trim per dedup drops above)
