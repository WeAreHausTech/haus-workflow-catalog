# Scope

## In-scope files and dirs

- `lib/supabase/**` — client init modules (browser, server, middleware)
- `supabase/migrations/**` — SQL migrations including RLS policy definitions
- `supabase/functions/**/index.ts` — Edge Functions (Deno runtime)
- `supabase/config.toml` — local dev + CLI version pin
- `types/supabase.ts` — generated TypeScript types (treat as build output)
- `middleware.ts` — Supabase SSR cookie refresh (`@supabase/ssr`)
- Storage bucket policies under `supabase/migrations/*storage*.sql`
- `.env` / `.env.example` — Supabase env vars

## Stack boundaries

- `@supabase/supabase-js` (v2): client SDK for browser and Node
- `@supabase/ssr`: Next.js App Router cookie management
- Edge Functions: Deno 1.x runtime, different import semantics
- RLS / policies: Postgres feature exposed by Supabase, not SDK-specific
- Not in scope: Firebase, AWS Amplify (different BaaS)
- Not in scope: self-hosted Postgres without Supabase auth/RLS layer
- Auth integration with NextAuth → use `nextauth-patterns` for the NextAuth side, `supabase-patterns` for Supabase queries

## Triggers

- Adding Supabase to a project for the first time
- Adding or modifying an RLS policy
- Adding an Edge Function
- Switching from plain `@supabase/supabase-js` to `@supabase/ssr` (Next.js App Router)
- Adding Storage bucket with access policies
- Wiring Supabase Auth provider (email, OAuth, magic link)
- Regenerating TS types after schema change
- Upgrading Supabase CLI or SDK major version
