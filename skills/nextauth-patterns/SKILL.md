---
name: nextauth-patterns
description: NextAuth.js / Auth.js router. Use for provider setup, session strategy, callbacks, JWT, and route protection in Next.js.
---

# NextAuth Patterns

## Use when

- task changes `next-auth` / `@auth/core` provider config (`auth.ts`, `auth.config.ts`, `app/api/auth/[...nextauth]/route.ts`)
- task touches session strategy (`jwt` vs `database`), callbacks, or events
- task adds or modifies route protection via `auth()` / `middleware.ts`
- task wires a new OAuth provider (Google, GitHub, Azure AD) or credentials provider

## Do not use when

- project is Laravel / PHP auth (use `auth-oidc-azure-bankid-patterns`)
- task is server-to-server API token auth with no session lifecycle
- task is OIDC outside Next.js (use `auth-oidc-azure-bankid-patterns`)

## Inspect first

- `auth.ts` (Auth.js v5) or `app/api/auth/[...nextauth]/route.ts` (v4) — provider list, adapter, callbacks
- `middleware.ts` — protected paths and `auth()` invocation
- `app/api/auth/[...nextauth]/options.ts` or `auth.config.ts` — config split for edge runtime compatibility
- env vars: `NEXTAUTH_SECRET` (v4) / `AUTH_SECRET` (v5), `NEXTAUTH_URL` / `AUTH_URL`, provider client IDs/secrets
- adapter config when persisting sessions/users to DB (`@auth/prisma-adapter`, `@auth/drizzle-adapter`)

## Avoid mistakes

- mixing v4 and v5 APIs — imports, callback shapes, and route handlers differ
- importing the full `auth.ts` (with adapter) inside `middleware.ts` — Node-only modules break edge runtime
- forgetting `AUTH_SECRET` in production — sessions fail silently in dev, hard-fail in prod
- exposing OAuth client secrets in `NEXT_PUBLIC_*` env vars
- using `jwt` session strategy with an adapter — adapter writes aren't read back

## Router

1. Load `references/conventions.md` for provider, session, and callback patterns.
2. Load `references/scope.md` for in-scope files and v4-vs-v5 boundaries.
3. Load `references/workflow.md` only for auth flow tracing and edge-runtime diagnosis.
4. Keep secrets server-only; split config for edge compatibility.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
