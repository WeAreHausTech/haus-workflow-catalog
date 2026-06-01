# Workflow

## Implementation steps

1. Read `package.json` `packageManager` field to determine `yarn` / `pnpm` / `npm`.
2. Remove any legacy Prettier config files (`.prettierrc.*`, `prettier.config.*`) before installing.
3. Install both packages as devDependencies:
   - Yarn: `yarn add -D prettier @haus-tech/tech-config`
   - pnpm: `pnpm add -D prettier @haus-tech/tech-config`
   - npm: `npm i -D prettier @haus-tech/tech-config`
4. Create `.prettierrc` containing exactly the single-line string `"@haus-tech/tech-config/prettier"`.
5. Create `.prettierignore` with the standard haus patterns (see conventions.md).
6. Add scripts to `package.json`:
   ```json
   "format": "prettier --write .",
   "format:check": "prettier --check ."
   ```
7. Run `yarn format` once across the repo and review the resulting diff before committing.
8. Commit `.prettierrc`, `.prettierignore`, `package.json`, and any reformatted files as separate commits if the noise is large.

## Commands

```bash
# Inspect current state
cat package.json | jq '.devDependencies.prettier, .devDependencies["@haus-tech/tech-config"]'
ls -la .prettierrc* prettier.config.* 2>/dev/null

# Install
yarn add -D prettier @haus-tech/tech-config

# Verify
yarn prettier --version
yarn format:check

# Apply
yarn format
```

## Validation checklist

- [ ] `prettier` and `@haus-tech/tech-config` in `devDependencies`
- [ ] Exactly one Prettier config file at repo root (`.prettierrc`)
- [ ] `.prettierrc` content is the single-string `"@haus-tech/tech-config/prettier"` reference
- [ ] `.prettierignore` present and excludes `node_modules`, `dist`, build outputs, lock files
- [ ] `format` + `format:check` scripts in `package.json`
- [ ] No legacy config files left behind (`.prettierrc.json`, `prettier.config.*`)
- [ ] `yarn format:check` passes (or planned full-format commit is staged)
- [ ] Repo CI runs `format:check` (or equivalent) before merge
