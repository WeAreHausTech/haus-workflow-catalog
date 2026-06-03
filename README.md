# Haus Workflow Catalog

> Internal Haus tool. Open-source but unsupported for external use. No external issues, PRs, or roadmap commitments accepted.

Catalog of skills, agents, and templates distributed by [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow).

## Catalog

53 items: 45 skills, 5 agents, 3 templates (agentic-workflow-standard,
memory-conventions, lefthook-security). See `manifest.json` for the full list.

Compatible with `@haus-tech/haus-workflow >= 0.9.0`.

## Structure

```
manifest.json          — catalog item registry
validation-rules.json  — canonical validation rules (forbidden tags, banned phrases,
                         required sections, install patterns, stack allowlist)
skills/                — skill packages (SKILL.md + references/)
agents/                — agent definition files
templates/             — managed file templates (agentic-workflow-standard.md etc.)
scripts/               — validation scripts (validate.mjs + validation-rules.mjs loader)
lefthook.yml           — local pre-commit hook (validate + format + lint)
CHANGELOG.md           — release history
```

## How it works

This catalog is the **source of truth** for skill, agent, and template content. The [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow) CLI consumes it at runtime — it never bundles catalog items directly.

```
haus-workflow-catalog          @haus-tech/haus-workflow CLI         consuming project
─────────────────────          ────────────────────────────         ────────────────
manifest.json  ──── fetch ──▶  haus install / haus update  ──▶  .haus-catalog.lock
skills/        ──── fetch ──▶  copies skill files into           skills installed
agents/        ──── fetch ──▶  .claude/agents/ etc.
```

### Install flow

`haus install` scans the project, matches items via `requiresAny` (stack tokens, repo roles, intents), fetches matched items from this repo at the locked ref, and writes `.haus-catalog.lock`:

```json
{
  "catalog": "https://github.com/WeAreHausTech/haus-workflow-catalog",
  "lockedAt": "2026-05-28T00:00:00Z",
  "items": [{ "id": "haus.nextjs-patterns", "version": "1.0.0" }]
}
```

### Update flow

`haus update` fetches the latest `manifest.json`, compares each installed item's `version` against the lock, and reports outdated items:

```
3 items out of date:
  haus.nextjs-patterns       1.0.0 → 1.1.0
  haus.react19-patterns      1.0.0 → 1.1.0
  haus.typescript5-patterns  1.0.0 → 1.0.1
Run `haus update --apply` to upgrade.
```

### Validation rule sync

`validation-rules.json` (repo root) is the **single source of truth** for forbidden
tags, banned phrases, required sections, install patterns, and the stack allowlist.
`scripts/validation-rules.mjs` is a thin loader of that JSON, and the CLI consumes the
same file as a synced fixture (`library/catalog/validation-rules.json`) — a push to
`main` dispatches the sync. Edit the JSON, never the loader. No more manual two-language
mirroring. (Rationale: ADR-0001 in the [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow/blob/main/docs/adr/0001-validation-rules-single-source.md)
repo, which owns the decision log.)

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
| `type`                       | `skill` \| `agent` \| `template`                                   |
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

### Bumping a skill or agent

When you change `SKILL.md`, any `references/` file, or an agent `.md`:

1. Bump the item's `version` in `manifest.json`:

   | Change                                                | Bump            |
   | ----------------------------------------------------- | --------------- |
   | New guideline, extended scope, new reference file     | `MINOR` (x.1.x) |
   | Wording fix, typo, reordering                         | `PATCH` (x.x.1) |
   | Removed section, breaking scope change, renamed skill | `MAJOR` (1.x.x) |

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
