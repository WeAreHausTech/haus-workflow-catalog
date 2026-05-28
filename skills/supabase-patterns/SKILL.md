---
name: supabase-patterns
description: Supabase router. Use for client wiring, Row-Level Security, edge functions, Supabase Auth, and storage.
---

# Supabase Patterns

## Use when

- task wires `@supabase/supabase-js` (or `@supabase/ssr` for Next.js) client
- task adds, modifies, or audits Row-Level Security (RLS) policies on Supabase tables
- task adds or modifies Supabase Edge Functions (Deno-runtime)
- task integrates Supabase Auth (`signInWithPassword`, OAuth providers, magic link)
- task uses Supabase Storage buckets (upload, signed URLs, public access policies)

## Do not use when

- BaaS is Firebase / AWS Amplify (different mental model)
- task is self-hosted Postgres without Supabase (use `database-patterns`)
- task is plain Next.js auth without Supabase Auth (use `nextauth-patterns`)

## Inspect first

- client init: `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (server) — separate clients for App Router
- env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe), `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `@supabase/ssr` cookie handlers if Next.js App Router is in use
- RLS policies for every table the change touches — check `supabase/migrations/*.sql`
- Edge Functions under `supabase/functions/<name>/index.ts`

## Avoid mistakes

- shipping `SUPABASE_SERVICE_ROLE_KEY` to client — bypasses RLS, full DB compromise
- creating Supabase tables without RLS enabled — anyone with anon key reads everything
- mixing browser client and server client in the same module — auth context bleeds
- handling auth cookies manually instead of using `@supabase/ssr` helpers in App Router
- using `service_role` key for ordinary queries — bypasses RLS and audit
- relying on client-side checks for authorization — RLS is the authoritative layer

## Router

1. Load `references/conventions.md` for client, RLS, and Edge Function patterns.
2. Load `references/scope.md` for in-scope files and Next.js-vs-other stack boundaries.
3. Load `references/workflow.md` only for RLS diagnosis and Edge Function deploy flow.
4. Treat RLS as the security perimeter; never use service_role for user-facing queries.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
