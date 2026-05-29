# Project workflow configuration

> Project-specific values for the workflow standard in WORKFLOW.md.
> Edit freely — this file is project-owned and will not be overwritten by haus.

## Source-of-truth documents

- Spec: `manifest.json` (catalog item registry — source of truth)
- Design: `schema/catalog-item.schema.json` (item schema)
- Plans: `docs/plans/<feature-slug>.md`

## Commands

- Validate catalog: `yarn validate`
- Validate (explicit): `node scripts/validate.mjs`
- Item version check: `node scripts/check-item-versions.mjs`
- Manifest version check: `node scripts/check-manifest-version.mjs`
- Lint: `yarn lint`
- Format check: `yarn format:check`
- Security audit: `yarn npm audit`

## Validation library

n/a — plain JSON schema validation via AJV (no runtime application code)

## Highest-stakes logic

Catalog validation rules and manifest version gating. Changes to `scripts/validation-rules.mjs` must be mirrored in `haus-workflow/src/catalog/validation-rules.ts` — divergence silently breaks CLI enforcement for all users.

## Pre-commit tool

None detected at setup time
