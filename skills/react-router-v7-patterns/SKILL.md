---
name: react-router-v7-patterns
description: React Router v7 router. Use for SSR routes, loaders, actions, and framework-mode config in v7 apps.
---

# React Router v7 Patterns

## Use when

- task changes routes, loaders, or actions in a React Router v7 framework-mode app
- task touches `app/routes.ts`, `app/root.tsx`, `app/routes/*`, or `react-router.config.ts`
- task introduces or modifies an SSR data-loading boundary

## Do not use when

- project is Next.js App Router (use `nextjs-patterns`)
- project is Remix v1 (different conventions; not in scope)
- task is React component-only behavior (use `react19-patterns`)

## Inspect first

- `react-router.config.ts` for SSR mode, prerender, and basename config
- `app/routes.ts` (or `app/routes/` filesystem) for current route tree
- nearest `loader` / `action` and what shape they return
- `app/root.tsx` for global error and meta export wiring
- `@react-router/node` server entry (`server.ts` / `entry.server.tsx`) for streaming and hydration

## Avoid mistakes

- mixing client-only React effects with SSR-loaded data without `clientLoader`
- returning non-serializable values (Map, Class instance) from `loader` / `action`
- bypassing route revalidation with imperative `fetch` instead of `useFetcher`/`useSubmit`
- leaking server-only modules (db drivers, secrets) into client bundles via shared imports
- assuming Remix v1 APIs — many were renamed or removed in v7

## Router

1. Load `references/conventions.md` for routing patterns, do/don't, and forbidden imports.
2. Load `references/scope.md` for in-scope files and stack boundaries.
3. Load `references/workflow.md` only for SSR diagnosis and prerender flow.
4. Keep loaders pure, serializable, and SSR-safe.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
