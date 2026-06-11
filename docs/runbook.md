# Catalog runbook

## Validation rules change (cross-repo)

When changing `validation-rules.json`, follow ADR-0001 landing order:

1. Land CLI validator logic + synced fixture in `haus-workflow` → npm release.
2. Land matching canonical JSON + `scripts/validate.mjs` changes here → merge.
3. Fixture-sync workflow reconciles copies; `contract-drift` on CLI `main` must pass.

Key rules today:

- Skills: non-empty frontmatter `description:` (`requiredSkillFrontmatter`).
- Agents: YAML frontmatter `description:` (same as skills).
- Repo-wide walk: safety only (install patterns, npx allowlist, forbidden stacks in
  `description:` / `## Use when` prose). No TODO/placeholder scan in the walk.
- Per-item template/command audit: still enforces TODO/placeholder.

## Upstream superpowers drift

Curated superpowers items sync from [pcvelz/superpowers](https://github.com/pcvelz/superpowers).
Provenance: `sources.yaml` → `superpowers-pcvelz.snapshotRef`.

### Local check

```bash
node scripts/sync-upstream.mjs --check
```

Exit 0 = no drift. Exit 1 = drifted/new/removed items printed with diffstat.

### Automated sync

`.github/workflows/upstream-sync.yml` runs weekly (Monday 06:00 UTC) and on
`workflow_dispatch`. It runs `node scripts/sync-upstream.mjs --apply`, then `yarn validate`,
then opens/updates PR `chore/upstream-superpowers-sync`.

**Reviewer workflow:** read the PR summary, sanity-check the diff, merge. No manual edits
required unless the license gate failed (job red, no PR — legal review needed).

### Apply locally (maintainers)

```bash
node scripts/sync-upstream.mjs --apply
yarn validate
```

Commit changes + open a normal PR if not using the workflow.

### Deterministic rules (`--apply`)

| Situation                  | Action                                                       |
| -------------------------- | ------------------------------------------------------------ |
| Upstream license ≠ MIT     | Fail job, no PR, open tracking issue                         |
| Drifted file (still MIT)   | Re-copy verbatim, PATCH-bump item version                    |
| Changed `description:`     | Update manifest `purpose` + `whenToUse`; keep `whenNotToUse` |
| New upstream skill/command | Auto-register with generic defaults                          |
| Deleted upstream item      | Remove manifest entry + delete local files                   |

After apply: `sources.yaml` `snapshotRef` → upstream HEAD, `retrieved` → today.

### Fixture sync to CLI

Pushes to `main` that touch `manifest.json` or `validation-rules.json` dispatch
`sync-catalog-fixture` in `haus-workflow`. See ADR-0001 for landing order with CLI releases.
