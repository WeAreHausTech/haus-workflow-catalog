## Naming conventions

- Component files: PascalCase `MyComponent.vue` (single-file component)
- Composables: `useFeatureName.ts` in `src/composables/` (e.g. `useCart.ts`, `useAuth.ts`)
- Pinia stores: `useXxxStore` from `defineStore('xxx', ...)` in `src/stores/xxxStore.ts`
- Route files: `src/router/index.ts` with named routes (string constants or enum)
- Prop types: inline TypeScript generic on `defineProps<{ ... }>()`
- Emit types: inline TypeScript generic on `defineEmits<{ ... }>()`

## Do / don't

DO: Use `<script setup lang="ts">` for all new components — DON'T: use Options API in new components or new files
DO: Define props with TypeScript generic: `defineProps<{ label: string; count?: number }>()` — DON'T: use runtime prop object without TypeScript generic
DO: Use `storeToRefs()` when destructuring reactive state from a Pinia store — DON'T: destructure store properties directly (breaks reactivity)
DO: Emit events to communicate upward; don't mutate parent state directly — DON'T: mutate a prop object or array in the child component
DO: Use `watchEffect` for auto-tracked reactive dependencies — DON'T: manually list dependencies in `watch` when `watchEffect` handles it
DO: Use `computed` for derived reactive values — DON'T: compute derived values in templates with complex expressions

## Forbidden patterns

NEVER: `defineProps` without TypeScript generic — runtime-only prop validation loses type safety
NEVER: Destructure Pinia store state without `storeToRefs()` — reactive references become plain values
NEVER: `watch` with `immediate: true` without a comment explaining why — immediate watchers run on SSR and can cause hydration issues
NEVER: Mutate a prop value directly inside a child component — causes unpredictable parent state
NEVER: `vue-tsc` type errors suppressed or ignored in CI — type errors in `.vue` files are real bugs
NEVER: Options API `data()` / `methods` / `computed` in new components alongside Composition API — mixing APIs in the same component
