# ADR-0003: `npx tsx`-only rule exempts agent content

- **Status:** Superseded by [ADR-0005](0005-npx-tsx-exemption-for-curated-skills.md) | **Date:** 2026-06-15 | **Superseded:** 2026-06-22

> **Historical record only.** The type-based waiver (`npxTsxOnlyExemptTypes: ["agent"]`) was
> shipped in June 2026 and **removed** the same month. Current policy is **source-based** —
> see ADR-0005. Do not reintroduce `npxTsxOnlyExemptTypes` without a new ADR.

## Context (June 2026)

The catalog's safety rules (ADR-0001) include an `npx tsx`-only allowlist: shipped markdown may
not contain any `npx` invocation other than `npx tsx`. It is enforced repo-wide by
`validate.mjs` and, at install time, by the CLI (`ingest-catalog.ts` → `remote-catalog.ts`),
reading the synced `validation-rules.json` fixture (ADR-0001 single-source).

The rule's intent is to stop the catalog from shipping **executable installers** (templates,
commands the CLI runs) that auto-fetch arbitrary npx packages. The genuinely dangerous patterns
are the _risky-install_ set (`npx -y`, `npx --yes`, `yarn dlx`, `pnpm dlx`) — auto-confirming
execution of an arbitrary package.

The curated agents added in ADR-0002 are **AI-instruction prose**, not installers. They
legitimately name tools for the agent to run — `npx playwright`, `npx eslint`, `npx knip`,
`npx lighthouse`. Under the blanket rule, several agents failed catalog validation **and were
silently skipped by `haus setup`** (rejected at ingest, never written). None contained a
risky-install pattern. Editing the verbatim files to remove the npx lines would break the
byte-identical upstream sync (permanent drift) and change upstream meaning.

## Decision (historical — superseded)

At the time, we chose to scope the waiver by **item type**:

1. Add `npxTsxOnlyExemptTypes: ["agent"]` to `validation-rules.json`.
2. Keep risky-install patterns blocked for every type, agents included.
3. Teach catalog + CLI validators to skip the non-`tsx` npx check when the item type (or
   shipped directory type) was in that list.

That unblocked curated agents but also would have exempted any future `source: haus` agent —
broader than needed once verbatim ECC **skills** needed the same treatment.

## Why superseded

ADR-0005 replaced the type gate with `npxTsxOnlyExemptSources: ["curated"]`. All shipped agents
today are curated and remain covered; haus-first-party agents stay strict. The field
`npxTsxOnlyExemptTypes` was removed from `validation-rules.json`.

## Alternatives considered (historical)

- **Ship only agents without npx references** — rejected: dropped high-value reviewers.
- **Hand-edit files to drop npx** — rejected: breaks verbatim sync.
- **Hardcode `type === 'agent'` in validators** — rejected: rule logic belongs in the synced JSON.
