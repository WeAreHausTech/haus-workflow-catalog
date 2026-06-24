# ADR-0008: ADR enforcement model

- **Status:** Accepted | **Date:** 2026-06-24

## Context

Consumer projects need traceable "why" for significant choices, including when non-technical builders use AI. Voluntary ADR guidance in WORKFLOW.md did not produce consistent records. Haus already ships workflow standards via catalog templates.

## Decision

Ship ADR enforcement as haus product:

- Storage: `docs/decisions/` everywhere (ADR in document titles)
- Triggers: `decisions-triggers.json` (synced catalog → CLI)
- CLI: `haus decisions check|suggest|next-number|validate` (`haus adr` alias)
- Layers: Stop hook (soft draft), CI gate (hard block on decision-worthy PR diffs)
- Skill: `haus.adr-decisions` for agent workflow

## Motivation (why)

Deterministic path triggers are testable and cheap; LLM classifiers add cost and flake. Machine-drafted ADRs with human approval match the non-technical user goal. CI hard gate matches org policy floor; Stop hook reduces surprise failures.

## Alternatives considered

- **Docs-only convention** — rejected; no enforcement.
- **LLM diff classifier** — deferred; tune heuristics first.
- **Keep `docs/adr/` path** — rejected; `docs/decisions/` clearer for non-technical users.

## Consequences

- Catalog and CLI must keep `decisions-triggers.json` in sync (ADR-0001 pattern).
- Client repos add `decisions-gate` CI job from shipped template.
- Legacy `docs/adr/` supported read-only until migrated.
