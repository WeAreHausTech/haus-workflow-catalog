# Workflow

## Implementation steps

1. For Next.js App Router: install both `@supabase/supabase-js` and `@supabase/ssr`. Create `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server with cookies).
2. Add `middleware.ts` at project root that calls the `@supabase/ssr` `updateSession` helper.
3. For new tables, write the migration SQL including `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and at least one policy.
4. Add policies for each access pattern: SELECT (own rows), INSERT (authenticated user), UPDATE (own rows), DELETE (own rows or admin).
5. Use `auth.uid()` in policy expressions to identify the requesting user.
6. Generate types: `yarn supabase gen types typescript --local > types/supabase.ts`.
7. For Edge Functions: write `supabase/functions/<name>/index.ts`, deploy via `supabase functions deploy <name>`.
8. Set secrets via `supabase secrets set KEY=value` — never commit secrets.
9. Test RLS via `supabase test db` (pgTAP) or by invoking the API with both anon and service_role keys.
10. For Storage, create the bucket via migration + add `storage.objects` RLS policies for per-file access control.

## Commands

```bash
# Local dev
supabase start                                 # local Postgres + Studio + Auth + Storage
supabase stop                                  # stop local stack
supabase status                                # show local URLs and keys

# Migrations
supabase migration new <description>           # scaffold a new migration file
supabase db reset                              # reset local DB and replay all migrations
supabase db push                               # push migrations to linked remote project
supabase db pull                               # pull schema changes from remote

# Types
supabase gen types typescript --local > types/supabase.ts
supabase gen types typescript --linked > types/supabase.ts

# Edge Functions
supabase functions new <name>                  # scaffold
supabase functions serve <name>                # local invocation
supabase functions deploy <name> --no-verify-jwt    # deploy (omit flag to require JWT)
supabase secrets set KEY=value                 # set Edge Function env vars

# RLS testing
supabase test db                               # run pgTAP tests
psql "<conn-string>" -c "SET ROLE anon; SELECT * FROM <table>;"   # manual policy probe

# Linking
supabase link --project-ref <ref>              # link to remote project
```

## Validation checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` server-only; not in `NEXT_PUBLIC_*`
- [ ] Every Supabase table has RLS enabled in the same migration that creates it
- [ ] Every access pattern has a corresponding RLS policy
- [ ] `auth.uid()` used to identify users, not client-supplied identifiers
- [ ] `@supabase/ssr` used for App Router cookie management; no manual cookie mutation
- [ ] Generated `types/supabase.ts` regenerated after every schema change
- [ ] Edge Functions read secrets via `Deno.env.get(...)`, set via `supabase secrets set`
- [ ] Storage buckets have appropriate `storage.objects` RLS policies
- [ ] No `service_role` usage in user-facing endpoints
- [ ] Schema changes happen via migrations, not manual dashboard edits
- [ ] RLS policies tested (pgTAP or manual probe with anon role)
- [ ] No JWT tokens or session cookies logged
