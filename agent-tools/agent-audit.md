## Method

Scanned all 4 sources against `validation-rules.json` stacks only.

- **Excluded:** items whose **name/path** is dedicated to forbidden stacks (`python`, `django`, `go`, `rust`, `java`, `kotlin`, `swift`, `android`, `flutter`, `dart`, `c++`, `perl`, `defi`, `trading`)
- **Included:** everything else matching ≥1 allowed stack tag (name + description)
- **Not filtered** against haus-owned catalog

| Source           | Total items  | Stack matches |
| ---------------- | ------------ | ------------- |
| ECC agents       | 67           | **47**        |
| ECC skills       | 271          | **204**       |
| Jeffallan skills | 66           | **52**        |
| VoltAgent index  | ~1400+ links | **231**       |

---

## 1. ECC agents (47) — MIT, sync-ready

### Tier A — stack reviewers (add all)

| Agent                     | Stacks                             |
| ------------------------- | ---------------------------------- |
| `react-reviewer`          | react, react19, typescript, review |
| `react-build-resolver`    | react, nextjs, typescript          |
| `typescript-reviewer`     | typescript, react, vitest, jest    |
| `vue-reviewer`            | vue, radix, typescript             |
| `php-reviewer`            | php, laravel, phpunit              |
| `csharp-reviewer`         | csharp, dotnet                     |
| `fsharp-reviewer`         | csharp, dotnet                     |
| `database-reviewer`       | postgresql, prisma, supabase       |
| `security-reviewer`       | security, expressjs                |
| `e2e-runner`              | playwright, testing                |
| `a11y-architect`          | frontend, radix, shadcn            |
| `healthcare-reviewer`     | review (niche)                     |
| `mle-reviewer`            | review, docker, playwright         |
| `network-config-reviewer` | review                             |

### Tier B — quality/workflow agents (add)

`build-error-resolver`, `code-reviewer`, `code-explorer`, `code-simplifier`, `comment-analyzer`, `performance-optimizer`, `refactor-cleaner`, `pr-test-analyzer`, `silent-failure-hunter`, `tdd-guide`, `type-design-analyzer`, `doc-updater`, `spec-miner`, `architect`, `planner`, `docs-lookup`

### Tier C — skip unless agent-ops focus

`gan-*`, `harness-optimizer`, `loop-operator`, `marketing-agent`, `homelab-architect`, `network-troubleshooter`, `opensource-*`, `chief-of-staff`, `conversation-analyzer`, `code-architect`, `agent-evaluator`, `seo-specialist`

### Excluded (20) — forbidden stack in name

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

Includes: `security-review`, `security-scan`, `security-bounty-hunter`, `git-workflow`, `browser-qa`, `tdd-workflow`, `verification-loop`, `benchmark`, `ai-regression-testing`, `enterprise-agent-ops`, `hookify-rules`, `documentation-lookup`, `coding-standards`, `hexagonal-architecture`, `autonomous-agent-harness`, `orch-*`, `production-audit`, `safety-guard`, etc.

### Excluded (67) — dedicated forbidden-stack or no stack hit

`django-*`, `golang-*`, `rust-*`, `kotlin-*`, `swift*`, `python-*`, `perl-*`, `springboot-*`, `quarkus-*`, `dart-flutter-patterns`, `defi-*`, `llm-trading-*`, homelab/network ops, logistics, marketing, scientific DBs, etc.

---

## 3. Jeffallan skills (52) — MIT, new `sources.yaml` entry

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
| `api-designer`                 | graphql, nestjs, rest                    |
| `security-reviewer`            | security, nestjs                         |
| `graphql-architect`            | graphql, federation                      |
| `mcp-developer`                | backend, typescript                      |
| `cli-developer`                | backend, playwright                      |

Also: `kubernetes-specialist`, `monitoring-expert`, `fine-tuning-expert`, `game-developer`, `rails-expert`, `salesforce-developer`, `shopify-expert`

### Tier B — cross-cutting (25)

`code-reviewer`, `debugging-wizard`, `test-master`, `secure-code-guardian`, `database-optimizer`, `devops-engineer`, `feature-forge`, `fullstack-guardian`, `legacy-modernizer`, `microservices-architect`, `prompt-engineer`, `spec-miner`, `terraform-engineer`, `websocket-engineer`, `cloud-architect`, `architecture-designer`, `atlassian-mcp`, `chaos-engineer`, `code-documenter`, `embedded-systems`, `ml-pipeline`, `monitoring-expert`, `rag-architect`, `sre-engineer`, `the-fool`

### Excluded (14)

`django-expert`, `fastapi-expert`, `golang-pro`, `java-architect`, `kotlin-specialist`, `python-pro`, `rust-engineer`, `swift-expert`, `flutter-expert`, `cpp-pro`, `spring-boot-engineer`, `pandas-pro`, `spark-engineer`, `rails-expert` (turbo tag only — borderline)

---

## 4. VoltAgent index (231 matches) — per-item license audit required

Index only; sync from upstream repos. High-signal official picks:

| Publisher               | Skills to add                                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vercel**              | `next-best-practices`, `next-cache-components`, `next-upgrade`                                                                                                                                      |
| **Stripe**              | `stripe-best-practices`, `upgrade-stripe`                                                                                                                                                           |
| **Sanity**              | `sanity-best-practices`, `content-modeling-best-practices`, `seo-aeo-best-practices`                                                                                                                |
| **Supabase**            | `postgres-best-practices`                                                                                                                                                                           |
| **Sentry** (16)         | `sentry-sdk-setup`, `sentry-workflow`, `sentry-fix-issues`, per-SDK: `sentry-nextjs-sdk`, `sentry-nestjs-sdk`, `sentry-php-sdk`, `sentry-react-sdk`, `sentry-dotnet-sdk`, `sentry-react-native-sdk` |
| **Expo** (11)           | `building-native-ui`, `expo-api-routes`, `expo-cicd-workflows`, `expo-deployment`, `upgrading-expo`, `expo-tailwind-setup`                                                                          |
| **CallStack**           | `react-native-best-practices`, `upgrading-react-native`                                                                                                                                             |
| **WordPress** (13)      | `wordpress-router`, `wp-plugin-development`, `wp-rest-api`, `wp-phpstan`, `wp-performance`, `wp-block-development`, `wpds`                                                                          |
| **Apollo GraphQL** (12) | `apollo-server`, `apollo-client`, `apollo-federation`, `graphql-schema`, `graphql-operations`, `rover`                                                                                              |
| **Auth0** (9+)          | `auth0-nextjs`, `auth0-express`, `auth0-aspnetcore-api`, `auth0-vue`, `auth0-nuxt`, `auth0-mfa`                                                                                                     |
| **Better Auth** (7)     | `best-practices`, `create-auth`, `providers`, `emailAndPassword`, `twoFactor`                                                                                                                       |
| **Anthropic**           | `webapp-testing`, `frontend-design`, `mcp-builder`                                                                                                                                                  |
| **Addy Osmani**         | `web-quality-audit`, `accessibility`, `seo`                                                                                                                                                         |
| **Trail of Bits**       | `differential-review`, `insecure-defaults`, `static-analysis`                                                                                                                                       |
| **Redis**               | `redis-development`                                                                                                                                                                                 |
| **Neon/Netlify**        | `neon-postgres`, `netlify-db`, `netlify-deploy`                                                                                                                                                     |
| **Figma**               | `figma-generate-design`, `figma-use`                                                                                                                                                                |
| **Google Labs**         | `shadcn-ui`                                                                                                                                                                                         |
| **testdino**            | `playwright-skill` (70+ patterns)                                                                                                                                                                   |
| **Remotion**            | `remotion`                                                                                                                                                                                          |

Skip VoltAgent entries for Flutter, Firebase (unless expanding), crypto/Binance, bulk Microsoft Azure SDKs, NVIDIA ML, PM/marketing skills.

---

## 5. Gaps — no solid third-party in these 4 sources

Keep haus-owned or find other upstream:

| Stack                                | Status                                                |
| ------------------------------------ | ----------------------------------------------------- |
| **Vendure / Vendure3**               | no match                                              |
| **Qliro**                            | no match                                              |
| **Laravel Nova**                     | weak (`laravel-plugin-discovery` only)                |
| **Bedrock / Elementor / JetEngine**  | partial via `wordpress-pro`                           |
| **BullMQ**                           | tangential in `redis-patterns`, `deployment-patterns` |
| **i18next**                          | tangential in `wordpress-pro`                         |
| **NextAuth**                         | use Auth0 / Better Auth upstream instead              |
| **NX 21**                            | `typescript-pro` mentions nx; no dedicated skill      |
| **TanStack Query+Router**            | covered inside `react-patterns` / `react-expert`      |
| **Storybook**                        | `react-testing`, `playwright-expert`                  |
| **OIDC / Azure AD / BankID / SAML2** | Auth0 partial; enterprise auth gap remains            |

---

## 6. Haus-owned vs upstream — replace/fix assessment

Haus stack skills = **thin routers** (~40L SKILL + ~95L refs ≈ **135L total**).

ECC equivalents = **230–450L** substantive patterns (examples):

| Haus item                 | Lines | ECC upstream                       | Lines           |
| ------------------------- | ----- | ---------------------------------- | --------------- |
| `nextjs-patterns`         | 135L  | `nextjs-turbopack` + Vercel skills | 59L + official  |
| `react19-patterns`        | 132L  | `react-patterns`                   | 343L            |
| `laravel-patterns`        | 140L  | `laravel-patterns`                 | 417L            |
| `prisma-patterns`         | 160L  | `prisma-patterns`                  | 373L            |
| `nestjs-graphql-patterns` | 141L  | `nestjs-patterns` + Apollo         | 232L + official |
| `playwright-patterns`     | 137L  | `e2e-testing`                      | 328L            |
| `vite8-patterns`          | 136L  | `vite-patterns`                    | 451L            |

**Verdict:** haus-owned stack skills are **routing shells**, not maintenance-grade pattern libraries. Upstream ECC/Jeffallan/VoltAgent content is deeper and maintained elsewhere.

### Recommended catalog strategy

1. **Agents:** expand ECC `sources.yaml` select list to all Tier A+B agents (~30 items)
2. **Stack skills:** replace haus `stack-patterns/*` with ECC select sync where Tier A exists
3. **Add Jeffallan** as second source for implementation specialists (nestjs, react, laravel, wordpress, playwright, dotnet)
4. **Add VoltAgent picks** as separate pinned sources (Stripe, Sentry, Vercel, Expo, WordPress, Apollo, Auth0/Better Auth)
5. **Keep haus-owned only for:** vendure, qliro, bedrock/elementor/jetengine, auth-oidc-azure-bankid, nx21, bullmq, nextauth (until Better Auth migration), `writing-documentation`, `lefthook-security`, `agentic-workflow-standard`
6. **Deprecate** haus stack routers that have upstream Tier A match — mark `deprecated` in manifest, point `originUrl` at upstream

### Suggested sync priority (third-party first)

**Wave 1 — agents + core reviewers:** ECC agents Tier A + `code-reviewer`, `build-error-resolver`, `tdd-guide`, `pr-test-analyzer`

**Wave 2 — stack skills:** ECC Tier A (45 skills) + Jeffallan Tier A (27)

**Wave 3 — official vendor skills:** Sentry, Stripe, Vercel, Expo, WordPress, Apollo, Sanity, Supabase, Auth0/Better Auth from VoltAgent index

**Wave 4 — fill gaps:** keep minimal haus-owned for vendure/qliro/enterprise-auth only

---

Full machine-readable inventory: `/tmp/final-matches.json` (47 agents, 204 ECC skills, 52 Jeffallan, 231 VoltAgent).

Want next step: draft `sources.yaml` + manifest entries for Wave 1–2?
