# Scope

## In-scope files and dirs

- `src/api/**` — content types, controllers, services, routes, policies, middlewares, lifecycles
- `src/plugins/**` — local plugins (each with `server/` + `admin/` halves)
- `src/admin/app.tsx` / `src/admin/extensions/**` — admin UI customization
- `src/extensions/**` — overrides for core or installed plugins (e.g. `users-permissions`)
- `config/database.ts` / `config/server.ts` / `config/admin.ts` / `config/plugins.ts` / `config/middlewares.ts`
- `database/migrations/**` — Strapi-managed migrations (run on boot)
- `package.json` — `@strapi/strapi` version (v5 only in scope for this skill)

## Stack boundaries

- Strapi v5: Document Service API, new lifecycle signatures, plugin auth changes
- Not in scope: Strapi v4 — controller/service signatures differ; use a separate v4 skill
- Frontend consumer changes (Next.js calling Strapi REST/GraphQL) → combine with `nextjs-patterns`
- DB schema work beyond Strapi schemas → combine with `database-patterns`
- Test work → use `vitest-patterns` or `jest-patterns` depending on test runner

## Triggers

- Adding a new content type or modifying schema attributes/relations
- Adding a custom route, controller override, or service method
- Adding a policy, middleware, or lifecycle hook
- Changing `users-permissions` defaults for public/authenticated roles
- Modifying `config/plugins.ts` for installed plugin config
- Admin UI extension or custom field component
- Strapi v4 → v5 migration tasks
