# Scope

## In-scope files and dirs

- `auth.ts` / `auth.config.ts` — Auth.js v5 entry and split config
- `app/api/auth/[...nextauth]/route.ts` — v4 catch-all route handler
- `app/api/auth/[...nextauth]/options.ts` — v4 options module
- `middleware.ts` — route protection wiring at root
- `types/next-auth.d.ts` — module augmentation for typed `session.user`
- `app/auth/**` — custom sign-in / sign-out / error pages
- `lib/auth.ts` — re-export helpers and server-side session readers
- `.env` / `.env.example` — `AUTH_SECRET` / `NEXTAUTH_SECRET`, `AUTH_URL`, provider env vars
- adapter config when present: `lib/db.ts` for Prisma/Drizzle adapter

## Stack boundaries

- NextAuth v4 vs Auth.js v5: APIs differ — verify version via `package.json` before applying patterns
- Edge runtime: middleware must use `auth.config.ts` (no adapter, no Node-only imports)
- Adapter persistence → combine with `prisma-patterns` (Prisma adapter) or DB skill
- OAuth provider setup → provider docs are authoritative for scopes/claims
- Laravel/PHP auth → use `auth-oidc-azure-bankid-patterns`
- Server-to-server API tokens (no session) → out of scope

## Triggers

- Adding a new OAuth provider or credentials provider
- Switching session strategy (`jwt` ↔ `database`)
- Adding or modifying a callback (`jwt`, `session`, `signIn`, `redirect`)
- Wiring or modifying `middleware.ts` route protection
- Adding an adapter (`@auth/prisma-adapter`, `@auth/drizzle-adapter`)
- Module augmentation to add custom fields to `session.user`
- Migrating from NextAuth v4 to Auth.js v5
- Splitting config for edge compatibility
