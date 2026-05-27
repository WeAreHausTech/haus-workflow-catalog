## Naming conventions

- Story files: `Component.stories.tsx` adjacent to the component file (co-located)
- Story exports: PascalCase scenario names — `Default`, `Disabled`, `Loading`, `Empty`, `Error`, `WithLongText`
- Meta type: `const meta: Meta<typeof MyComponent> = { ... }` (CSF3 format)
- Story type: `type Story = StoryObj<typeof meta>`
- Global providers: configured as decorators in `.storybook/preview.tsx`
- Mock data: inline in story `args` or in `Component.stories.fixtures.ts`

## Do / don't

DO: Use CSF3 format with `Meta<typeof Component>` and `StoryObj<typeof Component>` — DON'T: use CSF2 (old `Template.bind({})`) in new stories
DO: Add a `play()` function for interactive/validation scenarios — DON'T: leave multi-step interactions undocumented with no story
DO: Wrap global providers (theme, i18n, router) in `preview.tsx` decorators — DON'T: import and re-wrap providers in individual story files
DO: Include a `Default` export story for every public component — DON'T: skip the default state (makes controls non-functional)
DO: Update stories when component public API changes — DON'T: let stories fall out of sync with component props
DO: Use `@storybook/test` for assertions inside `play()` — DON'T: import `@testing-library/jest-dom` matchers in story files

## Forbidden patterns

NEVER: Story with no `args` defined — Controls addon cannot function without args
NEVER: Hardcoded numeric IDs in mock data (causes collision in parallel test runs) — use string slugs or factory-generated IDs
NEVER: Production API data imported into story args — test data only
NEVER: Component with a public API change and no corresponding story update — stories are the visual contract
NEVER: `play()` that uses `waitForTimeout` or `setTimeout` for timing — use `waitFor` from `@storybook/test`
NEVER: Story that imports from `@testing-library/jest-dom` directly — use `@storybook/test` equivalents
