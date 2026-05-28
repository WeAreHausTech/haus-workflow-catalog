---
name: strapi-patterns
description: Strapi v5 router. Use for content type schemas, controllers, services, policies, and admin plugin work.
---

# Strapi Patterns

## Use when

- task changes content type schemas (`src/api/<type>/content-types/<type>/schema.json`)
- task touches controllers, services, routes, policies, or middlewares under `src/api/`
- task adds or modifies a Strapi plugin (`src/plugins/<name>`)
- task changes admin customization (`src/admin/app.tsx`, `src/admin/extensions`)

## Do not use when

- project uses Sanity, WordPress, or another CMS (use the matching skill)
- task is pure frontend consumer code with no Strapi schema/contract change
- task is database migration unrelated to Strapi schemas (use `database-patterns`)

## Inspect first

- `src/api/<type>/content-types/<type>/schema.json` — attributes, relations, draftAndPublish
- `src/api/<type>/controllers/<type>.ts` — default factory wrapper or custom overrides
- `src/api/<type>/routes/<type>.ts` — exposed endpoints
- `src/api/<type>/policies/` — per-route auth/permission policies
- `config/database.ts`, `config/admin.ts`, `config/plugins.ts` — runtime config
- `package.json` — `@strapi/strapi` version (v5 conventions only here)

## Avoid mistakes

- editing v4 conventions in a v5 project — controller/service signatures differ
- bypassing `strapi.entityService` / `strapi.documents` in v5 and using raw Knex queries
- modifying `schema.json` `kind` (collection vs single) on a populated content type — destroys data
- forgetting to update permissions in `users-permissions` plugin after adding a new route
- leaking `STRAPI_ADMIN_JWT_SECRET` or `JWT_SECRET` to client bundles

## Router

1. Load `references/conventions.md` for schema, controller, and service patterns.
2. Load `references/scope.md` for in-scope files and v4-vs-v5 stack boundaries.
3. Load `references/workflow.md` only for content-type lifecycle and migration flow.
4. Keep schemas declarative, controllers thin, business logic in services.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
