# Catalog runbook

## Validation rules change (cross-repo)

When changing `validation-rules.json`, follow ADR-0001 landing order:

1. Land CLI validator logic + synced fixture in `haus-workflow` → npm release.
2. Land matching canonical JSON + `scripts/validate.mjs` changes here → merge.
3. Fixture-sync workflow reconciles copies; `contract-drift` on CLI `main` must pass.

Key rules today:

- Manifest `references[]`: `https://` URLs only (no relative paths — bundled files under
  `item.path` are installed via haus-workflow full-tree cache).
- Vendor `llms.txt` feeds: attach via manifest `references[]` only — never sync or copy into
  the catalog tree (`sync-upstream.mjs` does not handle llms feeds).
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
`workflow_dispatch`. It runs `node scripts/sync-upstream.mjs --apply`, then `yarn format`
(repo plumbing only — `skills/`, `commands/`, and `agents/` are in `.prettierignore`), then
`yarn validate`, then opens/updates PR `chore/upstream-superpowers-sync`.

**Reviewer workflow:** read the PR summary, sanity-check the diff, merge. No manual edits
required unless the license gate failed (job red, no PR — legal review needed).

### Apply locally (maintainers)

```bash
node scripts/sync-upstream.mjs --apply
yarn validate
```

Commit changes + open a normal PR if not using the workflow.

### Deterministic rules (`--apply`)

| Situation                   | Action                                                       |
| --------------------------- | ------------------------------------------------------------ |
| Upstream license ≠ MIT      | Fail job, no PR, open tracking issue                         |
| Drifted file (still MIT)    | Re-copy verbatim, PATCH-bump item version                    |
| Changed `description:`      | Update manifest `purpose` + `whenToUse`; keep `whenNotToUse` |
| New upstream skill/command  | Auto-register with generic defaults                          |
| Deleted upstream item       | Remove manifest entry + delete local files                   |
| `skills/shared` support dir | Re-copy verbatim (not a manifest item; referenced by skills) |

After apply: `sources.yaml` `snapshotRef` → upstream HEAD, `retrieved` → today.

### Fixture sync to CLI

Pushes to `main` that touch `manifest.json` or `validation-rules.json` dispatch
`sync-catalog-fixture` in `haus-workflow`. See ADR-0001 for landing order with CLI releases.

## Curated sync PR review checklist

Curated sync PRs (opened by the `upstream-sync` workflow, branch
`chore/upstream-superpowers-sync`, or any manually-triggered `--apply` run) bypass
the automated npx guard. The exemption is declared in `validation-rules.json`
as `npxTsxOnlyExemptSources: ["curated"]` (loaded via `scripts/validation-rules.mjs`),
which skips the repo-wide npx allowlist check for curated content.

**Consequence:** a new `npx <dangerous-command>` invocation can enter the catalog
through a curated sync without triggering any CI failure.

**Reviewer MUST do manually on every curated sync PR:**

1. Open the PR diff and search (`Ctrl+F` / GitHub search box) for `npx` in added lines.
2. Confirm every new `npx` call matches the only approved pattern: `npx tsx`.
3. If any other `npx <anything>` appears in added content, block the merge, remove
   the offending file from the sync, and open a tracking issue against the upstream source.

This check cannot be automated away without removing the exemption, so it is a
required manual step for every curated sync review.
