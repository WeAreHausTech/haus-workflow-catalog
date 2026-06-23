# ADR-0007: Baseline skill/agent tiering

## Status

Accepted (2026-06-23)

## Context

Before this change every superpowers workflow skill (16) and five "always-on"
review/utility agents carried `default: true`, so they installed on every project
regardless of stack. Measured baseline context load was ~51k tokens before any
stack-specific item — most of it workflow skills a given task never used (skill
authoring, code-review request/receive, git-worktrees, subagent-driven development,
gate specification, TDD superpower, …) and agents that overlap stack-gated reviewers.

Near-duplicate clusters made the cost worse: `writing-skills` + `writing-plans`,
`specifying-gates` + `checking-gates`, `using-git-worktrees` +
`finishing-a-development-branch` + `executing-plans`, `subagent-driven-development` +
`dispatching-parallel-agents`, and the code-review request/receive pair. Each cluster
shipped both halves on every project.

## Decision

Keep a small **core baseline** `default: true`; tier everything else to opt-in
(`default: false` + a `role:*` `requiresAny` gate, surfaced via `optInEligible[]` —
see ADR-0006).

**Baseline `default: true` (10 items): 9 superpowers skills + the workflow-standard
template.** One member of each near-duplicate cluster wins the baseline slot; the
heavier/optional sibling is tiered:

- `superpowers-using-superpowers` — skill router (entry point)
- `superpowers-brainstorming`
- `superpowers-systematic-debugging`
- `superpowers-verification-before-completion`
- `superpowers-writing-plans` (cluster winner over `writing-skills`)
- `superpowers-checking-gates` (cluster winner over `specifying-gates`)
- `superpowers-dispatching-parallel-agents` (cluster winner over `subagent-driven-development`)
- `superpowers-executing-plans` (branch-workflow keep over `using-git-worktrees` / `finishing-a-development-branch`)
- `writing-documentation` (Haus org docs)
- `agentic-workflow-standard` (template)

**Tiered to opt-in (`default: false`):** the remaining superpowers skills
(`writing-skills`, `subagent-driven-development`, `specifying-gates`,
`receiving-code-review`, `requesting-code-review`, `using-git-worktrees`,
`finishing-a-development-branch`, `test-driven-development`) and the five formerly
always-on agents (`ecc-performance-optimizer`, `ecc-refactor-cleaner`,
`oh-my-claudecode-test-engineer`, `oh-my-claudecode-designer`,
`oh-my-claudecode-tracer`). They surface through the Claude Code opt-in flows
(`/haus-setup`, `project:add-skills`) or `haus recommend --include`.

## Consequences

- Baseline context drops from ~51k to ~12–15k tokens on every project (P3 + P2g-1).
- Tiered helpers are discoverable, not deleted — opt-in via the conversational flows
  documented in `haus-workflow/docs/runbook.md` (role → opt-in group map).
- Cluster winners chosen so the surviving baseline still covers plan → execute →
  verify → debug without the redundant sibling.
- Golden archetype + `recommend-eligibility` tests in `haus-workflow` lock the
  baseline set so an accidental `default: true` re-add fails CI.
