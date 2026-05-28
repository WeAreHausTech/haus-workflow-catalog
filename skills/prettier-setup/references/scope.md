# Scope

## In-scope files and dirs

- `package.json` — add `prettier` + `@haus-tech/prettier-config` to `devDependencies`; add `format` scripts
- `.prettierrc` — single-line file referencing the shared package
- `.prettierignore` — standard ignore patterns
- Legacy configs to remove: `.prettierrc.json`, `.prettierrc.js`, `prettier.config.js`, `prettier.config.cjs`

## Stack boundaries

- Applies to any haus repo using JS/TS/JSON/Markdown files
- Not in scope: PHP/Laravel formatting (use PHP CS Fixer / Pint via separate config)
- Not in scope: editor integration — IDE-specific; document in repo README if needed

## Triggers

- New repo bootstrap
- Existing repo missing Prettier (detected by `missing-prettier` stack token)
- Migration from a non-shared inline Prettier config
- Bumping `@haus-tech/prettier-config` major version
