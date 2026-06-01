## Naming conventions

- Route module files: kebab-case under `app/routes/` (e.g. `app/routes/orders.$id.tsx`)
- Route exports: named `loader`, `action`, `default` (component), `meta`, `links`, `ErrorBoundary`, `headers`
- Route configuration: `app/routes.ts` exports an array of route objects when using `routes` API
- Layout routes: file is `_layout.tsx` or directory contains `_layout.tsx`
- Resource routes (non-UI): no `default` export — only `loader` and/or `action`
- Server-only modules: `*.server.ts` suffix — never imported from client code
- Client-only modules: `*.client.ts` suffix — never imported from server code
- Form names: `<Form>` from `react-router`, not native `<form>` for actions

## Do / don't

DO: Return plain JSON-serializable objects from `loader` / `action` — DON'T: return Maps, Sets, Class instances, or Dates without an explicit serializer
DO: Use `clientLoader` for client-only refinement of SSR data — DON'T: gate the initial render on a `useEffect` fetch
DO: Use `useFetcher` for revalidating mutations — DON'T: call `fetch()` imperatively and try to sync route state manually
DO: Keep secrets in `.server.ts` modules — DON'T: import a server module from a route component (transitively pulls it into the client bundle)
DO: Use `<Link prefetch="intent">` for hover-prefetch — DON'T: prefetch every route (defeats the optimization)
DO: Throw `Response` objects (e.g. `throw new Response(null, { status: 404 })`) — DON'T: return `{ error }` and conditionally render in the component
DO: Set `headers` export to forward cache hints — DON'T: rely on default headers for cacheable resource routes

## Forbidden patterns

NEVER: import `@prisma/client`, DB drivers, or `node:fs` into a non-`.server.ts` module — leaks to client bundle
NEVER: persist mutable module-scope state across requests (in-memory caches without explicit lifecycle) — breaks SSR isolation
NEVER: read `process.env` directly inside route component — read in `loader` and pass through serialized data
NEVER: use Remix v1 imports (`@remix-run/*`) — v7 uses `react-router` and `@react-router/*` packages
NEVER: bypass `useNavigation()` / `useFetcher()` with `window.location` — breaks SPA navigation and pending UI
NEVER: throw arbitrary error objects — throw `Response` so `ErrorBoundary` receives the correct status
NEVER: mutate `loader` return shape across deploys without a client-side guard — hydration mismatches crash
