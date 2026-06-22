# ADR-0005: `npx tsx`-only rule exempts curated (`source: curated`) content

- **Status:** Accepted | **Date:** 2026-06-22

> **Canonical policy** for non-`tsx` `npx` in shipped catalog markdown. Supersedes the
> type-based waiver in [ADR-0003](0003-npx-tsx-exemption-for-agents.md).

## Context

Shipped markdown must not contain `npx` invocations other than `npx tsx`, except where waived
below. The goal is to block **auto-installers** (`npx -y`, `dlx`), not to forbid AI-instruction
prose that names standard toolchain commands.

Verbatim curated content — agents (ADR-0002) and ECC skills (catalog cleanup P2c) — references
tools such as `npx playwright`, `npx prisma`, and `npx eslint`. Hand-editing synced files or
running a post-sync sanitizer causes permanent upstream drift on every `sync-upstream --apply`.

ADR-0003 briefly waived the ban for all `type: agent` items. That was redundant with
`source: curated` for today's agents and would have exempted future haus-authored agents — too
broad. The waiver needed to be **source-scoped**, not type-scoped.

## Decision

1. **Single waiver field** in `validation-rules.json` (ADR-0001 single source, both repos):

   ```json
   "npxTsxOnlyExemptSources": ["curated"]
   ```

   Do **not** ship `npxTsxOnlyExemptTypes`. Regression tests assert that key is **absent** from
   the canonical JSON.

2. **Exemption predicate** — `isNpxTsxOnlyExempt(_itemType, itemSource)` returns true only when
   `itemSource` is listed in `npxTsxOnlyExemptSources`. The type argument is retained for call-site
   stability but is not read.

3. **Risky-install patterns are NEVER exempt** — `npx -y`, `npx --yes`, `yarn dlx`, `pnpm dlx`
   stay blocked for every item type and source, including curated agents and skills.

4. **Catalog enforcement**
   - Per-item ingest-style checks: `validateCatalogItem` / `auditMarkdownLines` with
     `checkNonTsxNpx: !isNpxTsxOnlyExempt(type, source)`.
   - Repo-wide markdown walk (`auditMarkdownContent`): resolve `source` per file via longest
     `item.path` prefix match (`buildItemPathSourceMap` / `resolveMarkdownItemSource`) — **not**
     by top-level directory (`skills/` vs `agents/`).

5. **CLI enforcement** — same helper and JSON fixture (`library/catalog/validation-rules.json`);
   `validateCatalogItem` requires `item.source` for the waiver to apply at ingest.

6. **Scope of waiver** — applies to any shipped markdown under a curated manifest item (skills,
   agents, commands, templates). Haus-first-party items (`source: haus`) remain strict.

## Regression guards

- `tests/forbidden-content.test.mjs` — production content walk; pins
  `npxTsxOnlyExemptSources === ["curated"]` and `npxTsxOnlyExemptTypes` key absent.
- CLI `tests/ingest-catalog.test.js` and `tests/validate-catalog-regression.test.js` — curated
  skill/agent accepts non-`tsx` `npx`; `source: haus` skill/agent rejects it; risky-install
  still blocked for curated items.

## Consequences

- Verbatim ECC skills and all current agents validate and install without post-sync edits.
- Future `source: haus` agents or skills cannot ship non-`tsx` `npx` without a rule change.
- Waiver breadth is data-driven; widening beyond `["curated"]` requires an ADR update and test
  changes.

## Alternatives considered

- **Keep ADR-0003 type waiver alongside source waiver** — rejected: type gate is strictly broader.
- **Hand-edit synced files** — rejected: permanent upstream drift.
- **Post-sync sanitizer** — rejected: same drift on every sync.
- **Exempt all skills by type** — rejected: would waive haus-authored installers.
