# Workflow

## Implementation steps

1. For a new content type, prefer the generator: `yarn strapi generate` (then choose `api`) — produces schema + controller + service + route skeleton.
2. Edit `schema.json` to add attributes; set `draftAndPublish` if editors need staging.
3. Implement business logic in `services/<name>.ts` via `factories.createCoreService` override; keep controllers thin.
4. Define explicit `populate` per service method — never `"*"`.
5. Add policies under `policies/` and reference them in `routes/<name>.ts` for protected endpoints.
6. For schema renames or removals, write a migration in `database/migrations/<timestamp>-<name>.ts` and test on a dataset copy first.
7. After adding routes, open the admin UI → Settings → Users & Permissions plugin → Roles → adjust public/authenticated permissions.
8. Restart `yarn develop` and verify the endpoint via `curl` or the admin UI's API tester.
9. Add a Vitest/Jest test for the service method using `strapi.factories` or a test bootstrap.

## Commands

```bash
yarn develop                                   # dev server with admin UI hot reload
yarn start                                     # production server (no admin rebuild)
yarn build                                     # build admin UI
yarn strapi generate                           # interactive generator (api/controller/service/policy/middleware)
yarn strapi console                            # REPL with `strapi` global
yarn strapi ts:generate-types                  # regenerate `types/generated/`
yarn strapi configuration:dump                 # export config snapshot
yarn strapi configuration:restore              # restore from snapshot

# Database
yarn strapi db:migrate                         # apply pending migrations
yarn strapi db:seed                            # run seeders

# Plugin
yarn strapi plugin:build                       # build a local plugin
```

## Validation checklist

- [ ] Content type schemas use kebab-case singular/plural names consistently
- [ ] All custom routes have explicit `policies` for non-public access
- [ ] `users-permissions` roles updated for new endpoints (public 403 check)
- [ ] No `populate: "*"` in any service or controller — explicit shapes only
- [ ] Business logic lives in services, not controllers
- [ ] Lifecycle hooks idempotent — running twice produces same result
- [ ] `draftAndPublish` set explicitly where the editorial workflow requires it
- [ ] No raw Knex / `strapi.db.connection.raw` writes that bypass lifecycle hooks
- [ ] TS types regenerated (`yarn strapi ts:generate-types`) after schema changes
- [ ] No server-only imports in `src/admin/` (would break admin browser bundle)
- [ ] Regression test added before bug fix landed
