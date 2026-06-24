# Architecture Decision Records (ADRs)

Why we chose X — short, dated, write-once decision log for humans and agents.

| ADR                                                    | Title                                       | Why (one line)                                      | Status     |
| ------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------- | ---------- |
| [0001](0001-curated-verbatim-skill-import.md)          | Curated verbatim skill import (superpowers) | Verbatim superpowers copy + shared validation rules | Accepted   |
| [0002](0002-multi-source-upstream-sync-select-mode.md) | Multi-source upstream sync + `select` mode  | Per-source mirror vs select mode in `sources.yaml`  | Accepted   |
| [0003](0003-npx-tsx-exemption-for-agents.md)           | `npx tsx`-only rule exempts agent content   | Type-based npx waiver for agents (superseded)       | Superseded |
| [0004](0004-remove-catalog-item-type-rule.md)          | Remove unused `rule` catalog item type      | Drop unused `rule` type to match CLI runtime        | Accepted   |
| [0005](0005-npx-tsx-exemption-for-curated-skills.md)   | `npx tsx`-only rule exempts curated content | Source-scoped npx waiver for curated prose          | Accepted   |
| [0006](0006-requiresany-gate-audit.md)                 | `requiresAny` gate audit convention         | `requiresAny` clauses must match skill purpose      | Accepted   |
| [0007](0007-baseline-skill-tiering.md)                 | Baseline skill/agent tiering                | Ten-item default baseline to cut token load         | Accepted   |
| [0008](0008-adr-enforcement-model.md)                  | ADR enforcement model (haus product)        | Haus ships triggers, CLI, and CI gate for ADRs      | Accepted   |
