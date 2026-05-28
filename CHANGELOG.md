# Changelog

All notable changes to this catalog are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

Each entry covers catalog-level changes (new/removed items, schema changes)
and individual skill/agent version bumps. See `manifest.json` for per-item versions.

---

## [Unreleased]

### Added
- `FUTURE-IMPROVEMENTS.md` — deferred task registry with rationale and implementation guides
- `.gitignore` — expanded from single `.DS_Store` entry to full macOS/Node/editor ruleset
- `schema/haus-lock.schema.json` — canonical lock file schema (moved from haus-ai-workflow)
- `scripts/validation-rules.mjs` — shared validation rule constants (FORBIDDEN_TAGS, BANNED_AGENT_PHRASES, REQUIRED_*_SECTIONS, pattern constants)
- `haus.haus-way-of-work` as `type: "template"` catalog item (was previously an unregistered file)
- `haus.vitest-patterns` — Vitest unit/integration test router
- `haus.jest-patterns` — Jest unit/integration test router (Nx-aware)
- `haus.react-router-v7-patterns` — React Router v7 framework-mode SSR router
- `haus.sanity-patterns` — Sanity v3/v5 schema + GROQ + next-sanity router
- `haus.strapi-patterns` — Strapi v5 content type + controller + service router
- `haus.prisma-patterns` — Prisma schema + migration + query router
- `haus.nextauth-patterns` — NextAuth.js / Auth.js provider, session, callback, middleware router
- `haus.expo-react-native-patterns` — Expo Router + React Native + EAS build/submit router
- `haus.i18next-patterns` — i18next translation key, namespace, SSR routing router
- `haus.bullmq-patterns` — BullMQ queue/worker/scheduler/graceful-shutdown router
- `haus.sentry-patterns` — Sentry SDK init, scope/breadcrumb, PII scrubbing router
- `haus.prettier-setup` — Setup task for `@haus-tech/prettier-config` (triggered by `missing-prettier` token)
- `haus.eslint-setup` — Setup task for `@haus-tech/tech-config` ESLint flat config (triggered by `missing-eslint` token)

### Changed (additional)
- `haus.auth-oidc-azure-bankid-patterns` `1.0.0 → 1.1.0`: extended to cover SAML2 (Laravel `24slides/laravel-saml2`); title now reads "enterprise auth (OIDC / Azure AD / BankID / SAML2)"; SKILL.md adds SAML SP/IDP signing/audience cautions

### Changed
- `haus.typescript6-patterns` → `haus.typescript5-patterns` `1.0.0 → 1.1.0`: renamed skill (id, path, dir, frontmatter, title) to match actual TypeScript 5.x versions used across haus repos
- `haus.database-patterns` `1.0.0 → 1.2.0`: add `redis` (1.1.0) then `mysql` (1.2.0) stacks to `requiresAny` + tags; SKILL.md now covers Redis cache/TTL/namespace inspection and MySQL
- `haus.wordpress-acf-elementor-jetengine-patterns` `1.0.0 → 1.1.0`: add `elementor`, `acf-pro`, `jetengine` stack tokens to `requiresAny` so composer-driven Bedrock sites match without role detection
- `haus.radix-shadcn-patterns` `1.0.0 → 1.1.0`: add `shadcn` stack token to `requiresAny`

### Changed
- `scripts/validate.mjs`: handles `type: "template"` items — checks file existence, resolves refs from file's parent directory
- `scripts/validate.mjs`: added `checkChangelogCoverage()` — warns when item version > 1.0.0 has no CHANGELOG.md entry
- `README.md`: added `## Contributing` section with per-item bump guide and release process; updated Schema section to reference JSON Schema files
- `haus.storybook-patterns`: correct `ecosystem` from `"react"` to `"storybook"`

### Changed
- `scripts/validate.mjs`: refactored to import all rule constants from `validation-rules.mjs` instead of inline declarations

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
