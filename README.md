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

Catalog is validated on every PR via a self-contained script (no external dependencies):

```bash
node scripts/validate.mjs
```

Once `@haus-tech/haus-workflow` is published (P9), CI will switch to:

```bash
npm install -g @haus-tech/haus-workflow
haus validate-catalog ./manifest.json
```

## Schema

Each item in `manifest.json` is a `CatalogItem` — see the type definition in the CLI repo.
Key fields: `id`, `version`, `type` (`skill`|`agent`), `source` (`haus`), `path`, `tags`, `requiresAny`.

## Versioning

Every catalog item carries a `version` field following semver (`X.Y.Z`). Bump rules:

| Change | Bump |
|--------|------|
| New guideline, extended scope | `MINOR` |
| Bug fix, wording correction | `PATCH` |
| Removed section, breaking scope change | `MAJOR` |

The top-level `manifest.json#version` tracks the catalog schema itself, not item content.

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
  haus.typescript6-patterns  1.0.0 → 1.0.1
Run `haus update --apply` to upgrade.
```
