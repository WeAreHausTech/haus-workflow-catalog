## Naming conventions

- Auth.js v5: `auth.ts` at project root exports `{ handlers, auth, signIn, signOut }` from `NextAuth(...)`
- Auth.js v5 split config: `auth.config.ts` (edge-safe, no adapter) + `auth.ts` (full, imports config + adapter)
- NextAuth v4: `app/api/auth/[...nextauth]/route.ts` exports `GET` / `POST` from `NextAuth(authOptions)`
- v4 options module: `app/api/auth/[...nextauth]/options.ts` exports `authOptions`
- Providers array: keep ordered consistently across environments (UI shows them in order)
- Callbacks: `jwt`, `session`, `signIn`, `redirect` — typed with `JWT`, `Session`, `User` from `next-auth`
- Adapter: import from `@auth/<orm>-adapter` (v5) or `@next-auth/<orm>-adapter` (v4)
- Custom pages: `pages: { signIn: "/auth/sign-in", error: "/auth/error" }` — file paths under `app/auth/`
- Middleware: `middleware.ts` at root exports default `auth` (v5) or `withAuth` (v4)

## Do / don't

DO: Use `auth()` (v5) to read session in server components — DON'T: call `getServerSession()` in v5 code
DO: Split config when middleware needs auth — `auth.config.ts` is edge-safe, `auth.ts` is full — DON'T: import `auth.ts` from `middleware.ts`
DO: Pin `AUTH_SECRET` in all environments via env var — DON'T: rely on dev fallback in production
DO: Use `database` session strategy when you need server-side session invalidation — DON'T: combine `jwt` strategy with an adapter (adapter writes ignored)
DO: Type `session.user` with module augmentation in `types/next-auth.d.ts` — DON'T: cast `as any` in callbacks
DO: Validate redirect targets in `redirect` callback — DON'T: trust `url` parameter blindly (open redirect)
DO: Use `signIn` callback to return `false` or a URL string to deny — DON'T: throw inside `signIn` (becomes a generic error)
DO: Set `trustHost: true` in v5 only when behind a proxy with `AUTH_URL` set — DON'T: enable blindly

## Forbidden patterns

NEVER: import `auth.ts` (with Prisma/Drizzle adapter) inside `middleware.ts` — edge runtime fails to bundle Node-only modules
NEVER: expose `AUTH_SECRET`, OAuth client secrets, or DB credentials via `NEXT_PUBLIC_*`
NEVER: store password hashes via the credentials provider without `bcrypt`/`argon2` — plaintext or weak hashing is a critical bug
NEVER: log full session or JWT payloads — leaks user PII and tokens
NEVER: return raw `User` from `authorize` callback (credentials provider) — sanitize to only fields needed in session
NEVER: skip the `redirect` callback validation — open redirect via `?callbackUrl=` parameter
NEVER: hard-code provider client IDs/secrets in `auth.config.ts` — env vars only
NEVER: silently downgrade `database` strategy to `jwt` — session invalidation expectations break
