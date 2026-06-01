# Scope

## In-scope files and dirs

- `**/*.test.ts(x)` / `**/*.spec.ts(x)` — unit and integration tests
- `jest.config.ts` / `jest.config.js` / `jest.preset.js` — root or per-project config
- `jest.setup.ts` — setup hooks, polyfills, matcher registration
- `__mocks__/**` — module-level auto-mocks
- Nx project files: `apps/<name>/jest.config.ts`, `libs/<name>/jest.config.ts`
- `src/test-utils/**` — shared factories and render helpers

## Stack boundaries

- Jest unit: pure modules, mocked collaborators
- Jest integration: composes real modules; mocks only at process/network boundary
- React/Vue DOM rendering → combine with `testing-library-patterns`
- Browser E2E → not in scope, use `playwright-patterns`
- Storybook interaction tests → not in scope, use `storybook-patterns`
- Vitest projects → not in scope, use `vitest-patterns`
- PHP/Laravel tests → not in scope, use `phpunit-patterns`

## Triggers

- Adding or changing a TS/JS exported function or class in a Jest project
- Modifying `jest.config.*` `moduleNameMapper` or `transform` (catches build-resolution regressions)
- Introducing a new module boundary that needs a `jest.mock` contract
- Adding a regression test for a production bug
- Changing `coverageThreshold` or excluding paths
- Adjusting Nx project `test` target executor or options
