# Haus Workflow Catalog

> Internal Haus tool. Open-source but unsupported for external use. No external issues, PRs, or roadmap commitments accepted.

Catalog of skills, agents, and templates distributed by [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow).

## Catalog

52 items: 46 skills, 5 agents, 1 template. See `manifest.json` for the full list.

Compatible with `@haus-tech/haus-workflow >= 0.9.0`.

## Structure

```
manifest.json          — catalog item registry
skills/                — skill packages (SKILL.md + references/)
agents/                — agent definition files
templates/             — managed file templates (haus-way-of-work.md etc.)
scripts/               — validation scripts (validate.mjs, validation-rules.mjs)
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
  "items": [
    { "id": "haus.nextjs-patterns", "version": "1.0.0" },
    { "id": "haus.global-engineering-rules", "version": "1.0.0" }
  ]
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

`scripts/validate.mjs` imports rules from `scripts/validation-rules.mjs`. The CLI's `src/catalog/validation-rules.ts` mirrors these rules — when you change forbidden tags, banned phrases, or required sections in one place, update the other manually.

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

`manifest.json#version` tracks the catalog schema, not item content. Bump it only when the schema or structure changes.

### Releasing

1. Move `## [Unreleased]` entries to a new `## [X.Y.Z] - YYYY-MM-DD` section in `CHANGELOG.md`
2. Add a fresh empty `## [Unreleased]` section at the top
3. Push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
4. GitHub Actions validates the catalog, creates a GitHub Release, and attaches `manifest.json` as an artifact
