# Workflow

## Implementation steps

1. Identify route type: UI route (`default` export + optional `loader`/`action`), layout (`_layout.tsx`), or resource (`loader`/`action` only, no `default`).
2. Place the file under `app/routes/` using the v7 naming convention; update `app/routes.ts` only if using explicit routes.
3. Confirm SSR mode in `react-router.config.ts`: `ssr: true` (default) or per-route prerender list.
4. For data loading, write `loader` first and confirm it returns plain JSON-serializable data; add `clientLoader` only if client refinement is needed.
5. For mutations, write `action` and submit via `<Form>` or `useFetcher` — never `fetch()` directly.
6. Keep server-only imports in `*.server.ts` modules; verify the route component does not transitively import them.
7. Add `ErrorBoundary` export when the route can throw `Response(404)` / `Response(500)`; otherwise rely on `app/root.tsx`.
8. Set `headers` export for cacheable resource routes (e.g. `Cache-Control: max-age=300`).
9. Run dev server (`react-router dev`) and verify both initial SSR HTML and post-hydration navigation work.
10. Add a regression test before fixing a routing/loader bug; confirm it fails first.

## Commands

```bash
yarn react-router dev                        # local dev with HMR + SSR
yarn react-router build                      # production build (client + server bundles)
yarn react-router-serve ./build/server/index.js   # run prod server locally
yarn typecheck                               # TS check route modules

# route-specific tests
yarn vitest run app/routes/orders.$id.test.ts
yarn playwright test e2e/orders-flow.spec.ts

# inspect bundle for accidental server leakage
yarn react-router build && du -sh build/client
```

## Validation checklist

- [ ] `loader` / `action` return JSON-serializable shape (no Map/Set/Date without serializer)
- [ ] No server-only import (`*.server.ts`, DB driver, `node:fs`) reachable from route component
- [ ] `ErrorBoundary` present when route throws non-2xx `Response`
- [ ] Mutations use `<Form>` or `useFetcher`, not raw `fetch()`
- [ ] `clientLoader` only present when client-side refinement is actually needed
- [ ] `headers` export set for cacheable resource routes
- [ ] Dev server (`react-router dev`) renders SSR HTML correctly with JS disabled
- [ ] Production build (`react-router build`) succeeds and client bundle size has not regressed unexpectedly
- [ ] No imports from `@remix-run/*` — only `react-router` and `@react-router/*`
- [ ] Regression test added before bug fix landed
