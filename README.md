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
Key fields: `id`, `type` (`skill`|`agent`), `source` (`haus`), `path`, `tags`, `requiresAny`.
