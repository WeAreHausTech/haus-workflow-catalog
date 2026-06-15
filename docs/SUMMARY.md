# haus-workflow-catalog

Content catalog for `@haus-tech/haus-workflow`. Provides skills, agents, templates, and slash commands that the CLI fetches at runtime and installs into consuming projects.

## Agent Context Guide

- Use this file as the documentation index; open detail docs only when needed.
- Start with **CLAUDE.md** for setup, commands, conventions, and pre-PR checks.
- Route by task (load one primary topic, not every file):
  - **Make a code change / add an item** → Development workflow
  - **Release / deploy** → Deployment
  - **Understand a past decision** → ADRs in `docs/adr/`
  - **Fix a recurring failure** → `docs/runbook.md`
- Prefer path references over duplicating source; read code for implementation detail.
- If docs conflict with code or user intent, ask before making broad changes.

## Development workflow

| File                                               | Description                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| [development-workflow.md](development-workflow.md) | Change routing, quality checks, upstream sync, workflow-doc sync |

## Deployment

| File                           | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| [deployment.md](deployment.md) | CI pipelines, release steps, fixture sync to CLI repo |

## Decision log

| File                                                                                                     | Description                                     |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [adr/README.md](adr/README.md)                                                                           | ADR index                                       |
| [adr/0001-curated-verbatim-skill-import.md](adr/0001-curated-verbatim-skill-import.md)                   | Curated items copied verbatim; validation split |
| [adr/0002-multi-source-upstream-sync-select-mode.md](adr/0002-multi-source-upstream-sync-select-mode.md) | Multi-source upstream sync design               |
| [adr/0003-npx-tsx-exemption-for-agents.md](adr/0003-npx-tsx-exemption-for-agents.md)                     | npx tsx exemption for agent items               |

## Runbook

| File                     | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| [runbook.md](runbook.md) | Validation rule changes, upstream drift, fixture sync |
