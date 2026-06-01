## Naming conventions

- Test files colocated: `foo.ts` ↔ `foo.test.ts` (or `foo.spec.ts` for legacy Nx defaults)
- Integration suites end in `.integration.spec.ts` and live under `apps/<name>/src/integration/`
- `describe` block names mirror the exported symbol or behavior
- `it` / `test` names start with a verb in present tense: `it("returns null when input empty")`
- Manual mocks in `__mocks__/<module>.ts` adjacent to consumer; auto-loaded by `jest.mock("<module>")`
- Test fixtures in `tests/fixtures/` or `src/test-utils/` with one factory per domain entity
- Setup file in `jest.setup.ts`, referenced from config `setupFilesAfterEach`

## Do / don't

DO: Set `clearMocks: true` in `jest.config.*` — DON'T: rely on `jest.clearAllMocks()` scattered through suites
DO: Use `jest.useFakeTimers()` for time-dependent logic — DON'T: `await new Promise(r => setTimeout(r, n))`
DO: Mock at the module boundary with `jest.mock("./api")` — DON'T: deeply mock implementation internals
DO: Assert async errors with `await expect(fn()).rejects.toThrow(SpecificError)` — DON'T: bare `toThrow()`
DO: One behavior per `it` block — DON'T: chain unrelated assertions in a single test
DO: For Nx, run via `nx test <project>` — DON'T: invoke root-level `jest` directly in monorepos
DO: Use `jest.requireActual` when partial-mocking — DON'T: re-export the full module manually

## Forbidden patterns

NEVER: real network or DB calls in unit tests — mock at the module boundary
NEVER: `setTimeout` / `setInterval` without `jest.useFakeTimers()` — flaky and slow
NEVER: shared module-scope mutable state between files — Jest parallelizes workers; state leaks cause flake
NEVER: `jest.mock` inside `beforeEach` — module mocks must be hoisted at file scope
NEVER: `expect.assertions(n)` as a substitute for proper async/await flow control
NEVER: importing from `dist/` or built output — always import from `src/`
NEVER: skipping tests with `it.skip` without a linked ticket in the comment above the line
NEVER: snapshot tests for large dynamic objects (timestamps, IDs) without serializers
