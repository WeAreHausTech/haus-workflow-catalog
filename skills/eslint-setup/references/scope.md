# Scope

## In-scope files and dirs

- `package.json` — add `eslint` + `@haus-tech/tech-config` to `devDependencies`; add `lint` scripts
- `eslint.config.js` / `eslint.config.mjs` — flat config referencing shared preset
- Legacy configs to remove: `.eslintrc`, `.eslintrc.json`, `.eslintrc.js`, `.eslintrc.cjs`, `.eslintignore`

## Stack boundaries

- ESLint 9+: flat config required
- ESLint 8: flat config opt-in via `ESLINT_USE_FLAT_CONFIG=true`; legacy still default
- Applies to any haus repo using JS/TS
- Not in scope: PHP linting (PHP CS Fixer / Pint)
- Not in scope: stylelint, markdownlint — separate tools

## Triggers

- New repo bootstrap
- Existing repo missing ESLint (detected by `missing-eslint` stack token)
- Migration from legacy `.eslintrc.*` to flat config
- Bumping `@haus-tech/tech-config` major version
- ESLint major version upgrade
