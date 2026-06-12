@.claude/WORKFLOW.md
@.claude/workflow-config.md

# haus-workflow-catalog

Content catalog for `@haus-tech/haus-workflow`. Consumed at runtime by the CLI — not bundled into the npm package.

## Repo structure

```
manifest.json          — catalog item registry (source of truth)
validation-rules.json  — canonical validation rules (ADR-0001)
sources.yaml           — curated upstream snapshots
skills/
  haus-owned/          — first-party skills
  superpowers/         — verbatim curated skills (do not hand-edit)
agents/                — agent definition files (.md)
commands/superpowers/  — verbatim curated slash commands
templates/             — managed file templates
scripts/               — validate.mjs, sync-upstream.mjs, validation-rules.mjs
schema/                — JSON schemas for manifest and catalog items
```

## Key rules

**Manifest and item versions are independent.** Bump `manifest.json` top-level `version` on every release. Bump individual item `version` in `manifest.json` whenever any file under that item's `path` changes — CI will catch missed bumps on PRs.

**Before release:** `manifest.json` top-level `version` must match the git tag (e.g. tag `v2.0.2` → version `"2.0.2"`). `scripts/check-manifest-version.mjs` enforces this.

**Validation rules have one source.** `validation-rules.json` (repo root) is canonical.
`scripts/validation-rules.mjs` is a thin loader; the haus-workflow CLI consumes the
same JSON as a synced fixture (ADR-0001). Edit the JSON, never the loader. A push to
`main` that touches `manifest.json` or `validation-rules.json` dispatches fixture sync.

**Catalog size:** **71 items** (61 skills, 2 agents, 3 templates, 5 commands) —
50 `haus` + 21 `curated` superpowers. (Manifest version lives in `manifest.json`; do
not restate it in prose — it drifts every release.)

**Tag allowlist (positive gate).** Every item tag must be a known stack in
`validation-rules.json#allowedStacks`, an `alwaysAllowedTags` meta tag, or end with a
`patternTagSuffixes` suffix — otherwise validation fails. Adding a new stack means adding
its tag to `validation-rules.json#allowedStacks`, not just creating the skill.

**Workflow-doc sync.** `templates/agentic-workflow-standard.md` and `.claude/WORKFLOW.md`
must be byte-identical (`checkWorkflowDocSync` in `validate.mjs`) — the latter is the
shipped template applied to this repo. Edit the template, then copy it over the local
copy: `cp templates/agentic-workflow-standard.md .claude/WORKFLOW.md`.

## Adding a new item

1. Create the file(s) under `skills/haus-owned/`, `agents/`, `templates/`, or `commands/`.
2. **Skills** need `SKILL.md` with YAML frontmatter including non-empty `description:`.
   Optional `## Use when` / `## Do not use when` prose is fine but not required.
3. **Agents** need a `.md` file with YAML frontmatter including non-empty `description:`
   (same when-signal convention as skills). Optional prose sections are fine but not required.
4. **Commands** need a `.md` file with frontmatter `description:`.
5. Add the item entry to `manifest.json`. Set `version: "1.0.0"`.
6. Safety rules (all markdown): no risky install patterns; only `npx tsx` allowed; manifest
   `references[]` is **https:// URLs only** (no relative paths — bundled files live under
   `item.path`; the `http://` ban is enforced on `references[]`, not on prose/code bodies —
   local-dev `http://localhost` URLs in examples are fine); no forbidden stack tags in item
   id/tags.
7. TODO/placeholder checks apply to shipped **template/command** files, not skill prose.
8. Do not hand-edit `skills/superpowers/` or `commands/superpowers/` — sync from upstream.

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

## Tooling

This repo uses **RTK** (Rust Token Killer) for token-optimized CLI output — prefix dev commands with `rtk` (e.g. `rtk git status`, `rtk validate`). Full command reference lives in the global `~/.claude/RTK.md`; not duplicated here.
