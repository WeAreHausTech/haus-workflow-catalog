# haus-workflow-catalog

Content catalog for `@haus-tech/haus-workflow`. Provides skills, agents, templates, slash commands, and project-root configs (ESLint, Prettier) that the CLI fetches at runtime and installs into consuming projects.

## Agent Context Guide

- Use this file as the documentation index; open detail docs only when needed.
- Start with **CLAUDE.md** for setup, commands, conventions, and pre-PR checks.
- Route by task (load one primary topic, not every file):
  - **Make a code change / add an item** → Development workflow
  - **Release / deploy** → Deployment
  - **Security / content policy** → [security.md](security.md)
  - **Understand a past decision** → ADRs in `docs/decisions/`
  - **Fix a recurring failure** → `docs/runbook.md`
- Prefer path references over duplicating source; read code for implementation detail.
- If docs conflict with code or user intent, ask before making broad changes.

## Development workflow

| File                                                                                           | Description                                                      |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [development-workflow.md](development-workflow.md)                                             | Change routing, quality checks, upstream sync, workflow-doc sync |
| [plans/2026-06-17-catalog-upgrade-execution.md](plans/2026-06-17-catalog-upgrade-execution.md) | Multi-wave catalog upgrade progress log (living)                 |

## Deployment

| File                           | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| [deployment.md](deployment.md) | CI pipelines, release steps, fixture sync to CLI repo |

## Decision log

| File                                                                                                                 | Description                                     |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [decisions/README.md](decisions/README.md)                                                                           | ADR index                                       |
| [decisions/0001-curated-verbatim-skill-import.md](decisions/0001-curated-verbatim-skill-import.md)                   | Curated items copied verbatim; validation split |
| [decisions/0002-multi-source-upstream-sync-select-mode.md](decisions/0002-multi-source-upstream-sync-select-mode.md) | Multi-source upstream sync design               |
| [decisions/0003-npx-tsx-exemption-for-agents.md](decisions/0003-npx-tsx-exemption-for-agents.md)                     | npx tsx exemption by agent type (superseded)    |
| [decisions/0004-remove-catalog-item-type-rule.md](decisions/0004-remove-catalog-item-type-rule.md)                   | Remove unused `rule` catalog item type          |
| [decisions/0005-npx-tsx-exemption-for-curated-skills.md](decisions/0005-npx-tsx-exemption-for-curated-skills.md)     | npx tsx exemption for curated content (current) |
| [decisions/0006-requiresany-gate-audit.md](decisions/0006-requiresany-gate-audit.md)                                 | requiresAny gate audit convention               |
| [decisions/0007-baseline-skill-tiering.md](decisions/0007-baseline-skill-tiering.md)                                 | Baseline skill/agent tiering                    |
| [decisions/0008-adr-enforcement-model.md](decisions/0008-adr-enforcement-model.md)                                   | ADR enforcement model (haus product)            |

## Security

| File                       | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| [security.md](security.md) | Content supply-chain policy, validation rules, upstream trust |

## Runbook

| File                     | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| [runbook.md](runbook.md) | Validation rule changes, upstream drift, fixture sync |
