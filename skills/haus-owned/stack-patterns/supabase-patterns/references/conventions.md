## Naming conventions

- Client modules (Next.js App Router): `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- Client modules (Pages / plain React): `lib/supabase.ts` exporting a single browser client
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Migrations: `supabase/migrations/<YYYYMMDDHHMMSS>_<description>.sql`
- Edge Functions: `supabase/functions/<name>/index.ts` — Deno runtime
- Storage buckets: lowercase, kebab-case (`user-avatars`, `order-receipts`)
- RLS policy names: `<table>_<action>_<role>` (`orders_select_owner`, `orders_insert_authenticated`)
- Generated types: `types/supabase.ts` produced by `supabase gen types typescript --local`

## Do / don't

DO: Enable RLS on every table — DON'T: rely on app-side auth checks alone
DO: Use `@supabase/ssr` for Next.js App Router cookie handling — DON'T: mutate cookies manually in Server Components
DO: Use anon key in client and server-on-behalf-of-user contexts — DON'T: use service_role for user-facing queries
DO: Reserve service_role for admin scripts, cron jobs, Edge Functions that explicitly need to bypass RLS — DON'T: leak it through any user-facing endpoint
DO: Generate TS types from the live schema (`supabase gen types typescript`) — DON'T: hand-write Database types
DO: Use `auth.uid()` in RLS policies — DON'T: store user IDs in headers and trust client
DO: For Storage, set bucket-level policies + per-file RLS via `storage.objects` — DON'T: rely on signed URL TTL alone for sensitive files
DO: Test RLS policies via `supabase test db` or pgTAP — DON'T: assume the policy works without proof
DO: Pin Supabase CLI version per project (`supabase/config.toml`) — DON'T: drift between team members

## Forbidden patterns

NEVER: ship `SUPABASE_SERVICE_ROLE_KEY` to a client bundle (no `NEXT_PUBLIC_` prefix, no inline literal)
NEVER: create a Supabase table without RLS enabled in the same migration
NEVER: use `service_role` for user-initiated reads or writes — bypasses RLS
NEVER: store auth tokens in `localStorage` — Supabase SSR helpers manage cookies; raw token storage breaks server-side auth
NEVER: deploy an Edge Function with secrets in source — use `supabase secrets set`
NEVER: rely on client-side filtering for security ("only show user's own rows") — must be RLS policy
NEVER: skip schema migrations — manual table edits via dashboard drift production from main
NEVER: log full JWT tokens or session cookies
NEVER: write raw SQL in app code that mixes user input via string concatenation — use parameterized queries via `.eq() / .in()`
