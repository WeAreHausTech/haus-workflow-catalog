## Naming conventions

- SCSS module files: `Component.module.scss` colocated with the component
- SCSS module imports: `import styles from './Component.module.scss'` (not `* as styles`)
- Tailwind config file: `tailwind.config.ts` (TypeScript preferred)
- New design tokens: added under `theme.extend` only — never modify the base Tailwind theme
- CSS variables: defined in `globals.css` `:root` and `.dark` selectors (e.g. `--color-primary: #...`)
- Class merge utility: `cn()` from `lib/utils.ts` wrapping `clsx` + `tailwind-merge`

## Do / don't

DO: Use `cn()` for all conditional or merged class strings — DON'T: concatenate class names with `+` or template string interpolation
DO: Define all brand/semantic color tokens as CSS variables in `:root` and reference them in `theme.extend` — DON'T: hardcode hex values directly in component files
DO: Add new tokens via `theme.extend` in `tailwind.config.ts` — DON'T: override base Tailwind keys in `theme` (loses all defaults)
DO: Use `@layer components {}` in `globals.css` for reusable multi-utility patterns — DON'T: use `@apply` for single utility classes (defeats purge and readability)
DO: Keep SCSS module selectors scoped to component root — DON'T: use global selectors (`.active`, `a`) inside `.module.scss` files
DO: Test dark mode appearance after adding or changing color tokens — DON'T: define colors only in `:root` without a `.dark` override

## Forbidden patterns

NEVER: Dynamic class names built with string interpolation (`bg-${color}`) — Tailwind purges classes not found as complete strings; use safelist or complete strings
NEVER: Hex color values outside `globals.css` design tokens — breaks design consistency and dark mode
NEVER: `!important` without a comment documenting the specificity reason — hidden overrides cause cascade bugs
NEVER: `@apply` with a list of single-use utilities — write Tailwind classes inline or extract a component
NEVER: Global selector inside a `.module.scss` file — leaks styles to unrelated DOM elements
NEVER: New design token added to `theme` base (not `theme.extend`) — silently removes built-in Tailwind utilities
