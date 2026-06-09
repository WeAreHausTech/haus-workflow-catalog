@.claude/WORKFLOW.md
@.claude/workflow-config.md

# haus-workflow-catalog

Content catalog for `@haus-tech/haus-workflow`. Consumed at runtime by the CLI — not bundled into the npm package.

## Repo structure

```
manifest.json          — catalog item registry (source of truth)
validation-rules.json  — canonical validation rules (ADR-0001)
sources.yaml           — curated upstream snapshots
skills/
  haus-owned/          — first-party skills
  superpowers/         — verbatim curated skills (do not hand-edit)
agents/                — agent definition files (.md)
commands/superpowers/  — verbatim curated slash commands
templates/             — managed file templates
scripts/               — validate.mjs, sync-upstream.mjs, validation-rules.mjs
schema/                — JSON schemas for manifest and catalog items
```

## Key rules

**Manifest and item versions are independent.** Bump `manifest.json` top-level `version` on every release. Bump individual item `version` in `manifest.json` whenever any file under that item's `path` changes — CI will catch missed bumps on PRs.

**Before release:** `manifest.json` top-level `version` must match the git tag (e.g. tag `v2.0.2` → version `"2.0.2"`). `scripts/check-manifest-version.mjs` enforces this.

**Validation rules have one source.** `validation-rules.json` (repo root) is canonical.
`scripts/validation-rules.mjs` is a thin loader; the haus-workflow CLI consumes the
same JSON as a synced fixture (ADR-0001). Edit the JSON, never the loader. A push to
`main` that touches `manifest.json` or `validation-rules.json` dispatches fixture sync.

**Catalog size:** manifest **2.5.0**, **71 items** (61 skills, 2 agents, 3 templates,
5 commands) — 50 `haus` + 21 `curated` superpowers.

## Adding a new item

1. Create the file(s) under `skills/haus-owned/`, `agents/`, `templates/`, or `commands/`.
2. **Skills** need `SKILL.md` with YAML frontmatter including non-empty `description:`.
   Optional `## Use when` / `## Do not use when` prose is fine but not required.
3. **Agents** need `## Use when`, `## Do not use when`, and `## Verification`. No banned
   phrases: `autonomous`, `swarm`, `delegate`, `orchestrat`, `marketplace`.
4. **Commands** need a `.md` file with frontmatter `description:`.
5. Add the item entry to `manifest.json`. Set `version: "1.0.0"`.
6. Safety rules (all markdown): no risky install patterns; only `npx tsx` allowed; all
   URLs `https://`; no forbidden stack tags in item id/tags.
7. TODO/placeholder checks apply to shipped **template/command** files, not skill prose.
8. Do not hand-edit `skills/superpowers/` or `commands/superpowers/` — sync from upstream.

## Validation

```bash
yarn validate                        # full local check
node scripts/validate.mjs            # same, explicit
haus validate-catalog ./manifest.json  # via CLI
```

CI runs both on every push and PR. Item version check runs on PRs only.

## Release process

1. Merge to `main` with conventional commits (`feat:`, `fix:`, …).
2. `yarn release` (or `yarn release:dry`, or `yarn release 2.1.1`). Uses release-it + conventional-changelog; syncs `manifest.json#version` via hooks.
3. Tag push triggers release CI → GitHub Release + `manifest.json` artifact.

## How consumers get updates

`haus install` / `haus update` fetches live from this repo at the ref specified by `HAUS_CATALOG_REF` (default: `main`). Changes to `main` are available to consumers immediately — no CLI release needed.

<!-- rtk-instructions v2 -->

# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)

```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)

```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)

```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)

```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)

```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)

```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)

```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)

```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)

```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands

```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

<!-- /rtk-instructions -->
