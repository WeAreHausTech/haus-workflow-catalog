# Memory conventions

> How to keep durable, cross-session learnings for this project. haus does **not** ship
> its own memory store — it relies on Claude Code's native memory, which already handles
> loading, size limits, and persistence.

## Where memory lives

Native memory is per-project, at:

```
~/.claude/projects/<project>/memory/MEMORY.md
```

Claude Code auto-loads roughly the first ~200 lines / ~25 KB of `MEMORY.md` into every
session for that project — no command, no hook. To keep memory **inside the repo**
instead (so it's versioned with the code), set `autoMemoryDirectory` in
`.claude/settings.json` to a path under the project.

## What goes in memory

Memory is for what was **learned** — not rules, not decisions, not failure fixes. Each of
those has its own home (see WORKFLOW.md → "Where facts live"):

| Put here (MEMORY.md)                          | Put elsewhere                                 |
| --------------------------------------------- | --------------------------------------------- |
| Build/tooling quirks discovered the hard way  | Stable rules → `CLAUDE.md` / `AGENTS.md`      |
| Debugging insights, non-obvious root causes   | Failure + exact fix → `docs/runbook.md`       |
| Patterns that worked / approaches that didn't | Architectural decisions → `docs/adr/`         |
| Gotchas, surprising constraints               | Project commands/paths → `workflow-config.md` |

Suggested `MEMORY.md` headings: `## Build quirks`, `## Debug insights`, `## Patterns`,
`## Gotchas`. Keep entries short and dated; prune aggressively.

## Maintenance

`MEMORY.md` accumulates without manual edits, so it drifts: duplicates, stale facts, a
bloated index. Periodically run the **`anthropic-skills:consolidate-memory`** skill — it
merges duplicates, fixes stale facts, and prunes the index in one reflective pass. Do this
when memory grows past a screen or two, or after a big chunk of work.

## Why haus has no memory command

A thin in-repo markdown store plus a `slice()` injector duplicated — worse — what native
memory does for free. haus removed it; use the native path above.
