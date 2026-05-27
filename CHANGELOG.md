# Changelog

All notable changes to this catalog are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

Each entry covers catalog-level changes (new/removed items, schema changes)
and individual skill/agent version bumps. See `manifest.json` for per-item versions.

---

## [Unreleased]

---

## [1.0.0] - 2026-05-27

### Added
- Initial catalog: 30 skills, 5 agents, 1 template (`haus-way-of-work`)
- Manifest schema `v0.1.0` with per-item semver versioning
- Standalone CI validator (`scripts/validate.mjs`) — no external dependencies
- GitHub Actions CI on push to `main` and PRs
- Per-skill `references/` directory structure (`conventions.md`, `scope.md`, `workflow.md`)

### Skills (all `1.0.0`)
- `haus.global-engineering-rules` — baseline engineering guardrails
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
- `haus.security-review` — Security review checklist skill
- `haus.production-readiness-review` — Production readiness review skill

### Agents (all `1.0.0`)
- `haus.code-reviewer-agent` — Diff review for correctness and regressions
- `haus.security-reviewer-agent` — Security-focused code review
- `haus.test-reviewer-agent` — Test coverage and assertion review
- `haus.docs-researcher-agent` — Minimal documentation lookup
- `haus.planner-agent` — Implementation planning with file-level steps

---

[Unreleased]: https://github.com/WeAreHausTech/haus-workflow-catalog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/WeAreHausTech/haus-workflow-catalog/releases/tag/v1.0.0
