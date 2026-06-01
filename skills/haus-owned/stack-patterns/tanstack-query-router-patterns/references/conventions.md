## Naming conventions

- Query key factories: `xyzKeys = { all: () => ['xyz'] as const, byId: (id: string) => [...xyzKeys.all(), id] as const }`
- Query options factories: `xyzQueryOptions(id: string)` returning `queryOptions({ queryKey: ..., queryFn: ... })`
- Route files: `$entityId.tsx` (param routes use `$` prefix per TanStack Router convention)
- Route loaders: colocated in route file or in `routes/loaders/<route-name>.ts`
- Router instance: `createRouter({ routeTree })` in `src/router.ts`
- Generated file: `routeTree.gen.ts` — never manually edited

## Do / don't

DO: Use `queryOptions()` factory function for all query definitions — DON'T: pass inline object literals as `useQuery({ queryKey: [...] })` (referential instability)
DO: Call `queryClient.ensureQueryData(xyzQueryOptions(id))` in route loaders — DON'T: duplicate `useQuery` in both loader and component for the same data
DO: Implement `onError` rollback in every `onMutate` optimistic update — DON'T: apply optimistic updates without a corresponding rollback handler
DO: Use Zod `validateSearch` schema on every route that reads search params — DON'T: access `useSearch()` result without schema validation
DO: Commit `routeTree.gen.ts` after adding or modifying routes — DON'T: leave generated file out of sync with route files
DO: Use `staleTime` appropriate to the data's volatility (e.g. `Infinity` for static config) — DON'T: set `staleTime: 0` on every query without documented reason

## Forbidden patterns

NEVER: Object literal as query key (`queryKey: { type: 'user', id }`) — objects are not referentially stable as cache keys
NEVER: `routeTree.gen.ts` excluded from version control — route type safety depends on committed gen file
NEVER: `invalidateQueries({ queryKey: ['xyz'] })` with root key when targeted invalidation is possible — invalidates unrelated sub-queries unnecessarily
NEVER: `useSearch()` without `validateSearch` schema on the route — unvalidated search params cause runtime type errors
NEVER: Optimistic update `onMutate` without corresponding `onError` rollback — leaves UI in inconsistent state on failure
NEVER: Loader that triggers a network waterfall by awaiting queries sequentially instead of in parallel — use `Promise.all()` for independent queries
