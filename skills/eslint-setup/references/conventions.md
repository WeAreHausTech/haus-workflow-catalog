## Naming conventions

- Config file: `eslint.config.js` (flat config) at repo root — `.mjs` only if project is CommonJS and needs ES module isolation
- Ignore globs: declared inline at top of `eslint.config.js` (no separate `.eslintignore` — that file is ignored by flat config)
- Script entry: `package.json` `scripts.lint` → `eslint .`
- Script entry: `package.json` `scripts.lint:fix` → `eslint . --fix`

## Do / don't

DO: Use the shared preset via `import hausConfig from "@haus-tech/tech-config/eslint"` — DON'T: copy rules inline
DO: Place ignore globs at top of the config array — DON'T: rely on `.eslintignore` (flat config ignores it)
DO: Add overrides for test files and scripts — DON'T: turn off rules globally to silence one file
DO: Pin `@haus-tech/tech-config` and `eslint` as devDependencies — DON'T: install as runtime deps
DO: Add `lint` + `lint:fix` scripts — DON'T: rely on editor-only linting
DO: Run lint in CI before merge — DON'T: trust local hooks alone

## Forbidden patterns

NEVER: keep legacy `.eslintrc.*` files alongside `eslint.config.js` — ESLint silently picks one based on version
NEVER: turn off rules globally to silence a single file — use per-file overrides
NEVER: lint `node_modules`, `dist`, `build`, `.next`, `coverage` — slow and noisy
NEVER: skip the shared preset without a documented reason
NEVER: ship code with `// eslint-disable-next-line` comments lacking a reason

## eslint.config.js shape (ESM project)

```js
import hausConfig from '@haus-tech/tech-config/eslint'

export default [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', '.next/**', 'coverage/**'],
  },
  ...hausConfig,
  // optional per-repo overrides:
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
]
```

## eslint.config.mjs shape (CommonJS project that imports ESM)

Same content as above but file is `.mjs` so Node uses ESM loader regardless of `package.json` `type`.
