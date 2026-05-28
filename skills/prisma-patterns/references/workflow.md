# Workflow

## Implementation steps

1. Edit `prisma/schema.prisma` to add/modify models, enums, or relations.
2. For new required columns on populated tables, add a default OR write a backfill in the same migration's `migration.sql`.
3. Run `yarn prisma migrate dev --name <short-description>` — Prisma generates the migration and applies it locally.
4. Inspect the generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql` before committing.
5. Re-run `yarn prisma generate` if needed; verify TS types compile (`yarn typecheck`).
6. For multi-step writes, wrap in `prisma.$transaction(async (tx) => { ... })`.
7. For Next.js, ensure the PrismaClient singleton uses the `globalThis` guard so HMR doesn't leak connections.
8. Add a regression test that hits the new model/query via a Vitest/Jest integration test against a test database.
9. In production, deploy migrations via `yarn prisma migrate deploy` — never `migrate dev`.
10. For destructive changes (drop column/table), do a two-phase deploy: deploy code that stops reading first, then drop in the next deploy.

## Commands

```bash
yarn prisma generate                              # regenerate Client from schema
yarn prisma migrate dev --name <description>      # create + apply migration locally
yarn prisma migrate deploy                        # apply pending migrations (production)
yarn prisma migrate reset                         # WIPE local DB + reapply all migrations (dev only)
yarn prisma migrate status                        # show drift between schema and DB
yarn prisma db push                               # sync schema without creating a migration (prototyping)
yarn prisma db seed                               # run seed script
yarn prisma studio                                # browser GUI for inspecting data
yarn prisma format                                # canonicalize schema.prisma formatting
yarn prisma validate                              # static-validate schema

# Diagnostic
yarn prisma migrate diff --from-schema-datamodel ./prisma/schema.prisma --to-schema-datasource ./prisma/schema.prisma
```

## Validation checklist

- [ ] `prisma generate` ran and Client types match committed schema
- [ ] Migration SQL inspected before commit — no surprise `DROP` statements
- [ ] New required columns either have a default or carry a backfill in the migration
- [ ] No `new PrismaClient()` outside the singleton site
- [ ] No `$queryRawUnsafe` with user-controlled input
- [ ] Multi-step writes wrapped in `$transaction` where atomicity matters
- [ ] `onDelete` / `onUpdate` declared on every relation
- [ ] Indexes added for new query patterns (composite indexes for multi-column WHERE)
- [ ] Production uses `migrate deploy`, not `migrate dev`
- [ ] Destructive change uses two-phase deploy (read-stop → drop)
- [ ] No PII logged via PrismaClient `log: ["query"]` in production
- [ ] Regression test against a test DB added before bug fix landed
