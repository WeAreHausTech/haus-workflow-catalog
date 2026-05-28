## Naming conventions

- Config file: `.prettierrc` at repo root (JSON form preferred for minimal CI parse cost)
- Ignore file: `.prettierignore` at repo root — covers `dist/`, `build/`, `node_modules/`, lock files
- Script entry: `package.json` `scripts.format` → `prettier --write .`
- Script entry: `package.json` `scripts.format:check` → `prettier --check .`

## Do / don't

DO: Reference the shared config as a string in `.prettierrc` — DON'T: copy/paste rules inline
DO: Pin `@haus-tech/prettier-config` as a devDependency — DON'T: install as a runtime dep
DO: Commit `.prettierignore` alongside `.prettierrc` — DON'T: rely on `.gitignore` for Prettier exclusions
DO: Add `format` and `format:check` scripts — DON'T: rely on editor-only formatting
DO: Replace any legacy `.prettierrc.json` / `prettier.config.js` with the single `.prettierrc` — DON'T: leave two competing configs

## Forbidden patterns

NEVER: override shared rules in a way that diverges from haus standards without a documented reason
NEVER: keep legacy `.prettierrc` rules alongside the new one — Prettier silently picks first match
NEVER: commit `node_modules/` formatting differences — exclude via `.prettierignore`

## .prettierrc shape

```json
"@haus-tech/prettier-config"
```

Yes — that's the entire file. Prettier 3.x supports a string config referencing a package. The shared package exports the canonical haus options.

## .prettierignore shape

```
node_modules
dist
build
.next
.cache
coverage
*.lock
*.lockb
yarn.lock
pnpm-lock.yaml
package-lock.json
```
