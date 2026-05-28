# Workflow

## Implementation steps

1. Confirm version: check `package.json` for `next-auth` (v4) vs `next-auth@beta` / Auth.js v5. APIs differ.
2. For v5: ensure `auth.ts` exports `{ handlers, auth, signIn, signOut }` from `NextAuth(authConfig)`.
3. If `middleware.ts` needs auth, split: `auth.config.ts` (edge-safe — no adapter, no Node modules) + `auth.ts` (full).
4. Add providers to the `providers` array; pull client IDs/secrets from env (`process.env.GOOGLE_CLIENT_ID` etc.).
5. For credentials provider, hash passwords with `bcrypt` or `argon2` in `authorize`; never accept plaintext.
6. Add adapter only when using `database` session strategy or persisting users; remove if using pure `jwt`.
7. Augment types in `types/next-auth.d.ts` to expose custom fields on `session.user`.
8. In `redirect` callback, validate `url` is same-origin or in an allowlist before returning.
9. Set `AUTH_SECRET` in every environment (`openssl rand -base64 32`).
10. Test the flow end-to-end: sign in, refresh page, sign out — confirm session reads in server components via `await auth()`.

## Commands

```bash
yarn dev                                       # Next dev server (auth flow available at /api/auth/*)
yarn build && yarn start                       # production build + run (sanity check edge bundle)

# Auth.js v5 env setup
openssl rand -base64 32                        # generate AUTH_SECRET
yarn next telemetry status                     # confirm telemetry preference (unrelated but commonly asked)

# Provider checks
curl -I "$AUTH_URL/api/auth/providers"          # list configured providers
curl -I "$AUTH_URL/api/auth/session"            # current session (unauthenticated returns {})

# Common diagnostic: edge bundling
yarn build 2>&1 | grep -i "module not found"   # catches Node-only imports leaking into middleware
```

## Validation checklist

- [ ] Version pinned and patterns match v4 vs v5 conventions
- [ ] `AUTH_SECRET` (v5) or `NEXTAUTH_SECRET` (v4) set in all environments
- [ ] Middleware imports `auth.config.ts`, not `auth.ts` (no adapter in edge bundle)
- [ ] Credentials provider hashes passwords with `bcrypt` / `argon2`, never plaintext
- [ ] `redirect` callback validates same-origin or allowlist before returning
- [ ] Session strategy matches adapter use (`database` ↔ adapter present; `jwt` ↔ no adapter persistence)
- [ ] `session.user` custom fields typed via `types/next-auth.d.ts` module augmentation
- [ ] No `console.log` of session or JWT payload
- [ ] OAuth secrets only in env vars (no `NEXT_PUBLIC_*` leakage)
- [ ] End-to-end flow tested: sign in → server-side `auth()` returns session → sign out clears
- [ ] Regression test added before fixing an auth bug (e.g. integration test that hits `/api/auth/session`)
