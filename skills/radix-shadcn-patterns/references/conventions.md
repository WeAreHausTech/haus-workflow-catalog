## Naming conventions

- Component files: `Button.tsx`, `Dialog.tsx` — PascalCase, one component per file
- Variant definitions: `buttonVariants = cva(...)` — `cva()` from `class-variance-authority`, named `<component>Variants`
- Class merge utility: `cn()` in `lib/utils.ts` — always import from there, never inline
- CSS design tokens: CSS variables in `globals.css` under `:root` and `.dark` selectors (e.g. `--background`, `--primary`)
- Compound components: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content` (namespace the sub-parts)
- Re-exported primitives: named exports from `components/ui/` (the shadcn output directory)

## Do / don't

DO: Use `asChild` prop when wrapping a Radix trigger with a custom element — DON'T: nest a `<button>` inside a `<button>` (invalid HTML)
DO: Use `cn()` for all conditional and merged class strings — DON'T: concatenate class names with `+` or template literals
DO: Define all design tokens as CSS variables in `globals.css :root` — DON'T: hardcode hex or rgb color values inside component files
DO: Add `React.forwardRef` to all primitive wrapper components — DON'T: block ref access from parent components
DO: Test keyboard interactions (Tab focus, Escape dismiss, Arrow navigation) after changes — DON'T: skip keyboard navigation testing for interactive components
DO: Use `data-[state=open]` / `data-[state=closed]` Radix data attributes for animation — DON'T: manually track open/close state to apply CSS classes

## Forbidden patterns

NEVER: `Dialog.Root` without `Dialog.Overlay` — broken focus trap and incorrect accessibility behavior
NEVER: `style={{ color: '#abc123' }}` for design token values — use CSS variables
NEVER: `className` concatenation with string `+` operator — use `cn()` to avoid purge and merge issues
NEVER: Override Radix-managed `aria-*` attributes manually — breaks built-in accessibility behavior
NEVER: Remove or skip `Dialog.Portal` — required for correct stacking context and focus management
NEVER: Component variant defined as a separate component instead of `cva()` variant — creates component sprawl
