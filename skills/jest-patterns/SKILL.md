---
name: jest-patterns
description: Jest router. Use for TypeScript/JS unit and integration tests in Nx and legacy setups, mocking strategy, and coverage config.
---

# Jest Patterns

## Use when

- task changes TypeScript/JS behavior in a Jest-based project (Nx workspace or legacy CRA/Next)
- task touches `*.test.ts(x)`, `*.spec.ts(x)`, `jest.config.*`, `jest.preset.*`, or `jest.setup.*`
- task introduces or modifies a `jest.mock` / `jest.spyOn` boundary

## Do not use when

- project runs Vitest (use `vitest-patterns`)
- task is browser end-to-end behavior (use `playwright-patterns`)
- task is PHP backend (use `phpunit-patterns`)

## Inspect first

- changed module under test and its direct imports
- nearest `jest.config.*` / `jest.preset.*` (transform, moduleNameMapper, testEnvironment)
- Nx project `project.json` `test` target — picks up project-local config
- `jest.setup.*` for registered matchers, polyfills, env stubs
- coverage thresholds in `jest.config.*` `coverageThreshold` block

## Avoid mistakes

- importing the test target from `dist/` instead of `src/` — stale build hides regressions
- mocking the module under test instead of its collaborators
- mixing `jsdom` and `node` `testEnvironment` in a single project without per-file `@jest-environment` pragma
- asserting on private helper call counts instead of observable behavior
- forgetting `clearMocks: true` in config — relying on Jest defaults differs by version

## Router

1. Load `references/conventions.md` for naming, do/don't, and forbidden patterns.
2. Load `references/scope.md` for Jest file targeting, Nx specifics, and stack boundaries.
3. Load `references/workflow.md` only for failing-test diagnosis and coverage flow.
4. Keep tests behavior-focused, isolated, and deterministic.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
