# Project workflow configuration

> Project-specific values that the workflow standard (WORKFLOW.md) binds to.
> Edit freely — this file is project-owned and will not be overwritten by haus.
>
> Everyday commands (validate, lint, format, version checks) and project
> documentation live in `CLAUDE.md` + `docs/` — run the **writing-documentation**
> skill to generate/refresh them.

## Source-of-truth documents

- Spec: `manifest.json` (catalog item registry — source of truth)
- Design: `schema/catalog-item.schema.json` (item schema)
- Plans: `docs/plans/<feature-slug>.md`

## Test commands (TDD / verification gate)

- Test (unit + integration): `yarn validate` (catalog validation is this repo's test gate)
- Test (E2E): n/a — no runtime application code

## Highest-stakes logic

Catalog validation rules and manifest version gating. Changes to `validation-rules.json`
must stay mirrored in `haus-workflow` (synced fixture, ADR-0001) — divergence silently
breaks CLI enforcement for all users.

## Pre-commit tool

Lefthook (`lefthook.yml`)
