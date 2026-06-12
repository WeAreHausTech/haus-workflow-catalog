# Haus Workflow Catalog

> Internal Haus tool. Open-source but unsupported for external use. No external issues, PRs, or roadmap commitments accepted.

Catalog of skills, agents, and templates distributed by [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow).

## Catalog

**71 items**: 61 skills, 2 agents, 3 templates, 5 commands. (Current manifest version lives in `manifest.json`.)

| Source    | Count | Notes                                                                                                     |
| --------- | ----- | --------------------------------------------------------------------------------------------------------- |
| `haus`    | 50    | First-party stack skills, agents, templates                                                               |
| `curated` | 21    | Verbatim superpowers import (16 skills + 5 commands under `skills/superpowers/`, `commands/superpowers/`) |

See `manifest.json` for the full list. Curated provenance: `sources.yaml` → `superpowers-pcvelz`.

Compatible with `@haus-tech/haus-workflow >= 0.18.0` (requiredSkillFrontmatter validation, command install, stale-item cleanup on apply).

## Structure

```
manifest.json          — catalog item registry (source of truth)
validation-rules.json  — canonical validation rules (see Validation rules below)
sources.yaml           — curated upstream snapshots (superpowers)
skills/
  haus-owned/          — first-party skills
  superpowers/         — verbatim curated skills (pcvelz/superpowers)
agents/                — agent definition files (.md)
commands/
  superpowers/         — verbatim curated slash commands
templates/             — managed file templates (agentic-workflow-standard.md etc.)
scripts/               — validation (validate.mjs) + upstream sync (sync-upstream.mjs)
schema/                — JSON schemas for manifest, catalog items, lock file
docs/                  — ADRs and runbooks
lefthook.yml           — local pre-commit hook (validate + format + lint)
CHANGELOG.md           — release history
```

## How it works

This catalog is the **source of truth** for skill, agent, command, and template content. The [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow) CLI fetches it at runtime — catalog items are not bundled into the npm package (only a fallback manifest + validation-rules fixture ship offline).

```
haus-workflow-catalog          @haus-tech/haus-workflow CLI         consuming project
─────────────────────          ────────────────────────────         ────────────────
manifest.json  ──── fetch ──▶  haus update (cache) / apply  ──▶  .haus-workflow/haus.lock.json
skills/        ──── fetch ──▶  copies into .claude/skills/         (+ agents, commands, templates)
```

### Project install flow

Per-project setup is `haus init` or `haus scan` → `haus recommend` → `haus apply --write`.
The recommender matches items via policy gates + `requiresAny` (stack tokens, repo roles,
intents). Apply fetches matched items from this repo (cached by `haus update`) and writes
`.haus-workflow/haus.lock.json`:

```json
[
  {
    "id": "haus.nextjs-patterns",
    "type": "skill",
    "source": "haus",
    "version": "1.0.0",
    "catalogRef": "main",
    "hash": "sha256-…",
    "paths": [".claude/skills/nextjs-patterns"]
  }
]
```

### Update flow

`haus update` fetches the latest catalog into cache, refreshes the global `~/.claude/`
install, and re-applies project files from `recommendation.json`. The lockfile records
per-item content hashes; apply removes items dropped from the catalog when the on-disk
copy still matches the lock (user-edited copies are kept).

Global-only: `haus install` seeds `~/.claude/` with the bundled `haus-workflow` skill
and slash commands — it does not install catalog stack skills into projects.

### Validation rule sync

`validation-rules.json` (repo root) is the **single source of truth** for all catalog
validation data. `scripts/validation-rules.mjs` is a thin loader; the CLI consumes the
same JSON as a synced fixture (`library/catalog/validation-rules.json`). A push to
`main` that touches `manifest.json` or `validation-rules.json` dispatches fixture sync
in the CLI repo. Edit the JSON, never the loader.

**Authoring vs safety** (see [ADR-0001](docs/adr/0001-curated-verbatim-skill-import.md)):

| Kind      | Rules                                                                                                                                                                                                  | Applies to                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Authoring | Skills and agents require non-empty YAML frontmatter `description:` (superpowers convention). TODO/placeholder scan runs on shipped **template/command** items only — not the repo-wide markdown walk. | All skills; agents; per-item templates/commands |
| Safety    | Forbidden stack tags, risky install patterns (`npx -y`, `dlx`), `npx tsx`-only allowlist, `http://` URL ban, tag allowlist, `source: curated` requires `reviewStatus: approved`                        | All content repo-wide                           |

Cross-repo decision log: [`haus-workflow` ADR-0001](https://github.com/WeAreHausTech/haus-workflow/blob/main/docs/adr/0001-validation-rules-single-source.md).

## Validation

Catalog is validated on every PR via the published [`@haus-tech/haus-workflow`](https://www.npmjs.com/package/@haus-tech/haus-workflow) CLI:

```bash
npm install -g @haus-tech/haus-workflow
haus validate-catalog ./manifest.json
```

A self-contained fallback script remains available for offline checks:

```bash
node scripts/validate.mjs
```

### Local hooks (Lefthook)

`lefthook.yml` adds a pre-commit hook for fast feedback before the CI round-trip —
dogfooding the standard the catalog ships. It runs three commands on commit:
`yarn validate`, Prettier (`--write` on staged files), and ESLint (on staged
`scripts/*.mjs`). Installed by `prepare` (`lefthook install`) on `yarn install`. CI
remains the correctness floor; the hook is local convenience, not a replacement.

## Schema

Each item in `manifest.json` is a `CatalogItem` — canonical JSON Schema:

- [`schema/catalog-item.schema.json`](schema/catalog-item.schema.json)
- [`schema/manifest.schema.json`](schema/manifest.schema.json)
- [`schema/haus-lock.schema.json`](schema/haus-lock.schema.json)

Key fields:

| Field                        | Description                                                        |
| ---------------------------- | ------------------------------------------------------------------ |
| `id`                         | Unique identifier (`haus.<name>`)                                  |
| `type`                       | `skill` \| `agent` \| `template` \| `command`                      |
| `source`                     | `haus` (first-party) \| `curated` (reviewed external)              |
| `version`                    | Semver — PATCH: wording fix, MINOR: new guideline, MAJOR: breaking |
| `path`                       | Relative path to skill dir or agent/template file                  |
| `title`                      | Human-readable display name                                        |
| `purpose`                    | One-line description of what the item provides                     |
| `whenToUse` / `whenNotToUse` | Activation guidance for the AI                                     |
| `tags`                       | Searchable stack tags                                              |
| `requiresAny`                | Match clauses — item only installs if at least one matches         |
| `repoRoles`                  | Repo roles this item targets                                       |
| `installMode`                | How the CLI installs this item                                     |
| `reviewStatus`               | `approved` required for install/recommendation                     |
| `riskLevel`                  | `blocked` items must not install                                   |
| `safetyNotes`                | Guardrails the AI must follow when using this item                 |
| `ecosystem`                  | Family for cross-item conflict detection                           |
| `intents`                    | Natural language phrases for fuzzy matching                        |

## Making changes

### Adding or editing a skill

Every `SKILL.md` must have YAML frontmatter with a non-empty `description:` — this is
the when-signal (superpowers convention). Haus-owned skills may also keep optional
`## Use when` / `## Do not use when` prose sections; they are not required. Manifest
`whenToUse` / `whenNotToUse` remain for the recommender.

```yaml
---
name: my-skill
description: Use when working on X. Do not use for Y.
---
```

Curated superpowers items are copied verbatim from upstream; do not hand-edit files
under `skills/superpowers/` or `commands/superpowers/` except security patches —
use `node scripts/sync-upstream.mjs` (see `docs/runbook.md`).

### Bumping a skill or agent

When you change `SKILL.md`, any bundled file under the item directory (e.g. `references/`),
an agent `.md`, or a command `.md`:

1. Bump the item's `version` in `manifest.json`:

   | Change                                                | Bump            |
   | ----------------------------------------------------- | --------------- |
   | New guideline, extended scope, new bundled file       | `MINOR` (x.1.x) |
   | Wording fix, typo, reordering                         | `PATCH` (x.x.1) |
   | Removed section, breaking scope change, renamed skill | `MAJOR` (1.x.x) |

   Bundled files under `references/` are part of the skill directory — do **not** list them
   in manifest `references[]`. Use `references` only for optional `https://` documentation URLs.

2. Add entry to `CHANGELOG.md` under `## [Unreleased]`:

   ```markdown
   ### Changed

   - **nextjs-patterns** `1.0.0 → 1.1.0`: Added RSC caching patterns to workflow.md
   ```

   PRs without a CHANGELOG entry for bumped items will be flagged by the validator.

### Versioning the manifest itself

`manifest.json#version` is the catalog release version (must match `vX.Y.Z` tags). `yarn release` bumps it on every release via `.release-it.json` hooks.

### Releasing

Uses [release-it](https://github.com/release-it/release-it) + [@release-it/conventional-changelog](https://github.com/release-it/conventional-changelog) (same stack as `@haus-tech/haus-workflow`).

1. Land changes on `main` with [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, …). Release notes are generated from commits since the last tag.
2. Run from `main` with a clean working tree:

   ```bash
   yarn release              # interactive (patch/minor/major)
   yarn release:dry          # preview
   yarn release 2.1.1        # explicit version
   ./scripts/release.sh 2.1.1   # non-interactive (CI/scripts)
   ```

3. `release-it` will: run `yarn validate`, bump `package.json`, sync `manifest.json#version`, update `CHANGELOG.md`, commit, tag `vX.Y.Z`, and push.
4. GitHub Actions on the tag validates the catalog, creates the GitHub Release, and attaches `manifest.json`.

`manifest.json#version` must match the tag. Hooks run `scripts/check-manifest-version.mjs` after the bump.

`github.release` is disabled in `.release-it.json` — the tag workflow owns the GitHub Release (avoids duplicates).
