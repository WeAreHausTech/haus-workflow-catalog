---
name: prisma-patterns
description: Prisma router. Use for schema design, migrations, query API patterns, and PrismaClient lifecycle.
---

# Prisma Patterns

## Use when

- task changes `prisma/schema.prisma` — models, enums, relations, indexes, datasource, generator
- task generates or applies a migration in `prisma/migrations/`
- task adds, modifies, or refactors a PrismaClient query (`prisma.user.findMany(...)`)
- task wires PrismaClient lifecycle (singleton in Next.js, graceful shutdown in NestJS)

## Do not use when

- task is pure UI/component work with no DB contract change
- ORM is not Prisma (use `database-patterns` for raw SQL / other drivers)
- task is migration deployment-only without schema change (use platform deploy skill)

## Inspect first

- `prisma/schema.prisma` — datasource provider, generator output, every affected model
- `prisma/migrations/` — newest migration to understand current DB shape
- PrismaClient instantiation site (`lib/prisma.ts`, `src/prisma.module.ts`) — confirm singleton pattern
- `.env` / `.env.example` — `DATABASE_URL` shape and SSL options
- existing `select` / `include` shapes used by callers of the affected model

## Avoid mistakes

- adding a required column without a default — migration fails on existing rows
- forgetting to re-run `prisma generate` after schema change — Client types drift
- creating multiple PrismaClient instances in Next.js dev (HMR leak) — use the singleton pattern
- using `prisma.$queryRaw` without `Prisma.sql` tagged template — SQL injection risk
- relying on cascade behavior without declaring `onDelete: Cascade` explicitly
- mixing `findUnique` (typed key) with `findFirst` (where clause) inappropriately — index hit changes

## Router

1. Load `references/conventions.md` for schema, query, and migration patterns.
2. Load `references/scope.md` for in-scope files and Prisma-vs-driver boundaries.
3. Load `references/workflow.md` only for migration safety and rollout flow.
4. Keep schemas declarative, migrations reversible, and queries typed.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
