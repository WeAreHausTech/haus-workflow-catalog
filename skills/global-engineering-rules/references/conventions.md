## Naming conventions

- Follow the naming conventions already present in the project — do not invent a new style
- Match case style (camelCase, PascalCase, snake_case) to what is used in the surrounding code
- Test file naming: mirror the source file name with `.test.` / `.spec.` infix or `Test` suffix per project convention
- Constants: match project style — SCREAMING_SNAKE or PascalCase depending on language/codebase norm
- No inventing abbreviations not already used in the codebase

## Do / don't

DO: Make the smallest change that satisfies the requirement — DON'T: refactor surrounding code that is not in scope
DO: Add or update tests for every behavior change — DON'T: ship behavior changes without corresponding test coverage
DO: State explicitly which validation command was run (e.g. `pnpm test`, `dotnet test`) — DON'T: claim tests pass without running them
DO: Keep changes production-oriented and deployable — DON'T: leave debug statements, commented-out code, or half-finished experiments
DO: Touch only files directly related to the task — DON'T: change unrelated files or clean up "while you're there"
DO: Update documentation and comments when behavior changes — DON'T: leave stale comments describing old behavior
DO: Confirm edge cases are handled before marking a task done — DON'T: close a task when only the happy path is covered

## Forbidden patterns

NEVER: Read `.env` files, private keys, production logs, database dumps, or customer data exports
NEVER: Ship code containing unresolved markers (e.g. work-in-progress comments or stub values) — resolve or remove before marking complete
NEVER: Skip the validation/test run step — always run and report results
NEVER: Change public API or interface signatures without tracing all callers
NEVER: Introduce a new dependency without checking for an existing equivalent in the project
NEVER: Leave a failing test in the codebase to "fix later"
