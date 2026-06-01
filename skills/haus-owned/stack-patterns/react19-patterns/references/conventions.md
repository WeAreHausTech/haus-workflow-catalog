## Naming conventions

- Components: PascalCase `MyComponent.tsx`
- Hooks: `useCamelCase` — file named `useCamelCase.ts`
- Server actions: exported from `actions.ts` colocated with the feature component
- Test files: `Component.test.tsx` adjacent to component
- Context providers: `XxxProvider` (component) + `useXxx` (consumer hook) in same file

## Do / don't

DO: Keep `"use client"` at leaf nodes only — DON'T: add `"use client"` to layouts or high-level containers that can stay as server components
DO: Use `useActionState` for form submissions that call server actions — DON'T: manage pending/error state manually with `useState` + `useTransition` for simple forms
DO: Wrap lazy-loaded components and `use()` calls in `<Suspense>` — DON'T: use `use()` or `React.lazy()` without a `Suspense` boundary above it
DO: Use `useMemo` / `useCallback` for object/array/function values passed as props — DON'T: pass inline object or array literals as props (new reference each render causes re-renders)
DO: Use `useOptimistic` for instant UI feedback with server action roundtrips — DON'T: block UI on server action response when optimistic update is possible
DO: Keep side effects in event handlers or server actions — DON'T: use `useEffect` for data that a server component can provide directly

## Forbidden patterns

NEVER: `key` prop from array index when the list can be reordered or filtered — causes state bugs on reorder
NEVER: `useEffect` with empty `[]` dependency array for one-time setup — use module-level initialization instead
NEVER: `useState` + `useEffect` for derived data — use `useMemo` (synchronous) or server component (async)
NEVER: Mutate props or state objects directly — always return new object/array references
NEVER: `"use client"` directive on a file that only re-exports server components — propagates client boundary unnecessarily
NEVER: `useContext` called outside its provider without a runtime check — returns `undefined` silently in some patterns
