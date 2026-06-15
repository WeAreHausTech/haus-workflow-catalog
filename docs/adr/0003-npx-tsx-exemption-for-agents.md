# ADR-0003: `npx tsx`-only rule exempts agent content

- **Status:** Accepted | **Date:** 2026-06-15

## Context

The catalog's safety rules (ADR-0001) include an `npx tsx`-only allowlist: shipped markdown may
not contain any `npx` invocation other than `npx tsx`. It is enforced repo-wide by
`validate.mjs` (`checkShippedMarkdown`) and, critically, **at install time by the CLI**
(`ingest-catalog.ts` → `remote-catalog.ts`), reading the synced `validation-rules.json` fixture
(ADR-0001 single-source).

The rule's intent is to stop the catalog from shipping **executable installers** (templates,
commands the CLI runs) that auto-fetch arbitrary npx packages. The genuinely dangerous patterns
are the _risky-install_ set (`npx -y`, `npx --yes`, `yarn dlx`, `pnpm dlx`) — auto-confirming
execution of an arbitrary package.

The curated agents added in ADR-0002 are **AI-instruction prose**, not installers. They
legitimately name tools for the agent to run — `npx playwright`, `npx eslint`, `npx knip`,
`npx lighthouse`. Under the blanket rule, 5 of the 11 agents fail catalog validation **and are
silently skipped by `haus setup`** (rejected at ingest, never written). None of them contain a
risky-install pattern. Editing the verbatim files to remove the npx lines would break the
byte-identical upstream sync (permanent drift) and change upstream meaning.

## Decision

1. **Scope the `npx tsx`-only rule by item type via a typed field** in `validation-rules.json`:
   `npxTsxOnlyExemptTypes: ["agent"]` (single source, both repos read it).

2. **Risky-install patterns are NEVER exempt.** `npx -y` / `--yes` / `dlx` stay blocked for
   every type, agents included. Only the broader "any non-`tsx` npx" check is waived, and only
   for exempt types.

3. **Catalog enforcement** — `auditMarkdownLines` gains a `checkNonTsxNpx` flag (risky-install
   and placeholder checks unchanged); `checkShippedMarkdown` maps each shipped dir to its item
   type and disables the non-tsx-npx check for exempt types. The per-item agent audit already
   never ran the npx check.

4. **CLI enforcement** — `validateCatalogItem` (and the `validate-catalog` command's
   `auditMarkdownContent`) honor `npxTsxOnlyExemptTypes` against the item/file type, reading the
   field from the synced `validation-rules.json` fixture.

## Landing sequence (cross-repo)

`validation-rules.json` is the single source (ADR-0001) but the **logic** that reads the new
field lives in both validators, so both repos must change:

1. **CLI PR** — teach `ingest-catalog.ts` / `validate-catalog.ts` to read
   `npxTsxOnlyExemptTypes` and skip the non-tsx-npx check for exempt item types; update the
   bundled `library/catalog/validation-rules.json` fixture. Merge → npm release.
2. **Catalog PR** — `validation-rules.json` field, `validate.mjs` + `forbidden-content.mjs`
   logic, the agents themselves, tests. Merge.
3. **Fixture sync** — catalog merge dispatches `sync-catalog-fixture`; fixture already
   identical → no-op.

Until the CLI PR releases, `haus setup` on the released CLI will skip the 5 npx-containing
agents (rejected at ingest) while installing the other 6 and all skills/commands. Catalog CI
(`yarn validate`) goes green immediately on the catalog PR.

## Consequences

- All 11 agents validate and install. Risky auto-install remains blocked everywhere.
- The waiver is data-driven and narrow (`["agent"]`); a regression test asserts it stays
  exactly `["agent"]` so it cannot silently broaden.
- Catalog and CLI validators must read the same field — covered by the fixture-sync contract.

## Alternatives considered

- **Ship only the 6 clean agents** — rejected: drops the React reviewer, build resolver, e2e
  runner, perf optimizer, and refactor cleaner (the highest-value reviewers).
- **Hand-edit the 5 files to drop npx** — rejected: breaks verbatim sync (permanent drift),
  alters upstream guidance.
- **Hardcode `type === 'agent'` in both validators** — rejected: rule logic would live in code,
  not the synced single source; the typed field keeps both repos in lockstep.
