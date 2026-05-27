# Changelog

All notable changes to this catalog are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

Each entry covers catalog-level changes (new/removed items, schema changes)
and individual skill/agent version bumps. See `manifest.json` for per-item versions.

---

## [Unreleased]

### Added
- `scripts/validation-rules.mjs` — shared validation rule constants (FORBIDDEN_TAGS, BANNED_AGENT_PHRASES, REQUIRED_*_SECTIONS, pattern constants)

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
