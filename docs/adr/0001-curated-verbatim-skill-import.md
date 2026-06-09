# ADR-0001: Curated verbatim skill import (superpowers)

- **Status:** Accepted | **Date:** 2026-06-09

## Context

We want 16 skills and 5 commands from [pcvelz/superpowers](https://github.com/pcvelz/superpowers)
(MIT) available as default curated catalog items. They are external, reviewed, and not
haus-owned.

Upstream skills use `description:` frontmatter instead of `## Use when` / `## Do not use when`.
Verbatim copies keep a clean diff path for future upstream syncs.

## Decision

1. **Verbatim copy** under `skills/superpowers/<name>/` and `commands/superpowers/<name>.md`
   from snapshot SHA `bd000c6ec1df53449a74397f55305b22802b9a2b`, recorded once in
   `sources.yaml`. Items link via `originSourceId: superpowers-pcvelz`. No per-item
   `pinnedRef`.

2. **Skill when-signal is frontmatter `description:`** for every skill (haus-owned and
   curated alike): `validation-rules.json` → `requiredSkillFrontmatter: ["description"]`.
   This is the superpowers convention and is sufficient on its own, so there is no
   curated-specific section exemption (the earlier `skillSectionExemptSources` workaround
   was removed). Skills MAY still keep `## Use when` / `## Do not use when` as prose, but
   the headers are not required. Manifest `whenToUse` / `whenNotToUse` remain for the
   recommender.

3. **Command validation and install** extended in both catalog `validate.mjs` and the CLI
   (`validate-catalog.ts`, `remote-catalog.ts`, `write-claude-files.ts`).

4. **Weekly upstream sync** via `scripts/sync-upstream.mjs` + `.github/workflows/upstream-sync.yml`.
   Deterministic rules; license change is a hard stop (no auto-PR).

5. **Dedupe:** remove four overlapping haus-owned items (code-reviewer, planner,
   test-reviewer agents; production-readiness-review skill) in favor of superpowers equivalents.

## Landing sequence (cross-repo)

Both repos must land in order:

1. **CLI PR** — update validator logic + `library/catalog/validation-rules.json`
   (`requiredSkillFrontmatter`), command install support, `sync-catalog-fixture` fix.
   Merge → **npm release**.
2. **Catalog PR** — items, verbatim copies, matching `validation-rules.json`, local validator.
   Merge → `haus validate-catalog` CI passes on released CLI.
3. **Fixture sync** — catalog merge dispatches sync; CLI fixture already identical → no-op PR.
   `contract-drift` on CLI main green.

See also `haus-workflow/docs/adr/0001-validation-rules-single-source.md` (cross-reference).

## Validation rules: authoring vs safety

Rules are split by intent. **Authoring/style** rules are relaxed to the superpowers
convention; **safety/governance** rules apply to all content (haus and curated):

- Authoring: skill when-signal is frontmatter `description:` (no required section headers);
  the TODO/placeholder scan is an authoring guard enforced **per shipped template/command
  item only**, not in the repo-wide markdown walk (it false-positives on legitimate prose
  such as "scan for TODOs" and CSS `.placeholder`).
- Safety: forbidden stack tags, risky install patterns (`npx -y`, `dlx`), `npx tsx`-only
  allowlist, `http://` URL ban, and the `source: curated` + `reviewStatus: approved` gate —
  all unchanged and applied repo-wide.

Because the placeholder scan no longer runs in the walk, the prior `/superpowers/` walk
skip and the CLI `isVerbatimSuperpowersMarkdownPath()` helper were removed; no path-based
special-casing of curated content remains.

## Consequences

- Curated skills ship verbatim; their `description:` frontmatter satisfies validation.
- Haus-owned skills already carry `description:` frontmatter, so no migration was needed.
- Upstream updates are mechanical via sync script; re-licensing requires human review.
- Net catalog change: +21 −4 items (+17).
- CodeQL excludes `skills/superpowers/` (`.github/codeql/codeql-config.yml`) — verbatim
  upstream includes local-dev scripts not authored by haus.
- **Exception:** `brainstorming/scripts/helper.js` — haus patch 1.0.1 replaces `innerHTML`
  with safe DOM APIs (CodeQL XSS). Upstream sync may reintroduce; re-patch or wait for
  upstream fix.
