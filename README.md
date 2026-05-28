# haus-workflow-catalog

> Internal Haus tool. Open-source but unsupported for external use. No external issues, PRs, or roadmap commitments accepted.

Catalog of skills, agents, and templates distributed by [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow).

## Structure

```
manifest.json          — catalog item registry
skills/                — skill packages (SKILL.md + references/)
agents/                — agent definition files
templates/             — managed file templates (haus-way-of-work.md etc.)
```

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

Key fields: `id`, `version`, `type` (`skill`|`agent`|`template`), `source` (`haus`), `path`, `tags`, `requiresAny`, `ecosystem`.

## Versioning

Every catalog item carries a `version` field following semver (`X.Y.Z`). Bump rules:

| Change | Bump |
|--------|------|
| New guideline, extended scope | `MINOR` |
| Bug fix, wording correction | `PATCH` |
| Removed section, breaking scope change | `MAJOR` |

The top-level `manifest.json#version` tracks the catalog schema itself, not item content.

## Contributing

### Bumping a skill or agent version

When you change a skill's content (`SKILL.md` or any `references/` file), or an agent's `.md` file:

1. **Bump the item's `version`** in `manifest.json`:

   | Change | Bump |
   |--------|------|
   | New guideline, extended scope, new reference file | `MINOR` (x.1.x) |
   | Wording fix, typo, reordering | `PATCH` (x.x.1) |
   | Removed section, breaking scope change, renamed skill | `MAJOR` (1.x.x) |

2. **Add entry to `CHANGELOG.md`** under `## [Unreleased]`:
   ```markdown
   ### Changed
   - **nextjs-patterns** `1.0.0 → 1.1.0`: Added RSC caching patterns to workflow.md
   ```

3. PRs without a CHANGELOG entry for bumped items will be flagged by the validator.

### Releasing

1. Move `## [Unreleased]` entries to a new `## [X.Y.Z] - YYYY-MM-DD` section
2. Add a fresh empty `## [Unreleased]` section at the top
3. Push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
4. GitHub Actions validates, creates GitHub Release, attaches `manifest.json` artifact

### Lock file

When `haus install` runs it writes `.haus-catalog.lock` in the project root:

```json
{
  "catalog": "https://github.com/WeAreHausTech/haus-workflow-catalog",
  "lockedAt": "2026-05-27T00:00:00Z",
  "items": [
    { "id": "haus.global-engineering-rules", "version": "1.0.0" },
    { "id": "haus.nextjs-patterns", "version": "1.0.0" }
  ]
}
```

`haus update` fetches the latest `manifest.json`, compares each installed item's `version` against the lock, and reports outdated items:

```
3 items out of date:
  haus.nextjs-patterns       1.0.0 → 1.1.0
  haus.react19-patterns      1.0.0 → 1.1.0
  haus.typescript5-patterns  1.0.0 → 1.0.1
Run `haus update --apply` to upgrade.
```
