# Scope

## In-scope files and dirs

- `prisma/schema.prisma` — schema, datasource, generator, models, enums
- `prisma/migrations/**` — generated migration SQL + meta
- `prisma/seed.ts` — seed script invoked by `prisma db seed`
- `lib/prisma.ts` (Next.js) or `src/prisma/prisma.service.ts` (NestJS) — PrismaClient singleton
- `src/**/*.repository.ts` or `*.service.ts` — Prisma query call sites
- `.env` / `.env.example` — `DATABASE_URL`, `SHADOW_DATABASE_URL`, SSL options
- `package.json` — `@prisma/client` + `prisma` versions; `prisma` config block

## Stack boundaries

- Prisma ORM: schema-first modeling, generated Client, type-safe queries
- Not in scope: raw SQL projects (use `database-patterns`)
- Not in scope: Drizzle / TypeORM / Sequelize — different mental model
- Migration deployment automation → combine with platform-specific deploy skill
- Connection-pool tuning and PostgreSQL-specific config → combine with `database-patterns`
- Vendure / NestJS framework wiring → combine with the matching framework skill

## Triggers

- Adding or modifying a model, enum, or relation in `schema.prisma`
- Generating a new migration (`prisma migrate dev`)
- Refactoring a service to use Prisma instead of raw SQL or another ORM
- Introducing a multi-step write that needs `$transaction`
- Adjusting `DATABASE_URL` SSL or pooling parameters
- Updating `@prisma/client` major version — query API may shift
- Adding indexes, unique constraints, or composite keys
- Two-phase column drop deploy (deprecate read → drop in next deploy)
