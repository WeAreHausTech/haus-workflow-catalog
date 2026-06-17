# Upstream vendor skills, agents, and llms.txt audit

Consolidated audit against `validation-rules.json#allowedStacks`. June 2026.

**Strategy:** sync solid third-party upstream rather than maintain thin haus-owned stack routers.

---

## Related artifacts

| File                                                                                       | Role                                                                                    |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [agent-audit.md](./agent-audit.md)                                                         | ECC / Jeffallan / VoltAgent discovery — exact counts, tier name lists, sync waves       |
| [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml) | **Canonical import draft** — pinned repos, `upstreamPath`, license confidence, cautions |
| [hold_list_resolution.json](./hold_list_resolution.json)                                   | skills.sh hold re-audit snapshot — `resolved` / `unresolved`, lines, `risk[]`           |
| [../sources.yaml](../sources.yaml)                                                         | Current production upstream sync config                                                 |
| [../validation-rules.json](../validation-rules.json)                                       | Stack allowlist and safety rules                                                        |

**This doc:** llms.txt feeds, gap resolution, haus replace/keep strategy, and how the artifacts fit together. For repo paths and manifest-ready entries, use the **shortlist YAML**.

---

## Discovery passes

| #   | Source                                                                              | Output                                                 |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | [affaan-m/ECC](https://github.com/affaan-m/ECC) agents + skills                     | 47 agents, 204 skills (MIT)                            |
| 2   | [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills)               | 52 skills (MIT)                                        |
| 3   | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 231 index hits → pin via GitHub repos, not index alone |
| 4   | Vendor web search                                                                   | Official `llms.txt`, MCP, first-party skills           |
| 5   | skills.sh + hold re-audit (2026-06-16)                                              | Import shortlist + hold resolution JSON                |

> **ECC repo note:** `sources.yaml` uses `affaan-m/ECC`. Shortlist also references `affaan-m/everything-claude-code` for `laravel-tdd` — treat as related upstream; confirm same lineage before sync.

---

## Methodology

| Step                            | What we did                                                   | Why                          |
| ------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| Stack allowlist                 | `validation-rules.json#allowedStacks` (~90 tags)              | Catalog tags must be allowed |
| Forbidden filter                | Exclude items whose **name or path** implies forbidden stacks | Matches validation rules     |
| Name + description match        | Heuristic keyword per stack tag                               | Triage large upstream trees  |
| Vendor verification             | HTTP fetch of candidate `llms.txt` URLs                       | Confirm vendor-hosted feeds  |
| skills.sh pipeline              | Locate SKILL.md, line count, `riskyInstallPatterns` scan      | Import readiness             |
| Haus comparison                 | Line-count on `skills/haus-owned/stack-patterns/*`            | Replace vs keep              |
| No haus filter during discovery | All upstream matches first; overlap after                     | Avoid missing good upstream  |

**Classifier fixes:**

| Bug                                     | Fix                          |
| --------------------------------------- | ---------------------------- |
| `expo` inside `export` / `exponential`  | Word-boundary matching       |
| `java` matched `javascript`             | Check javascript before java |
| `c++` broke regex                       | Proper escaping              |
| Forbidden stack mentioned in skill body | Filter on **name/path** only |

---

## Executive summary

| Category                         | Count / verdict                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| ECC agents (67 total → matched)  | **47** (20 excluded by forbidden name/path)                                                       |
| ECC skills (271 → matched)       | **204**                                                                                           |
| Jeffallan skills (66 → matched)  | **52** (14 excluded)                                                                              |
| VoltAgent index matches          | **231** (index only — pin repos via shortlist)                                                    |
| skills.sh shortlist sources      | **22** source IDs, **50+** skill items                                                            |
| Vendor `llms.txt` confirmed live | **18** product feeds                                                                              |
| Haus stack routers               | ~40L SKILL + ~95L refs ≈ **135L**; upstream typically **230–450L+**                               |
| Direction                        | Replace most haus routers; keep haus for qliro, enterprise IdP, WP plugin matrix, vendure plugins |

---

## Gap supersession

Supersedes [agent-audit.md §5](./agent-audit.md) after pass 4 (llms.txt) + pass 5 (skills.sh).

| Stack                             | agent-audit §5      | After vendor + skills.sh                                                                                  | Verdict                          | Keep haus?                  |
| --------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------- |
| **Vendure / vendure3**            | no match            | [docs.vendure.io/llms.txt](https://docs.vendure.io/llms.txt); `meriley/vendure-developing` **unresolved** | llms for core; skill gap remains | Thin router for **plugins** |
| **Qliro**                         | no match            | dev portal only                                                                                           | Unresolved                       | **Yes**                     |
| **Laravel Nova**                  | weak                | [nova llms.txt](https://nova.laravel.com/docs/llms.txt) + `jpcaparas/nova-resource-patterns`              | Resolved                         | Optional                    |
| **Bedrock**                       | partial WP          | WP skills + Roots beta                                                                                    | Partial                          | **Yes**                     |
| **Elementor**                     | partial WP          | `jezweb/wordpress-elementor` **resolved**                                                                 | Partial replace                  | **Yes** for pro-specific    |
| **JetEngine / ACF**               | partial WP          | JetEngine MCP (runtime); no ACF skill                                                                     | Partial                          | **Yes**                     |
| **BullMQ**                        | tangential redis    | [docs.bullmq.io/llms.txt](https://docs.bullmq.io/llms.txt)                                                | Resolved                         | **No** — deprecate haus     |
| **i18next**                       | tangential WP       | [i18next llms.txt](https://www.i18next.com/llms.txt) + `vue-i18n-skilld`                                  | Resolved                         | **No** — deprecate haus     |
| **NextAuth**                      | Auth0/Better Auth   | Better Auth + Auth0 skills; no authjs llms                                                                | Migrate                          | Deprecate haus nextauth     |
| **NX 21**                         | weak                | nx llms + `wshobson/nx-workspace-patterns`                                                                | Resolved                         | **No** — deprecate haus     |
| **TanStack**                      | in react-expert     | llms.txt + `deckardger/tanstack-agent-skills`                                                             | Skills > llms-only               | **No** — deprecate haus     |
| **Storybook**                     | playwright-adjacent | llms.txt + MCP                                                                                            | Resolved                         | **No** — deprecate haus     |
| **OIDC / Azure / BankID / SAML2** | Auth0 partial       | `wshobson/auth-implementation-patterns` (app-level); MS Identity Web docs                                 | Enterprise gap                   | **Yes** for IdP matrix      |

---

## Master stack map

Slim view: **llms.txt**, **haus action**, **import source** (shortlist `source.id` or `—`). Full skill/agent names → tier tables below.

| Stack                            | llms.txt            | Action             | importSource                                                   | Notes                                           |
| -------------------------------- | ------------------- | ------------------ | -------------------------------------------------------------- | ----------------------------------------------- |
| react / react19                  | react.dev           | Replace haus       | `vercel-agent-skills`                                          | + ECC agents/skills                             |
| nextjs                           | nextjs.org          | Replace haus       | `vercel-nextjs-skills`                                         | llms-full + Vercel skills                       |
| typescript / typescript5         | via react/next/vite | Replace haus       | ECC + Jeffallan `typescript-pro`                               |                                                 |
| vite8                            | vite.dev            | Replace haus       | ECC `vite-patterns`                                            |                                                 |
| vue                              | vuejs.org           | Replace haus       | `hyf0-vue-skills`                                              | 5 vue skills in shortlist                       |
| tanstack-query / router          | tanstack.com        | Replace haus       | `deckardger-tanstack-agent-skills`                             | Prefer skills over llms-only                    |
| radix / shadcn                   | ui.shadcn.com       | Replace haus       | shadcn repo (not in shortlist yet)                             | skill + MCP                                     |
| tailwind                         | —                   | Partial replace    | `wshobson-agents`                                              | `tailwind-design-system`                        |
| nestjs                           | —                   | Replace haus       | `kadajett-nestjs-skills`                                       | + Apollo, Jeffallan, ECC                        |
| graphql                          | partial             | Replace haus       | Apollo (wave 3)                                                |                                                 |
| vendure / vendure3               | docs.vendure.io     | Hybrid             | `—` (llms reference-pack)                                      | haus for plugins; vendure-developing unresolved |
| prisma                           | prisma.io           | Replace haus       | `prisma-skills-extra`                                          | + llms-full                                     |
| postgresql / database            | —                   | Replace haus       | `wshobson-agents`, Supabase                                    | `postgresql-table-design`                       |
| redis                            | —                   | Add upstream       | `redis-agent-skills-extra`                                     | `iris-development` naming caveat                |
| bullmq / queue                   | docs.bullmq.io      | Replace haus       | llms reference-pack                                            |                                                 |
| elasticsearch                    | elastic.co          | Add reference-pack | —                                                              |                                                 |
| nx21                             | nx.dev              | Replace haus       | `wshobson-agents`                                              | + `npx nx configure-ai-agents`                  |
| turbo                            | turbo.build         | Replace haus       | llms reference-pack                                            |                                                 |
| playwright                       | —                   | Replace haus       | `currents-playwright-best-practices`                           | See Playwright ranking                          |
| vitest                           | vitest.dev          | Replace haus       | llms reference-pack                                            |                                                 |
| jest                             | —                   | Keep minimal       | ECC                                                            | no jest llms.txt                                |
| testing-library                  | —                   | Keep minimal       | ECC `react-testing`                                            |                                                 |
| storybook                        | storybook.js.org    | Replace haus       | llms + MCP                                                     |                                                 |
| laravel                          | —                   | Replace haus       | `laravel-boost`                                                | + ECC, Jeffallan                                |
| laravel-nova                     | nova.laravel.com    | Add                | `jpcaparas-superpowers-laravel`                                | + nova llms                                     |
| php                              | —                   | Replace            | ECC `php-reviewer`                                             | in catalog                                      |
| wordpress                        | —                   | Replace haus       | `wordpress-agent-skills-extra`                                 | GPL audit                                       |
| bedrock                          | —                   | Keep haus          | WP skills partial                                              |                                                 |
| elementor-pro                    | —                   | Partial            | `jezweb-claude-skills`                                         | `wordpress-elementor`                           |
| acf-pro                          | —                   | Keep haus          | —                                                              |                                                 |
| jetengine                        | —                   | Keep haus          | MCP runtime doc                                                |                                                 |
| sanity                           | docs.sanity.io      | Replace haus       | `sanity-agent-toolkit-extra`                                   |                                                 |
| strapi                           | docs.strapi.io      | Replace haus       | `moteodimassi-strapi-v5-expert`                                | Russian content caution                         |
| stripe / payments                | —                   | Replace haus       | `stripe-ai`                                                    | `stripe-projects` in shortlist                  |
| qliro                            | dev portal only     | Keep haus          | —                                                              |                                                 |
| supabase                         | —                   | Replace            | wave 3 VoltAgent / shortlist                                   |                                                 |
| sentry                           | —                   | Replace haus       | wave 3 getsentry/\*                                            |                                                 |
| next-auth / auth                 | —                   | Migrate            | Better Auth + Auth0 wave 3                                     |                                                 |
| oidc / azure-ad / bankid / saml2 | fragmented          | Keep haus          | `wshobson-agents` partial                                      | app auth only                                   |
| expo / react-native              | —                   | Replace haus       | `expo-skills-extra`                                            |                                                 |
| i18next / i18n                   | i18next.com         | Replace haus       | llms + `vue-ecosystem-skills`                                  | vue-i18n-skilld                                 |
| dotnet / csharp                  | per-product MS      | Replace agent      | `wshobson-agents`                                              | `dotnet-backend-patterns`                       |
| docker                           | —                   | Add upstream       | `sickn33-antigravity-awesome-skills`, `github-awesome-copilot` | was “low priority” — now resolved               |
| pm2 / yarn4 / pnpm89             | —                   | Omit / minimal     | —                                                              |                                                 |

---

## Vendor official `llms.txt` (verified)

| Stack         | URL                                                | Query API           | Catalog use            |
| ------------- | -------------------------------------------------- | ------------------- | ---------------------- |
| Vendure       | https://docs.vendure.io/llms.txt                   | —                   | reference-pack         |
| Next.js       | https://nextjs.org/llms.txt, /docs/llms-full.txt   | `.md` doc URLs      | reference-pack         |
| React         | https://react.dev/llms.txt                         | —                   | reference-pack         |
| Vite          | https://vite.dev/llms.txt, llms-full.txt           | —                   | reference-pack         |
| Vue           | https://vuejs.org/llms.txt, llms-full.txt          | —                   | reference-pack         |
| Prisma        | https://www.prisma.io/llms.txt, docs/llms-full.txt | pris.ly/llms.txt    | reference-pack         |
| Nx            | https://nx.dev/llms.txt, llms-full.txt             | configure-ai-agents | reference-pack         |
| Turborepo     | https://turbo.build/docs/llms.txt                  | —                   | reference-pack         |
| TanStack      | https://tanstack.com/llms.txt                      | —                   | reference-pack         |
| Vitest        | https://vitest.dev/llms.txt                        | —                   | reference-pack         |
| Storybook     | https://storybook.js.org/llms.txt, llms-full.txt   | MCP `:6006/mcp`     | reference-pack         |
| BullMQ        | https://docs.bullmq.io/llms.txt                    | `?ask=` on `.md`    | reference-pack         |
| i18next       | https://www.i18next.com/llms.txt, llms-full.txt    | `?ask=`             | reference-pack         |
| Strapi        | https://docs.strapi.io/llms.txt (+ full, code)     | Strapi MCP          | reference-pack         |
| Sanity        | https://docs.sanity.io/llms.txt                    | —                   | reference-pack         |
| Elasticsearch | https://www.elastic.co/docs/llms.txt               | —                   | reference-pack         |
| Laravel Nova  | https://nova.laravel.com/docs/llms.txt             | —                   | reference-pack         |
| shadcn/ui     | https://ui.shadcn.com/llms.txt                     | shadcn MCP          | reference-pack + skill |

**No root llms.txt:** NestJS, Jest, Testing Library, Auth.js, Elementor (404), Qliro, Tailwind, Docker, enterprise OIDC/SAML/BankID.

---

## skills.sh import shortlist summary

**Canonical draft:** [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml)

| Metric                     | Value                                                      |
| -------------------------- | ---------------------------------------------------------- |
| Source IDs                 | 22                                                         |
| Skill items (approx.)      | 50+                                                        |
| Items with import cautions | 3 (see hold table)                                         |
| Scope note in YAML         | New candidates only; deduped against prior recommendations |

**Prefer shortlist repos over officialskills.sh links** where both exist:

| Stack      | shortlist repo                                                 | VoltAgent / index name                        |
| ---------- | -------------------------------------------------------------- | --------------------------------------------- |
| Next.js    | `vercel/nextjs-skills`                                         | next-best-practices, next-upgrade             |
| React      | `vercel-labs/agent-skills`                                     | —                                             |
| Stripe     | `stripe/ai` → `stripe-projects`                                | stripe-best-practices                         |
| Prisma     | `prisma/skills`                                                | llms.txt only in index                        |
| Redis      | `redis/agent-skills`                                           | redis-development → **iris-development** file |
| WordPress  | `wordpress/agent-skills`                                       | officialskills.sh WordPress/\*                |
| Vue        | `hyf0/vue-skills` (5 skills)                                   | —                                             |
| Expo       | `expo/skills` (5 pinned)                                       | 11 on index                                   |
| Sanity     | `sanity-io/agent-toolkit`                                      | sanity-best-practices                         |
| NestJS     | `kadajett/agent-nestjs-skills`                                 | —                                             |
| TanStack   | `deckardger/tanstack-agent-skills`                             | —                                             |
| Playwright | `currents-dev/playwright-best-practices-skill`                 | testdino, MS CLI                              |
| Laravel    | `laravel/boost`                                                | skills.laravel.cloud                          |
| Nova       | `jpcaparas/superpowers-laravel`                                | —                                             |
| Docker     | `sickn33/antigravity-awesome-skills`, `github/awesome-copilot` | —                                             |

Wave 3 items not yet in shortlist (add in follow-up): Sentry (16), Apollo (12), Auth0, Better Auth, Supabase, shadcn-ui repo, Playwright MS CLI.

---

## Hold list and import readiness

From [hold_list_resolution.json](./hold_list_resolution.json); **resolved paths** updated per shortlist where JSON was stale.

| skills.sh id                                    | Status             | Lines | Risk / caution                       | In shortlist                                |
| ----------------------------------------------- | ------------------ | ----- | ------------------------------------ | ------------------------------------------- |
| `currents-dev/.../playwright-best-practices`    | resolved           | 304   | none                                 | yes                                         |
| `kadajett/.../nestjs-best-practices`            | resolved           | 131   | none                                 | yes                                         |
| `moteodimassi/.../strapi-v5-expert`             | resolved           | 210   | **Russian content**                  | yes                                         |
| `sickn33/.../docker-expert`                     | resolved           | 419   | none                                 | yes                                         |
| `github/awesome-copilot/multi-stage-dockerfile` | resolved           | 47    | none                                 | yes                                         |
| `deckardger/tanstack-*`                         | unresolved in JSON | —     | —                                    | **yes** (paths added)                       |
| `wshobson/agents/*` (8 skills)                  | unresolved in JSON | —     | —                                    | **yes**                                     |
| `mattpocock/skills/tdd`                         | unresolved in JSON | —     | —                                    | **yes** → `skills/engineering/tdd/SKILL.md` |
| `laravel/boost/laravel-best-practices`          | unresolved in JSON | —     | —                                    | **yes**                                     |
| `jpcaparas/.../nova-resource-patterns`          | unresolved in JSON | —     | —                                    | **yes**                                     |
| `redis/.../redis-development`                   | unresolved in JSON | —     | name → `iris-development`            | yes                                         |
| `meriley/.../vendure-developing`                | unresolved         | —     | —                                    | **no**                                      |
| `jezweb/.../tanstack-start`                     | —                  | —     | **`pnpm dlx` — sanitize**            | yes                                         |
| `anthropics/skills/webapp-testing`              | in shortlist       | —     | **license Unknown / low confidence** | hold                                        |

| Item                             | licenseConfidence | importReady | Blocker                        |
| -------------------------------- | ----------------- | ----------- | ------------------------------ |
| wordpress/agent-skills           | medium            | yes         | GPL audit before mirror        |
| anthropics/skills webapp-testing | **low**           | hold        | Unknown license                |
| jezweb tanstack-start            | medium            | sanitize    | `pnpm dlx` in body             |
| moteodimassi/strapi-v5-expert    | low               | yes         | non-EN content                 |
| Most shortlist MIT items         | medium            | yes         | run `yarn validate` after sync |

---

## Playwright stack ranking

| Rank | Source                                                              | Use when                                    |
| ---- | ------------------------------------------------------------------- | ------------------------------------------- |
| 1    | Microsoft Playwright CLI skills (`playwright-cli install --skills`) | Primary coding-agent E2E                    |
| 2    | `currents-dev/playwright-best-practices` (304L, shortlist)          | Pattern library in catalog                  |
| 3    | testdino `playwright-skill` (VoltAgent)                             | Supplementary patterns                      |
| 4    | Jeffallan `playwright-expert`                                       | Implementation specialist                   |
| 5    | ECC `e2e-testing` + `e2e-runner` agent                              | Workflow + patterns                         |
| —    | `microsoft/playwright-mcp`                                          | Exploratory automation, not primary codegen |

---

## Vendure two-track

| Track                    | Source                                          | Catalog action                                                                       |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Core platform**        | https://docs.vendure.io/llms.txt                | `reference-pack` URL                                                                 |
| **Implementation skill** | `meriley/claude-code-skills/vendure-developing` | **Unresolved** — keep haus `vendure-patterns` for plugin/app specifics until located |

---

## Auth gap nuance

| Layer                      | Source                                                             | Covers                                                      |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| App auth (OAuth, sessions) | Better Auth, Auth0 skills; `wshobson/auth-implementation-patterns` | nextjs, express, dotnet app setup                           |
| Enterprise IdP             | MS Identity Web, Signicat/TIC BankID docs                          | **No unified skill** — keep haus oidc/azure-ad/bankid/saml2 |

---

## 1. ECC agents (47) — MIT

### Tier A — stack reviewers (add all)

| Agent                     | Stacks                             | In catalog? |
| ------------------------- | ---------------------------------- | ----------- |
| `react-reviewer`          | react, react19, typescript, review | Yes         |
| `react-build-resolver`    | react, nextjs, typescript          | Yes         |
| `typescript-reviewer`     | typescript, react, vitest, jest    | No          |
| `vue-reviewer`            | vue, radix, typescript             | No          |
| `php-reviewer`            | php, laravel, phpunit              | Yes         |
| `csharp-reviewer`         | csharp, dotnet                     | Yes         |
| `fsharp-reviewer`         | csharp, dotnet                     | No          |
| `database-reviewer`       | postgresql, prisma, supabase       | Yes         |
| `security-reviewer`       | security, expressjs                | No          |
| `e2e-runner`              | playwright, testing                | Yes         |
| `a11y-architect`          | frontend, radix, shadcn            | No          |
| `healthcare-reviewer`     | review (niche)                     | No          |
| `mle-reviewer`            | review, docker, playwright         | No          |
| `network-config-reviewer` | review                             | No          |

### Tier B — quality/workflow (add)

`build-error-resolver`, `code-reviewer`, `code-explorer`, `code-simplifier`, `comment-analyzer`, `performance-optimizer`, `refactor-cleaner`, `pr-test-analyzer`, `silent-failure-hunter`, `tdd-guide`, `type-design-analyzer`, `doc-updater`, `spec-miner`, `architect`, `planner`, `docs-lookup`

### Tier C — skip unless agent-ops focus

`gan-*`, `harness-optimizer`, `loop-operator`, `marketing-agent`, `homelab-architect`, `network-troubleshooter`, `opensource-*`, `chief-of-staff`, `conversation-analyzer`, `code-architect`, `agent-evaluator`, `seo-specialist`

### Excluded (20) — forbidden stack in name/path

`cpp-*`, `dart-*`, `django-*`, `fastapi-reviewer`, `flutter-reviewer`, `go-*`, `harmonyos-app-resolver`, `java-*`, `kotlin-*`, `python-reviewer`, `pytorch-build-resolver`, `rust-*`, `swift-*`

---

## 2. ECC skills (204) — MIT

### Tier A — direct stack replacements (45)

**Frontend:** `react-patterns`, `react-performance`, `react-testing`, `frontend-patterns`, `frontend-a11y`, `accessibility`, `design-system`, `vite-patterns`, `nextjs-turbopack`, `vue-patterns`, `nuxt4-patterns`, `angular-developer`, `motion-patterns`, `ui-to-vue`

**Backend:** `nestjs-patterns`, `backend-patterns`, `api-design`, `error-handling`, `deployment-patterns`

**PHP/Laravel:** `laravel-patterns`, `laravel-security`, `laravel-tdd`, `laravel-verification`, `laravel-plugin-discovery`

**Data:** `prisma-patterns`, `postgres-patterns`, `mysql-patterns`, `redis-patterns`, `database-migrations`, `jpa-patterns`

**.NET:** `dotnet-patterns`, `csharp-testing`, `fsharp-testing`

**Testing:** `e2e-testing`, `react-testing`, `windows-desktop-e2e`

**Infra:** `docker-patterns`, `kubernetes-patterns`

**Other:** `mcp-server-patterns`, `tinystruct-patterns`, `cisco-ios-patterns`, `compose-multiplatform-patterns`, `energy-procurement`, `nutrient-document-processing`, `healthcare-cdss-patterns`, `healthcare-emr-patterns`

### Tier B — useful adjuncts (128)

Includes: `security-review`, `security-scan`, `git-workflow`, `browser-qa`, `tdd-workflow`, `verification-loop`, `benchmark`, `enterprise-agent-ops`, `documentation-lookup`, `coding-standards`, `hexagonal-architecture`, `production-audit`, `safety-guard`, etc.

### Excluded (67)

Dedicated forbidden-stack names or no stack hit — see [agent-audit.md](./agent-audit.md).

---

## 3. Jeffallan skills (52) — MIT

### Tier A — implementation specialists (27)

| Skill                          | Stacks                                   |
| ------------------------------ | ---------------------------------------- |
| `nestjs-expert`                | nestjs, graphql, prisma                  |
| `graphql-architect`            | graphql, nestjs                          |
| `nextjs-developer`             | nextjs, react19, turbo                   |
| `react-expert`                 | react, tanstack, vitest, testing-library |
| `react-native-expert`          | expo, react-native                       |
| `vue-expert` / `vue-expert-js` | vue, vitest                              |
| `typescript-pro`               | typescript, nx21, turbo, graphql         |
| `laravel-specialist`           | laravel, php, phpunit                    |
| `php-pro`                      | php, laravel, wordpress, prisma          |
| `wordpress-pro`                | wordpress, acf-pro, cms, i18n            |
| `csharp-developer`             | csharp, dotnet, nestjs                   |
| `dotnet-core-expert`           | dotnet, csharp, graphql                  |
| `playwright-expert`            | playwright, storybook                    |
| `postgres-pro` / `sql-pro`     | postgresql, mysql, mariadb               |
| `api-designer`                 | graphql, nestjs                          |
| `security-reviewer`            | security, nestjs                         |
| `mcp-developer`                | backend, typescript                      |
| `cli-developer`                | backend, playwright                      |

Also: `kubernetes-specialist`, `monitoring-expert`, `game-developer`, `salesforce-developer`, `shopify-expert`

### Tier B — cross-cutting (25)

`code-reviewer`, `debugging-wizard`, `test-master`, `secure-code-guardian`, `database-optimizer`, `devops-engineer`, `feature-forge`, `fullstack-guardian`, `legacy-modernizer`, `microservices-architect`, `prompt-engineer`, `spec-miner`, `terraform-engineer`, `websocket-engineer`, `cloud-architect`, `architecture-designer`, `chaos-engineer`, `code-documenter`, `sre-engineer`, `the-fool`, etc.

### Excluded (14)

`django-expert`, `golang-pro`, `java-architect`, `python-pro`, `rust-engineer`, `swift-expert`, `flutter-expert`, etc.

---

## 4. VoltAgent index (231) — license audit per item

Index only. **Pin GitHub repos via shortlist** where available. High-signal picks for wave 3 (not all in shortlist yet):

| Publisher           | Skills                                                   | shortlist repo                     |
| ------------------- | -------------------------------------------------------- | ---------------------------------- |
| Vercel              | next-best-practices, next-cache-components, next-upgrade | `vercel-nextjs-skills`             |
| Stripe              | stripe-best-practices, upgrade-stripe                    | `stripe-ai` (different skill name) |
| Sentry (16)         | sentry-workflow, per-SDK setup skills                    | — (add next)                       |
| Expo (11)           | building-native-ui, upgrading-expo, …                    | `expo-skills-extra` (5 pinned)     |
| WordPress (13)      | wp-plugin-development, wp-rest-api, …                    | `wordpress-agent-skills-extra`     |
| Apollo (12)         | apollo-server, graphql-schema, federation                | — (add next)                       |
| Auth0 / Better Auth | per-framework auth                                       | — (add next)                       |
| Supabase            | postgres-best-practices                                  | —                                  |
| Sanity              | content-modeling, seo-aeo                                | `sanity-agent-toolkit-extra`       |
| Addy Osmani         | web-quality-audit, accessibility, seo                    | —                                  |
| Trail of Bits       | differential-review, static-analysis                     | —                                  |
| testdino            | playwright-skill                                         | secondary to currents + MS CLI     |

Skip: Flutter, Firebase, crypto/Binance, bulk Azure SDKs, NVIDIA ML, PM/marketing.

---

## Haus-owned vs upstream depth

Haus stack skills = thin routers (~**135L** total). Upstream = substantive patterns or official feeds.

| Haus item                 | Lines      | Upstream                             | Lines / feed | Verdict                   |
| ------------------------- | ---------- | ------------------------------------ | ------------ | ------------------------- |
| `nextjs-patterns`         | 135L       | `vercel-nextjs-skills` + llms-full   | official     | **Deprecate**             |
| `react19-patterns`        | 132L       | `react-patterns` + react.dev llms    | 343L+        | **Deprecate**             |
| `laravel-patterns`        | 140L       | `laravel-patterns` / `laravel-boost` | 417L+        | **Deprecate**             |
| `prisma-patterns`         | 160L       | `prisma/skills` + llms-full          | large        | **Deprecate**             |
| `nestjs-graphql-patterns` | 141L       | kadajett + Apollo + Jeffallan        | —            | **Deprecate**             |
| `playwright-patterns`     | 137L       | currents 304L + MS CLI               | —            | **Deprecate**             |
| `vite8-patterns`          | 136L       | `vite-patterns`                      | 451L         | **Deprecate**             |
| `nx21-patterns`           | ~135L      | nx llms + wshobson nx-workspace      | —            | **Deprecate**             |
| `bullmq-patterns`         | ~135L      | bullmq llms.txt                      | full docs    | **Deprecate**             |
| `i18next-patterns`        | ~135L      | i18next llms-full                    | full docs    | **Deprecate**             |
| `nextauth-patterns`       | ~135L      | Better Auth skills                   | 7 skills     | **Deprecate** → migrate   |
| `vendure-patterns`        | ~135L      | vendure llms.txt                     | core docs    | **Hybrid** — plugins stay |
| `qliro-patterns`          | ~135L      | none                                 | —            | **Keep**                  |
| enterprise auth           | ~135L each | fragmented                           | —            | **Keep**                  |

**Deprecation:** set `deprecated` in `manifest.json`, `originUrl` → upstream repo or llms.txt feed.

---

## Haus-only vs deprecate

### Keep haus-owned

- **qliro** — no vendor skill
- **bedrock**, **acf-pro**, **jetengine** — WP plugin matrix
- **elementor-pro** — jezweb skill partial; pro specifics stay haus
- **oidc / azure-ad / bankid / saml2** — enterprise IdP
- **vendure plugin / app** specifics (core → llms.txt)
- **haus workflow:** `writing-documentation`, `lefthook-security`, `agentic-workflow-standard`

### Deprecate haus stack routers (upstream replaces)

`nextjs-patterns`, `react19-patterns`, `vite8-patterns`, `vue-patterns`, `prisma-patterns`, `nestjs-graphql-patterns`, `nx21-patterns`, `turbo-patterns`, `tanstack-query-patterns`, `tanstack-router-patterns`, `bullmq-patterns`, `i18next-patterns`, `storybook-patterns`, `playwright-patterns`, `vitest-patterns`, `sanity-patterns`, `strapi-patterns`, `stripe-patterns`, `supabase-patterns`, `sentry-patterns`, `wordpress-patterns`, `expo-patterns`, `nextauth-patterns`, `laravel-patterns`, `shadcn-ui-patterns`, `radix-ui-patterns`, `tailwindcss-patterns`, `database-patterns`

---

## Catalog ingestion tiers

| Tier                            | Type                                    | Examples                                                                        | manifest pattern                   |
| ------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| **1 — Official skills**         | Sync SKILL.md from vendor repo          | shortlist: Vercel, Stripe, Prisma, Redis, WP, Expo, Laravel Boost               | `type: skill`                      |
| **2 — llms.txt reference-pack** | URL (+ optional snapshot)               | vendure, nextjs, react, bullmq, nx, turbo, tanstack, vitest, storybook, i18next | `reference-pack` or `references[]` |
| **3 — Community select**        | ECC / Jeffallan / wshobson / deckardger | agents Tier A+B; ECC Tier A 45; Jeffallan Tier A 27                             | `sources.yaml` select              |
| **4 — Haus-only**               | No substitute                           | qliro, enterprise auth, WP plugin composite                                     | `skills/haus-owned/`               |

---

## Sync waves

| Wave                           | Content                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 — Agents**                 | ECC agents Tier A + `code-reviewer`, `build-error-resolver`, `tdd-guide`, `pr-test-analyzer`                                                                                   |
| **2 — Stack skills**           | ECC Tier A (45) + Jeffallan Tier A (27)                                                                                                                                        |
| **3 — Vendor skills**          | Merge [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml) into `sources.yaml`; add Sentry, Apollo, Auth0, Better Auth, Supabase, shadcn |
| **4 — Reference packs + gaps** | llms.txt URLs; keep haus for qliro, enterprise auth, vendure plugins, bedrock/elementor/jetengine/acf                                                                          |

---

## Import draft

**Do not duplicate repo tables here.** Canonical `sources.yaml` draft:

→ [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml)

Merge into production `sources.yaml` per wave; run `node scripts/sync-upstream.mjs --apply` and `yarn validate`.

---

## Stacks with no vendor match (final)

| Stack                                             | What exists          | Recommendation     |
| ------------------------------------------------- | -------------------- | ------------------ |
| **qliro**                                         | API dev portal       | Keep haus          |
| **bankid / saml2 / azure-ad / oidc** (enterprise) | Integrator docs      | Keep haus          |
| **acf-pro**                                       | ACF docs             | Keep haus          |
| **elementor-pro** (deep)                          | jezweb partial       | Keep haus for pro  |
| **vendure-developing** skill                      | meriley — unresolved | Keep haus plugins  |
| **jest / testing-library**                        | docs only            | ECC / minimal haus |
| **yarn4 / pnpm89 / pm2**                          | scattered            | omit or minimal    |
| **crypto** (tag)                                  | —                    | clarify tag intent |

---

## Validation and licensing

| Constraint                     | Implication                                        |
| ------------------------------ | -------------------------------------------------- |
| `forbiddenTags`                | No forbidden stack tags on manifest items          |
| `riskyInstallPatterns`         | `pnpm dlx`, `npx -y` fail unless sanitized         |
| `npxTsxOnlyExemptTypes: agent` | Broader npx allowed for agents only                |
| `references[]`                 | `https://` only — llms.txt OK                      |
| GPL (WordPress skills)         | License audit; mirror vs reference-only            |
| Curated dirs                   | Sync via `sync-upstream.mjs --apply`; no hand-edit |

---

## Machine-readable artifacts

| Artifact                          | Location                                                 | Contents                                                                |
| --------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Hold resolution snapshot          | `agent-tools/hold_list_resolution.json`                  | resolved/unresolved, URLs, lines, risk                                  |
| Import shortlist                  | `agent-tools/skills_sh_import_shortlist_2026-06-16.yaml` | sources.yaml-ready entries                                              |
| ECC/Jeffallan/VoltAgent inventory | `agent-tools/agent-audit.md`                             | tier lists, exact counts                                                |
| Ephemeral full match dump         | `/tmp/final-matches.json` (if present)                   | 47 agents, 204 ECC, 52 Jeffallan, 231 VoltAgent — regenerate if missing |

---

## References

- [agent-audit.md](./agent-audit.md)
- [skills_sh_import_shortlist_2026-06-16.yaml](./skills_sh_import_shortlist_2026-06-16.yaml)
- [hold_list_resolution.json](./hold_list_resolution.json)
- [../sources.yaml](../sources.yaml)
- [../validation-rules.json](../validation-rules.json)
- [../docs/adr/0001-curated-verbatim-skill-import.md](../docs/adr/0001-curated-verbatim-skill-import.md)
- [../docs/adr/0002-multi-source-upstream-sync-select-mode.md](../docs/adr/0002-multi-source-upstream-sync-select-mode.md)
- [ECC](https://github.com/affaan-m/ECC) · [Jeffallan](https://github.com/Jeffallan/claude-skills) · [VoltAgent](https://github.com/VoltAgent/awesome-agent-skills) · [officialskills.sh](https://officialskills.sh)
