## Naming conventions

- Test files: `Component.test.tsx` colocated with the component
- Custom render: `renderWithProviders(ui, options)` in `src/test-utils/render.tsx`
- MSW handlers: `src/mocks/handlers.ts` (feature handlers) + `src/mocks/server.ts` (Node server setup)
- MSW browser setup: `src/mocks/browser.ts` for Storybook/dev
- Query selectors priority (in order): `getByRole` → `getByLabelText` → `getByText` → `getByTestId`

## Do / don't

DO: Use `getByRole` as the primary query — DON'T: use `getByTestId` when a role or label query is possible
DO: Use `userEvent` from `@testing-library/user-event` — DON'T: use `fireEvent` (does not simulate real user interaction sequences)
DO: Use MSW (`msw`) to mock API calls — DON'T: mock `fetch` or `axios` with `jest.mock` (bypasses network layer)
DO: Use `findBy*` queries for assertions on async DOM updates — DON'T: use `getBy*` immediately after triggering an async operation
DO: Setup `server.resetHandlers()` in `afterEach` — DON'T: share MSW handler overrides between tests
DO: Assert rendered output visible to the user — DON'T: assert component state, prop values, or internal store contents
DO: Use `within(container)` to scope queries to a subsection of the DOM — DON'T: use global queries when multiple matching elements exist

## Forbidden patterns

NEVER: `jest.mock('axios')` or `jest.mock('fetch')` when MSW is available — bypasses the HTTP layer entirely
NEVER: Manual `act()` wrapping — `userEvent` and `findBy*` already handle async flushing
NEVER: `setTimeout` / `setInterval` in tests — use `jest.useFakeTimers()` and advance manually
NEVER: Import from `__mocks__/` directory directly in test files when MSW handlers are available — duplicates mock infrastructure
NEVER: Test file that depends on another test file's setup or teardown — each test must be self-contained
NEVER: `screen.getByTestId` as first-choice query when `getByRole` with accessible name works — reduces accessibility signal
