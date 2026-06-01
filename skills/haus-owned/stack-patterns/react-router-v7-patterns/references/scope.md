# Scope

## In-scope files and dirs

- `react-router.config.ts` — SSR mode, prerender list, basename, future flags
- `app/routes.ts` — explicit route tree (when not using filesystem routing)
- `app/routes/**/*.tsx` — route modules (loaders, actions, components)
- `app/root.tsx` — document shell, global meta/links, `ErrorBoundary`
- `app/entry.client.tsx` / `app/entry.server.tsx` — hydration and streaming entry points
- `server.ts` / `app/server.ts` — `@react-router/node` server adapter wiring
- `*.server.ts` modules — server-only utilities (DB, secrets, file I/O)
- `*.client.ts` modules — client-only utilities (browser APIs, third-party widgets)
- `vite.config.ts` — when using `@react-router/dev/vite` plugin

## Stack boundaries

- React Router v7 framework mode: SSR by default, `clientLoader` for refinement, `<Form>` for mutations
- Not in scope: Next.js App Router (use `nextjs-patterns`)
- Not in scope: Remix v1 — APIs differ; v1 codebases should migrate or use a separate skill
- Component-only behavior changes inside route files → combine with `react19-patterns`
- Build/Vite config → combine with `vite8-patterns`
- Tests for routes → combine with `vitest-patterns` (unit) or `playwright-patterns` (E2E)

## Triggers

- Adding or modifying a route, layout, or resource route
- Changing `loader` / `action` return shape
- Adding `ErrorBoundary` to a route or `app/root.tsx`
- Switching SSR mode or adding/removing prerender entries
- Adding a server-only dependency that risks client-bundle leakage
- Migrating a route from Remix v1 conventions to v7
- Adjusting hydration boundary (`clientLoader`, `HydrateFallback`)
