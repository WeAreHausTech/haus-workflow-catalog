## Naming conventions

- Spec files: `feature-name.spec.ts` in `tests/` or `e2e/` (kebab-case feature name)
- Page objects: `XxxPage.ts` in `tests/pages/` (PascalCase + `Page` suffix)
- Fixtures: defined in `tests/fixtures/index.ts` extending `test` from `@playwright/test`
- Auth state files: `playwright/.auth/<role>.json` (e.g. `playwright/.auth/admin.json`)
- Test data helpers: `tests/helpers/` for non-page-object utilities (API seeders, data builders)

## Do / don't

DO: Use `data-testid` attributes as primary selectors — DON'T: use CSS class selectors for behavior assertions (classes change, behavior meaning does not)
DO: Record `storageState` once per role and reuse across tests — DON'T: perform UI login navigation in every test
DO: Seed test data via API calls in `beforeEach` — DON'T: navigate the UI to create test prerequisites
DO: Use `locator.waitFor()` or `expect(locator).toBeVisible()` for async assertions — DON'T: use `page.waitForTimeout()` as a timing hack
DO: Encapsulate all locator definitions inside Page Object methods — DON'T: define locators inline inside spec files
DO: Run tests with `--reporter=html` in CI to capture traces on failure — DON'T: debug flaky tests without trace files
DO: Keep each test independent (no state from sibling tests) — DON'T: rely on test execution order for setup or teardown

## Forbidden patterns

NEVER: `page.waitForTimeout()` under any condition — timing-based waits cause flaky tests
NEVER: UI login flow in every test — use `storageState` saved once for the role
NEVER: Locator defined directly in a `.spec.ts` file — must live in a Page Object
NEVER: `test.only()` or `test.skip()` committed to the main branch — blocks the full suite
NEVER: Assertions on raw CSS class names for functional state (e.g. checking `class="active"`) — use ARIA or visible text
NEVER: Hardcoded wait `expect(page).toHaveURL(url)` without `{ timeout }` context — silent race condition
