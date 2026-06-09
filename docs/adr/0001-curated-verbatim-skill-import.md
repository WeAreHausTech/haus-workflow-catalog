# ADR-0001: Curated verbatim skill import (superpowers)

- **Status:** Accepted | **Date:** 2026-06-09

## Context

We want 16 skills and 5 commands from [pcvelz/superpowers](https://github.com/pcvelz/superpowers)
(MIT) available as default curated catalog items. They are external, reviewed, and not
haus-owned.

Upstream skills use `description:` frontmatter instead of `## Use when` / `## Do not use when`.
Verbatim copies keep a clean diff path for future upstream syncs. Catalog validation
normally requires those sections in every `SKILL.md`.

## Decision

1. **Verbatim copy** under `skills/superpowers/<name>/` and `commands/superpowers/<name>.md`
   from snapshot SHA `bd000c6ec1df53449a74397f55305b22802b9a2b`, recorded once in
   `sources.yaml`. Items link via `originSourceId: superpowers-pcvelz`. No per-item
   `pinnedRef`.

2. **Section-requirement exemption** for `source: "curated"` items when the manifest carries
   both `whenToUse` and `whenNotToUse` (`validation-rules.json` →
   `skillSectionExemptSources: ["curated"]`). The when-signal moves to manifest metadata,
   not SKILL.md prose.

3. **Command validation and install** extended in both catalog `validate.mjs` and the CLI
   (`validate-catalog.ts`, `remote-catalog.ts`, `write-claude-files.ts`).

4. **Weekly upstream sync** via `scripts/sync-upstream.mjs` + `.github/workflows/upstream-sync.yml`.
   Deterministic rules; license change is a hard stop (no auto-PR).

5. **Dedupe:** remove four overlapping haus-owned items (code-reviewer, planner,
   test-reviewer agents; production-readiness-review skill) in favor of superpowers equivalents.

## Landing sequence (cross-repo)

Both repos must land in order:

1. **CLI PR** — hand-add `skillSectionExemptSources` to `library/catalog/validation-rules.json`,
   mirror validator + command install support, fix `sync-catalog-fixture` concurrency.
   Merge → **npm release**.
2. **Catalog PR** — items, verbatim copies, matching `validation-rules.json` key, local validator.
   Merge → `haus validate-catalog` CI passes on released CLI.
3. **Fixture sync** — catalog merge dispatches sync; CLI fixture already identical → no-op PR.
   `contract-drift` on CLI main green.

See also `haus-workflow/docs/adr/0001-validation-rules-single-source.md` (cross-reference).

## Consequences

- Curated skills ship without editing upstream SKILL.md structure.
- Manifest metadata is required for exemption — dropping `whenNotToUse` fails validation.
- Upstream updates are mechanical via sync script; re-licensing requires human review.
- Net catalog change: +21 −4 items (+17).
- Directory markdown walk skips `/superpowers/` paths to avoid false-positive `TODO`
  matches in upstream guidance prose (e.g. "todo list").
