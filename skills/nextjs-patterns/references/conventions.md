## Naming conventions

- Reserved file names (App Router): `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `middleware.ts`
- Server actions: defined in `actions.ts` colocated with the feature or in `app/actions/` for shared ones
- Route handlers: `app/api/xxx/route.ts` — named `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Data loaders: `lib/data/xxx.ts` using `cache()` for deduplication
- Metadata: `generateMetadata` function exported from `page.tsx` or `layout.tsx`
- Client components: `XxxClient.tsx` suffix to distinguish from server components when colocated

## Do / don't

DO: Fetch data in server components — DON'T: fetch in client components when the data has no interactivity requirement
DO: Use `cache()` for shared data fetching functions to deduplicate across the render tree — DON'T: call the same fetch in both layout and page (waterfall + duplicate)
DO: Call `revalidatePath()` or `revalidateTag()` in server actions after mutations — DON'T: rely on manual cache invalidation in client code
DO: Export `generateMetadata` for all public-facing pages — DON'T: leave `<title>` and `<description>` to defaults
DO: Use `"use client"` only on leaf components that require browser APIs or interactivity — DON'T: mark layouts or pages as client components
DO: Validate and sanitize server action inputs with Zod before processing — DON'T: trust form data directly in server actions
DO: Use `redirect()` from `next/navigation` (server-side) for auth redirects — DON'T: use `router.push()` for security-sensitive redirects from server context

## Forbidden patterns

NEVER: Import `next/headers` in a client component — runtime error
NEVER: Server action without input validation — data integrity and security risk
NEVER: `export const dynamic = 'force-dynamic'` without a documented reason in a comment — causes full SSR on every request
NEVER: `useRouter` or `useSearchParams` in a server component — throws at runtime
NEVER: Fetch same resource in both layout and nested page without `cache()` — duplicate waterfall requests
NEVER: Commit secrets or API keys in `next.config.ts` `env` block — exposed to client bundle if not prefixed correctly
NEVER: `NEXT_PUBLIC_` env var containing a secret — automatically bundled into client JavaScript
