## Naming conventions

- Turbo task names: must match `package.json` `scripts` key exactly — case-sensitive (e.g. `"build"` not `"Build"`)
- Pipeline config file: `turbo.json` (root) or `turbo.json` inside a package for package-level overrides
- Cache output directories: listed in `"outputs"` array — typically `["dist/**", ".next/**", "build/**"]`
- `namedInputs` in `turbo.json`: descriptive names like `"defaultInputs"`, `"sourceFiles"`, `"testFiles"`

## Do / don't

DO: Add `"dependsOn": ["^build"]` for tasks that require upstream packages to be built first — DON'T: run build tasks in packages without ensuring dependencies are built
DO: Keep `"outputs"` arrays accurate and complete for all cached tasks — DON'T: omit output paths (cache hit replays nothing useful)
DO: Use `--filter` or `--affected` in CI to run only relevant packages — DON'T: run `turbo run build` without `--filter` on large monorepos (runs all packages)
DO: Define `"inputs"` narrowly to include only files that actually affect the task — DON'T: omit `"inputs"` (defaults to all files, over-invalidates cache)
DO: Verify task name exists in `package.json` before adding to `turbo.json` pipeline — DON'T: add a task to `turbo.json` that no package's `package.json` defines
DO: Use `--dry-run` to preview what Turbo will run before executing — DON'T: run a new pipeline config blindly in CI

## Forbidden patterns

NEVER: `"inputs"` array that includes `dist/` or test output directories — causes cache thrash (output changes invalidate the next run)
NEVER: Manually edit `.turbo/` cache directory contents — corrupts the local cache
NEVER: `--force` flag in CI without documented justification — bypasses cache saving, defeats reproducibility
NEVER: Task name in `turbo.json` that doesn't match any `package.json` script — silently runs nothing
NEVER: `turbo run <task> --parallel` on tasks that have `dependsOn` constraints — can run dependents before dependencies finish
NEVER: Remove `"outputs"` from a task that generates build artifacts — remote cache cannot restore artifacts on cache hit
