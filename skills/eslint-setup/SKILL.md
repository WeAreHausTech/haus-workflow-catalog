---
name: eslint-setup
description: Setup task. Install @haus-tech/tech-config and wire ESLint flat config to the shared rules.
---

# ESLint Setup

## Use when

- `eslint` is missing from `package.json` in a haus repo
- repo uses a legacy `.eslintrc.*` config and needs to migrate to flat config + `@haus-tech/tech-config`

## Do not use when

- ESLint already configured against `@haus-tech/tech-config`
- repo deliberately uses a non-shared ESLint config (rare; document why)

## Inspect first

- `package.json` — confirm `eslint` and `@haus-tech/tech-config` absent or outdated
- existing `.eslintrc`, `.eslintrc.json`, `.eslintrc.js`, `eslint.config.*` — anything to remove or replace
- existing scripts referencing `eslint` (e.g. `yarn lint`)
- `package.json` `type` field — flat config needs ES module loading or `.mjs` extension
- TypeScript present? — needs `@typescript-eslint/*` peers (handled by `@haus-tech/tech-config`)

## Avoid mistakes

- mixing legacy `.eslintrc.*` and flat `eslint.config.*` — ESLint 9 ignores legacy by default; ESLint 8 picks legacy
- forgetting `eslint.config.js` must be `.js` ES module, `.mjs`, or in a `"type": "module"` project
- omitting peer deps that `@haus-tech/tech-config` requires
- linting `dist/` and `node_modules/` — add ignore globs at top of flat config

## Router

1. Load `references/conventions.md` for flat-config shape and ignore patterns.
2. Load `references/scope.md` for in-scope files this skill touches.
3. Load `references/workflow.md` only for install + migration flow.
4. Replace, don't add — one ESLint config per repo.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
