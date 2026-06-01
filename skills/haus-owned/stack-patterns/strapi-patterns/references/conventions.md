## Naming conventions

- Content type API folder: `src/api/<singular-name>/` (e.g. `src/api/article/`)
- Schema file: `src/api/<name>/content-types/<name>/schema.json` — `kind` is `collectionType` or `singleType`
- Schema `singularName` / `pluralName` — lowercase, hyphenated when multi-word
- Controllers: `src/api/<name>/controllers/<name>.ts` — export `factories.createCoreController(...)` with optional overrides
- Services: `src/api/<name>/services/<name>.ts` — same `factories.createCoreService` pattern
- Routes: `src/api/<name>/routes/<name>.ts` — default `factories.createCoreRouter` or custom router object
- Policies: `src/api/<name>/policies/<policy-name>.ts` — function `(policyContext, config, { strapi }) => boolean | Promise<boolean>`
- Middlewares: `src/api/<name>/middlewares/<name>.ts` — Koa-style `async (ctx, next) => ...`
- Plugin: `src/plugins/<plugin-name>/` mirrors top-level layout (`server/` + `admin/`)
- Lifecycle hooks: `src/api/<name>/content-types/<name>/lifecycles.ts` — `beforeCreate`, `afterUpdate`, etc.

## Do / don't

DO: Use `strapi.documents("api::article.article")` v5 Document Service API for CRUD — DON'T: use deprecated `strapi.entityService` patterns from v4 tutorials
DO: Keep business logic in services; controllers only translate HTTP → service call → HTTP — DON'T: cram logic into the controller default override
DO: Define `populate` strategy explicitly per query — DON'T: `populate: "*"` (deep population kills perf)
DO: Use lifecycle hooks for cross-cutting concerns (audit logs, denormalization) — DON'T: scatter the same logic across multiple controllers
DO: Set `draftAndPublish: true` in schema when editors need a publish workflow — DON'T: leave it implicit
DO: Use `policies` for authorization, `middlewares` for request shaping — DON'T: do auth inside controllers
DO: Read tokens via `strapi.config.get("plugin::users-permissions.jwt.secret")` — DON'T: hard-code env var names

## Forbidden patterns

NEVER: write to the DB outside `strapi.documents` / `strapi.db` — bypasses lifecycle hooks and validation
NEVER: change `kind` from `collectionType` to `singleType` (or vice versa) on populated data — destroys content
NEVER: rename `singularName` / `pluralName` on a deployed type without a migration plan — breaks API consumers
NEVER: commit `.env` with `JWT_SECRET` or `API_TOKEN_SALT` — rotate before public push if leaked
NEVER: ship `populate: "*"` to production — recursive deep populate is the #1 perf killer
NEVER: skip the `users-permissions` step after adding a custom route — endpoint returns 403 silently
NEVER: import server-only modules (`@strapi/strapi`) inside `src/admin/` — admin runs in the browser
NEVER: edit `dist/` or `.cache/` — both are build artifacts; changes vanish on next build
