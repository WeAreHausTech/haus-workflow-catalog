# Changelog

All notable changes to this catalog are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

Each entry covers catalog-level changes (new/removed items, schema changes)
and individual skill/agent version bumps. See `manifest.json` for per-item versions.

---

## [2.7.1](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.7.0...v2.7.1) (2026-06-15)

## [2.7.0](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.6.5...v2.7.0) (2026-06-15)

### Added

- **agents:** add 11 curated agents + multi-source upstream sync ([#20](https://github.com/WeAreHausTech/haus-workflow-catalog/issues/20)) ([2f3989a](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/2f3989a29959201f50ed1818c764437ad0a590cd))

## [2.6.5](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.6.4...v2.6.5) (2026-06-12)

## [2.6.4](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.6.3...v2.6.4) (2026-06-12)

### Fixed

- **ci:** format sync output, ignore item trees ([113c167](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/113c167b7e7e8eb01ddefc590cc7680a3ddb8259))
- **sync:** fetch upstream HEAD and sync skills/shared ([624160d](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/624160d78905bca33fb1c7f0af37b1ca90b8e466))

## [Unreleased]

### Changed

- Manifest `references[]` is https:// URLs only; relative paths removed (bundled files install via haus-workflow full-tree cache). Schema and validator updated.

## [2.6.3](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.6.2...v2.6.3) (2026-06-11)

### Changed

- update agent requirements and validation rules ([deae4e8](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/deae4e8a4ae65bba9255907b2ddd5c28f6ef0d4c))

## [2.6.2](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.6.1...v2.6.2) (2026-06-11)

## [2.6.1](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.6.0...v2.6.1) (2026-06-09)

### Changed

- `superpowers-brainstorming` 1.0.2 — haus patch to `scripts/helper.js` replacing `innerHTML` with safe DOM APIs (CodeQL XSS). See ADR-0001.

## [2.6.0](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.5.0...v2.6.0) (2026-06-09)

### Added

- adopt description frontmatter and drop curated workarounds ([#12](https://github.com/WeAreHausTech/haus-workflow-catalog/issues/12)) ([b2d6ca5](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/b2d6ca533429392e97b17541381bbc172bcc28d8))

## [2.5.0](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.4.2...v2.5.0) (2026-06-09)

### Added

- import curated superpowers skills and commands ([#11](https://github.com/WeAreHausTech/haus-workflow-catalog/issues/11)) ([dfa9473](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/dfa9473c2f84c2622cccdb67bd7056763e320c64))

## [2.4.2](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.4.1...v2.4.2) (2026-06-05)

### Fixed

- Add forbidden content checks and update validation ([74c9c9c](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/74c9c9c9764e67f3e7dd961bda5d30599f0015c4))
- enhance dispatch workflow for catalog fixture synchronization ([2fac70d](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/2fac70da9ff85c26faa8d681a4d5595a73f48b85))

## [2.4.1](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.4.0...v2.4.1) (2026-06-04)

## [2.4.0](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.3.0...v2.4.0) (2026-06-03)

### Added

- add writing-documentation skill as default + slim workflow-config ([25187e3](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/25187e304a253be1e93e6b333e699a782c796818))

### Fixed

- bump template version + address review on [#9](https://github.com/WeAreHausTech/haus-workflow-catalog/issues/9) ([8fc12ec](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/8fc12ecfb11a35acafc0e54f09379157699257cf))

## [2.3.0](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.2.0...v2.3.0) (2026-06-03)

### Added

- add haus.lefthook-security template; fix deny-rule syntax in workflow standard ([271c6a9](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/271c6a9fb70e0c93ec7fe73be2771dfb9d9c664b))
- **templates:** add haus.memory-conventions doc ([18e31e7](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/18e31e7b9bc1c7a850cfa66d318c1f10fbdb48f6))

### Fixed

- make gitleaks optional and grep added-lines-only in lefthook-security ([e0b691d](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/e0b691d7a3edbaba8b75671ca634b9106d1b2e4f))
- **scripts:** skip id-less items in tag audit; byte-compare workflow docs ([eefd05d](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/eefd05dd5c2a456ea1e0b52797e59a1b7242b1b4))
- use allowlisted tags for haus.lefthook-security ([3b64988](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/3b64988be97c9d037863b36210fbb16d2d575dde))

### Changed

- remove global engineering rules skill and update manifest ([98b4a3a](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/98b4a3a59abb6b8d40a8a2896282b7dcdb3770d6))
- **scripts:** single-source validation rules + unify tag allowlist ([4281b44](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/4281b443a880ed94db9db547c4194636b666c456))

## [2.2.0](https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v2.0.2...v2.2.0) (2026-06-01)

### Added

- add agentic workflow standard template, replace haus-way-of-work ([da1c372](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/da1c3723c6c8c345524fad55dacef90939336d54))
- **ci:** dispatch fixture sync to haus-workflow on manifest.json changes ([bc666aa](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/bc666aab4661eda70db44a08f2bba88cb3d64d0f))

### Fixed

- negate secret-scan grep, correct CHANGELOG path ([99940d0](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/99940d06acf2bb1aaec52f7e76308f263f914696))
- revert CHANGELOG path to .haus-workflow/WORKFLOW.md ([d1ad319](https://github.com/WeAreHausTech/haus-workflow-catalog/commit/d1ad3195a6de5fefee5faf3576b297248bb90404))

## [Unreleased]

## [2.1.0] - 2026-05-29

### Added

- `haus.agentic-workflow-standard` `1.0.0`: new template providing the full agentic development workflow standard. Generates `.haus-workflow/WORKFLOW.md` (managed, auto-updated) during project setup. Replaces `haus-way-of-work`.

### Removed

- `haus.haus-way-of-work`: replaced by `haus.agentic-workflow-standard`.

## [2.0.2] - 2026-05-29

### Added

- `CLAUDE.md` — AI workflow guide covering repo structure, authoring rules, validation commands, and release process.

### Changed

- `haus.prettier-setup` `1.0.0 → 1.1.0`: updated conventions, scope, and workflow references.
- `haus.eslint-setup` `1.0.0 → 1.1.0`: updated conventions reference.
- `haus.package-manager-yarn4-pnpm89` `1.0.0 → 1.0.1`: minor formatting fixes in workflow reference.

### Removed

- `FUTURE-IMPROVEMENTS.md`: closed FI-1 (automated fixture sync), FI-2 (full validate-catalog rules), and FI-4 (update --check tag comparison) — all implemented.

## [2.0.1] - 2026-05-28

### Fixed

- All 52 manifest items now carry `reviewStatus: "approved"` and `riskLevel` (`low` for most; `medium` for stripe, qliro, auth-oidc, nextauth). Fields were defined in schema but unpopulated.
- `release.yml` validation step switched from offline `node scripts/validate.mjs` to `haus validate-catalog ./manifest.json`, matching `validate.yml`.
- Removed stale `EXECUTION-PLAN.md F6` reference from `scripts/validation-rules.mjs`.

### Added

- `LICENSE` (MIT).
- README: Catalog overview with item count and compatibility note; How it works section (install/update flow, validation rule sync); Making changes section (bump rules, CHANGELOG requirement, release process).

## [2.0.0] - 2026-05-28

### Breaking Changes

- `haus.typescript6-patterns` renamed to `haus.typescript5-patterns` (`1.0.0 → 1.1.0`). Path, dir, frontmatter, and title updated to reflect actual TypeScript 5.x usage. Consumers with `haus.typescript6-patterns` in `haus.lock.json` must re-run `haus update --apply` to pick up the new id. Requires `@haus-tech/haus-workflow >= 0.4.0`.

### Added

- 14 new skills closing the detection-improvement plan (T2–T28):
  - `haus.vitest-patterns` — Vitest unit/integration test router
  - `haus.jest-patterns` — Jest unit/integration test router (Nx-aware)
  - `haus.react-router-v7-patterns` — React Router v7 framework-mode SSR router
  - `haus.sanity-patterns` — Sanity v3/v5 schema + GROQ + next-sanity router
  - `haus.strapi-patterns` — Strapi v5 content type + controller + service router
  - `haus.prisma-patterns` — Prisma schema + migration + query router
  - `haus.nextauth-patterns` — NextAuth.js / Auth.js provider/session/callback/middleware router
  - `haus.expo-react-native-patterns` — Expo Router + React Native + EAS build/submit router
  - `haus.i18next-patterns` — i18next namespace/key/SSR routing router
  - `haus.bullmq-patterns` — BullMQ queue/worker/scheduler/graceful-shutdown router
  - `haus.sentry-patterns` — Sentry SDK init, scope/breadcrumb, PII scrubbing router
  - `haus.prettier-setup` — Setup task for `@haus-tech/prettier-config` (triggered by `missing-prettier` token)
  - `haus.eslint-setup` — Setup task for `@haus-tech/tech-config` ESLint flat config (triggered by `missing-eslint` token)
  - `haus.stripe-patterns` — Stripe Elements, Checkout, webhooks, PCI-safe integration router
  - `haus.qliro-patterns` — Qliro Checkout via `@haus-tech/qliro-plugin` router
  - `haus.supabase-patterns` — Supabase client, RLS, Edge Functions, Storage router

### Changed

- `haus.auth-oidc-azure-bankid-patterns` `1.0.0 → 1.1.0`: extended to cover SAML2 (Laravel `24slides/laravel-saml2`); title now reads "enterprise auth (OIDC / Azure AD / BankID / SAML2)"; SKILL.md adds SAML SP/IDP signing/audience cautions
- `haus.database-patterns` `1.0.0 → 1.2.0`: add `redis` (1.1.0) then `mysql` (1.2.0) stacks to `requiresAny` + tags; SKILL.md now covers Redis cache/TTL/namespace inspection and MySQL
- `haus.wordpress-acf-elementor-jetengine-patterns` `1.0.0 → 1.1.0`: add `elementor`, `acf-pro`, `jetengine` stack tokens to `requiresAny` so composer-driven Bedrock sites match without role detection
- `haus.radix-shadcn-patterns` `1.0.0 → 1.1.0`: add `shadcn` stack token to `requiresAny`
- CI validation switched from `node scripts/validate.mjs` to the published `@haus-tech/haus-workflow` CLI (`haus validate-catalog ./manifest.json`); script remains available for offline checks.

### Compatibility

- This release pairs with `@haus-tech/haus-workflow >= 0.9.0` (allowlist contains all new tags: vitest, jest, redis, sanity, strapi, prisma, mysql, saml2, next-auth, expo, react-native, mobile, i18next, bullmq, sentry, missing-prettier, missing-eslint, stripe, qliro, supabase, etc.).

---

## [1.0.0] - 2026-05-27

### Added

- Initial catalog: 30 skills, 5 agents, 1 template (`haus-way-of-work`)
- Manifest schema `v0.1.0` with per-item semver versioning
- Standalone CI validator (`scripts/validate.mjs`) — no external dependencies
- GitHub Actions CI on push to `main` and PRs
- Per-skill `references/` directory structure (`conventions.md`, `scope.md`, `workflow.md`)
- `schema/catalog-item.schema.json` — canonical JSON Schema for all CatalogItem fields
- `schema/manifest.schema.json` — JSON Schema for top-level manifest.json structure
- `CHANGELOG.md` — release history following Keep a Changelog format
- `EXECUTION-PLAN.md` — cross-repo improvement plan for catalog × CLI alignment

### Fixed

- `haus.typescript6-patterns`: add missing `ecosystem: "typescript"`
- `haus.playwright-patterns`: add missing `ecosystem: "playwright"`
- `haus.tailwind-scss-patterns`: correct `ecosystem` from `"react"` to `"tailwind"`
- `haus.auth-oidc-azure-bankid-patterns`: add missing `ecosystem: "auth"`
- `haus.database-patterns`: add missing `ecosystem: "database"`
- `haus.package-manager-yarn4-pnpm89`: add missing `ecosystem: "packagemanager"`
- `haus.testing-library-patterns`: add missing `ecosystem: "testing"`
- `haus.security-review`: add missing `ecosystem: "security"`, set `default: true`
- `haus.production-readiness-review`: add missing `ecosystem: "production"`, set `default: true`

### Skills (all `1.0.0`)

- `haus.global-engineering-rules` — baseline engineering guardrails (default)
- `haus.nextjs-patterns` — Next.js App Router patterns
- `haus.react19-patterns` — React 19 component patterns
- `haus.typescript6-patterns` — TypeScript 6 type safety patterns
- `haus.vite8-patterns` — Vite 8 build configuration patterns
- `haus.vendure-plugin-patterns` — Vendure plugin development
- `haus.vendure-app-patterns` — Vendure storefront patterns
- `haus.nestjs-graphql-patterns` — NestJS + GraphQL API patterns
- `haus.laravel-patterns` — Laravel application patterns
- `haus.laravel-nova-patterns` — Laravel Nova admin patterns
- `haus.wordpress-patterns` — WordPress theme/plugin patterns
- `haus.wordpress-bedrock-patterns` — WordPress Bedrock stack patterns
- `haus.wordpress-acf-elementor-jetengine-patterns` — ACF + Elementor + JetEngine patterns
- `haus.dotnet-patterns` — .NET application patterns
- `haus.dotnet-service-patterns` — .NET service/microservice patterns
- `haus.playwright-patterns` — Playwright E2E test patterns
- `haus.nx21-monorepo-patterns` — Nx 21 monorepo patterns
- `haus.turbo-monorepo-patterns` — Turborepo monorepo patterns
- `haus.tanstack-query-router-patterns` — TanStack Query + Router patterns
- `haus.radix-shadcn-patterns` — Radix UI + shadcn/ui component patterns
- `haus.tailwind-scss-patterns` — Tailwind CSS + SCSS patterns
- `haus.vue-patterns` — Vue 3 component patterns
- `haus.storybook-patterns` — Storybook component documentation patterns
- `haus.testing-library-patterns` — Testing Library patterns
- `haus.phpunit-patterns` — PHPUnit test patterns
- `haus.package-manager-yarn4-pnpm89` — Yarn 4 + pnpm 8/9 patterns
- `haus.database-patterns` — Database query and migration patterns
- `haus.auth-oidc-azure-bankid-patterns` — OIDC, Azure AD, BankID auth patterns
- `haus.security-review` — Security review checklist skill (default)
- `haus.production-readiness-review` — Production readiness review skill (default)

### Agents (all `1.0.0`)

- `haus.code-reviewer-agent` — Diff review for correctness and regressions (default)
- `haus.security-reviewer-agent` — Security-focused code review
- `haus.test-reviewer-agent` — Test coverage and assertion review
- `haus.docs-researcher-agent` — Minimal documentation lookup
- `haus.planner-agent` — Implementation planning with file-level steps

---

[Unreleased]: https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/WeAreHausTech/haus-workflow-catalog/releases/tag/v1.0.0
