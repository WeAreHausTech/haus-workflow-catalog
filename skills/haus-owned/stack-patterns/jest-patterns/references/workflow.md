# Workflow

## Implementation steps

1. Identify test type: unit (isolated module, mocked collaborators) or integration (real composition, mock only at process boundary).
2. Place the test file colocated with source (`foo.ts` ↔ `foo.test.ts`) or under integration dir for cross-module scope.
3. Choose environment: default `node`; for DOM/React/Vue use `// @jest-environment jsdom` at file top or set `testEnvironment` in config.
4. Hoist module mocks at file scope with `jest.mock("./api")`; never inside `beforeEach`.
5. For time-dependent logic, call `jest.useFakeTimers()` in `beforeEach` and `jest.useRealTimers()` in `afterEach`.
6. Ensure `clearMocks: true` in config; do not litter `jest.clearAllMocks()` calls across files.
7. For async errors, use `await expect(fn()).rejects.toThrow(SpecificError)` — not bare `toThrow()`.
8. Add a regression test BEFORE applying a bug fix; confirm it fails on the broken code first.
9. In Nx, run via `nx test <project>`; never invoke root-level `jest` in a monorepo.
10. Check coverage on changed files via `--coverage --changedSince=main`; target branch coverage.

## Commands

```bash
yarn jest                                      # all projects
yarn jest path/to/file.test.ts                 # single file
yarn jest -t "createOrder returns"             # filter by test name
yarn jest --coverage                           # full coverage run
yarn jest --watch                              # watch mode (only changed files)
yarn jest --changedSince=main                  # only files changed vs main
yarn jest --bail                               # stop on first failure
yarn jest --runInBand                          # serial execution for debugging

# Nx workspaces
nx test <project>                              # run project test target
nx test <project> --watch                      # watch one project
nx affected:test                               # test only projects affected by changes
nx test <project> --coverage --coverageReporters=text
```

## Validation checklist

- [ ] Each test isolated — passes alone (`-t "..."`) and in full suite
- [ ] `jest.mock` calls at file scope, not inside lifecycle hooks
- [ ] `clearMocks: true` set in config; no scattered `jest.clearAllMocks()` calls
- [ ] Async errors asserted with `rejects.toThrow(SpecificError)`, not bare `toThrow`
- [ ] No `setTimeout`/`setInterval` without `jest.useFakeTimers()`
- [ ] Regression test added BEFORE bug fix landed
- [ ] Coverage on changed files meets `coverageThreshold` in config
- [ ] No real network/DB calls — confirmed by grepping `fetch(`, `http`, DB drivers in diff
- [ ] In Nx: ran via `nx test <project>`, not root `jest`
- [ ] Skipped tests (`it.skip`) carry a linked ticket comment
