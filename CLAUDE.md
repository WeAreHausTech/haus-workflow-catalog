@.claude/WORKFLOW.md
@.claude/workflow-config.md

# haus-workflow-catalog

Content catalog for `@haus-tech/haus-workflow`. Consumed at runtime by the CLI — not bundled into the npm package.

## Repo structure

```
manifest.json          — catalog item registry (source of truth)
skills/                — skill packages: SKILL.md + references/
agents/                — agent definition files (.md)
templates/             — managed file templates
scripts/               — validation scripts
schema/                — JSON schemas for manifest and catalog items
```

## Key rules

**Manifest and item versions are independent.** Bump `manifest.json` top-level `version` on every release. Bump individual item `version` in `manifest.json` whenever any file under that item's `path` changes — CI will catch missed bumps on PRs.

**Before release:** `manifest.json` top-level `version` must match the git tag (e.g. tag `v2.0.2` → version `"2.0.2"`). `scripts/check-manifest-version.mjs` enforces this.

**Validation rules have one source.** `validation-rules.json` (repo root) is canonical — forbidden tags, banned phrases, required sections, install patterns, and the stack allowlist. `scripts/validation-rules.mjs` is a thin loader; the haus-workflow CLI consumes the same JSON as a synced fixture (ADR-0001). Edit the JSON, never the loader. A push to `main` dispatches the fixture sync to haus-workflow.

## Adding a new item

1. Create the file(s) under `skills/`, `agents/`, or `templates/`.
2. Skills need `SKILL.md` containing `## Use when` and `## Do not use when`.
3. Agents need `## Use when`, `## Do not use when`, and `## Verification` sections. No banned phrases: `autonomous`, `swarm`, `delegate`, `orchestrat`, `marketplace`.
4. Add the item entry to `manifest.json`. Set `version: "1.0.0"`.
5. No `TODO` or `PLACEHOLDER` in any shipped file. All URLs must use `https://`.
6. No forbidden stack tags: `python`, `django`, `go`, `rust`, `java`, `spring`, `kotlin`, `swift`, `android`, `flutter`, `dart`, `c++`, `perl`, `defi`, `trading`.
7. No `npx -y`, `npx --yes`, `yarn dlx`, or `pnpm dlx` in markdown. Only `npx tsx` is allowed.

## Validation

```bash
yarn validate                        # full local check
node scripts/validate.mjs            # same, explicit
haus validate-catalog ./manifest.json  # via CLI
```

CI runs both on every push and PR. Item version check runs on PRs only.

## Release process

1. Merge to `main` with conventional commits (`feat:`, `fix:`, …).
2. `yarn release` (or `yarn release:dry`, or `yarn release 2.1.1`). Uses release-it + conventional-changelog; syncs `manifest.json#version` via hooks.
3. Tag push triggers release CI → GitHub Release + `manifest.json` artifact.

## How consumers get updates

`haus install` / `haus update` fetches live from this repo at the ref specified by `HAUS_CATALOG_REF` (default: `main`). Changes to `main` are available to consumers immediately — no CLI release needed.
