@.claude/WORKFLOW.md
@.claude/workflow-config.md

# haus-workflow-catalog

Content catalog for `@haus-tech/haus-workflow`. Consumed at runtime by the CLI — not bundled into the npm package.

## Setup

```bash
node >= 18, yarn >= 4
yarn install   # installs deps + lefthook hooks
```

No `.env` or external services required.

## Commands

| Command              | Action                                  |
| -------------------- | --------------------------------------- |
| `yarn validate`      | Full catalog validation (test gate)     |
| `yarn test`          | Node:test suite in `tests/`             |
| `yarn lint`          | ESLint over `scripts/`                  |
| `yarn format:check`  | Prettier check (CI gate)                |
| `yarn format`        | Prettier write                          |
| `yarn release`       | Interactive release (patch/minor/major) |
| `yarn release:dry`   | Preview release without committing      |
| `yarn release 2.1.1` | Explicit version release                |

Use `rtk` prefix for token-efficient output (e.g. `rtk yarn validate`). See `~/.claude/RTK.md`.

## Repo structure

```
manifest.json          — catalog item registry (source of truth)
validation-rules.json  — canonical validation rules (ADR-0001)
sources.yaml           — curated upstream snapshots
skills/
  haus-owned/          — first-party skills
  superpowers/         — verbatim curated skills (do not hand-edit)
agents/
  <source-slug>/       — verbatim curated agents, e.g. ecc/, oh-my-claudecode/ (do not hand-edit)
templates/             — managed file templates
configs/               — project-root tooling configs (eslint/, prettier/); type: config, distributed via CLI `haus scaffold` (not `haus apply`)
scripts/               — validate.mjs, sync-upstream.mjs, validation-rules.mjs
schema/                — JSON schemas for manifest and catalog items
tests/                 — node:test suite for validation logic
docs/                  — ADRs and runbooks
```

## Key conventions

- **Manifest and item versions are independent.** Bump `manifest.json` top-level `version` on every release. Bump individual item `version` in `manifest.json` whenever any file under that item's `path` changes — CI catches missed bumps on PRs.
- **Validation rules have one source.** `validation-rules.json` is canonical. Edit the JSON, never `scripts/validation-rules.mjs` (thin loader). A push touching `manifest.json` or `validation-rules.json` dispatches fixture sync to the CLI repo.
- **Tag allowlist (positive gate).** Every item tag must be in `validation-rules.json#allowedStacks`, an `alwaysAllowedTags` meta tag, or end with a `patternTagSuffixes` suffix — adding a new stack means adding it to the allowlist first.
- **Workflow-doc sync.** `templates/agentic-workflow-standard.md` and `.claude/WORKFLOW.md` must be byte-identical. Edit the template, then: `cp templates/agentic-workflow-standard.md .claude/WORKFLOW.md`.
- **Do not hand-edit curated dirs** (`skills/<source-slug>/`, `commands/<source-slug>/`, `agents/<source-slug>/`) — sync from upstream via `node scripts/sync-upstream.mjs --apply`.
- **Docs are an index.** Use path references in `docs/`; read source for implementation detail.
- **Keep docs in sync.** When commands, structure, or release process change, run the **writing-documentation** skill and commit doc updates with the code change.

## Adding a new item

1. Create file(s) under `skills/`, `agents/`, `templates/`, `commands/`, or `configs/`.
2. Skills: `SKILL.md` with non-empty `description:` frontmatter.
3. Agents: `.md` file with non-empty `description:` frontmatter.
4. Commands: `.md` file with `description:` frontmatter.
5. Configs: tooling files under `configs/<tool>/`; `type: config`, `tokenEstimate: 0` (not loaded into agent context).
6. Add entry to `manifest.json` with `version: "1.0.0"`.
7. Safety rules: no risky install patterns; `npx tsx` only; `references[]` = `https://` URLs only; no forbidden stack tags.
8. TODO/placeholder checks apply to shipped template/command files, not skill prose.

## Validation

```bash
yarn validate                        # full local check
yarn test                            # node:test suite
haus validate-catalog ./manifest.json  # via CLI
```

CI runs on every push and PR. Item version bump check runs on PRs only.

## Release process

See [docs/deployment.md](docs/deployment.md) for the full flow.

1. Merge to `main` with conventional commits (`feat:`, `fix:`, …).
2. `yarn release` — bumps `package.json`, syncs `manifest.json#version`, updates `CHANGELOG.md`, commits, tags, pushes.
3. Tag push triggers CI → GitHub Release + `manifest.json` artifact.

## Before opening a PR

- [ ] `yarn validate` passes
- [ ] `yarn test` passes
- [ ] Item version bumped in `manifest.json` for every changed item path
- [ ] `templates/agentic-workflow-standard.md` and `.claude/WORKFLOW.md` are byte-identical if either changed
- [ ] New stack tags added to `validation-rules.json#allowedStacks`
- [ ] Run the **writing-documentation** skill if structure, commands, or deploy process changed (or N/A)

## Docs

[docs/SUMMARY.md](docs/SUMMARY.md)
