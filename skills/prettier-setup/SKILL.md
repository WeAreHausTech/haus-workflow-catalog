---
name: prettier-setup
description: Setup task. Install @haus-tech/prettier-config and wire a minimal .prettierrc that references the shared config.
---

# Prettier Setup

## Use when

- `prettier` is missing from `package.json` in a haus repo
- repo uses an inline / ad-hoc `.prettierrc` and needs to migrate to the shared `@haus-tech/prettier-config`

## Do not use when

- Prettier already configured against `@haus-tech/prettier-config`
- repo deliberately uses a non-shared Prettier config (rare; document why)

## Inspect first

- `package.json` — confirm `prettier` and `@haus-tech/prettier-config` absent or outdated
- existing `.prettierrc`, `.prettierrc.json`, `prettier.config.*` — anything to remove
- existing scripts referencing `prettier` (e.g. `yarn format`)
- `package.json` `packageManager` field — use that manager's install command

## Avoid mistakes

- installing without removing the legacy inline `.prettierrc` (Prettier picks legacy first)
- skipping the `@haus-tech/prettier-config` peer install — the wrapper alone doesn't work
- adding both `.prettierrc` and `prettier.config.js` — Prettier reads only one; ambiguity

## Router

1. Load `references/conventions.md` for the exact `.prettierrc` shape and ignore patterns.
2. Load `references/scope.md` for in-scope files this skill touches.
3. Load `references/workflow.md` only for install + verification flow.
4. Replace, don't add — one `.prettierrc` per repo.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
