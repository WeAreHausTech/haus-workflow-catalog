# Workflow

## Implementation steps

1. Read `package.json` `packageManager` field to determine `yarn` / `pnpm` / `npm`.
2. Remove any legacy ESLint config files (`.eslintrc.*`, `.eslintignore`).
3. Install both packages as devDependencies:
   - Yarn: `yarn add -D eslint @haus-tech/tech-config`
   - pnpm: `pnpm add -D eslint @haus-tech/tech-config`
   - npm: `npm i -D eslint @haus-tech/tech-config`
4. Create `eslint.config.js` referencing the shared preset (see conventions.md for the exact shape).
5. If project is CommonJS (`"type": "commonjs"` or absent), use `eslint.config.mjs` for ESM imports.
6. Add scripts to `package.json`:
   ```json
   "lint": "eslint .",
   "lint:fix": "eslint . --fix"
   ```
7. Run `yarn lint` once to surface initial findings.
8. Decide: fix violations in bulk via `yarn lint:fix`, or stage them per-PR with eslint-disable comments carrying a reason.

## Commands

```bash
# Inspect current state
cat package.json | jq '.devDependencies.eslint, .devDependencies["@haus-tech/tech-config"]'
ls -la .eslintrc* eslint.config.* 2>/dev/null

# Install
yarn add -D eslint @haus-tech/tech-config

# Verify
yarn eslint --version
yarn lint

# Apply autofixes
yarn lint:fix
```

## Validation checklist

- [ ] `eslint` and `@haus-tech/tech-config` in `devDependencies`
- [ ] Exactly one ESLint config file at repo root (`eslint.config.js` or `.mjs`)
- [ ] Config imports shared preset from `@haus-tech/tech-config` — no copied rules
- [ ] Ignore globs declared inline at top of config (no `.eslintignore`)
- [ ] `lint` + `lint:fix` scripts in `package.json`
- [ ] No legacy config files left behind (`.eslintrc.*`)
- [ ] `yarn lint` runs (errors OK initially; the path forward is documented)
- [ ] Repo CI runs `lint` before merge
- [ ] Any `eslint-disable` comments carry a `// reason: ...` annotation
