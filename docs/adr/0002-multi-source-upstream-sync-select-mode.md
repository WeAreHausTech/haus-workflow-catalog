# ADR-0002: Multi-source upstream sync + `select` mode

- **Status:** Accepted | **Date:** 2026-06-15

## Context

ADR-0001 added a single curated upstream source (pcvelz/superpowers) synced as a
full-directory mirror by `scripts/sync-upstream.mjs`. We now want to ship 11 reviewer/utility
**agents** from two further MIT upstreams — [affaan-m/ECC](https://github.com/affaan-m/ECC)
and [yeachan-heo/oh-my-claudecode](https://github.com/yeachan-heo/oh-my-claudecode) — and keep
them current the same mechanical way.

These upstreams hold many agents we do **not** want. A full mirror would auto-pull every
upstream agent and every future addition. We need to sync only an explicit allowlist, and one
agent (`refactor-cleaner`) lives outside the conventional `agents/` directory (`.kiro/agents/`),
so the sync cannot assume a fixed upstream path.

The previous `sources.yaml` parser was regex/line-walk and scalar-only — it could not read a
nested `items:` list of multi-key flow maps.

## Decision

1. **Per-source `mode` in `sources.yaml`.** Every source declares `mode` explicitly; an absent
   `mode` falls back to `mirror` (the safe default).
   - `mirror` — existing superpowers behavior (full-dir, auto-add/remove). Output is
     byte-identical to the pre-refactor script (verified by golden diff of `--check`).
   - `select` — sync **only** an explicit per-source `items[]` allowlist. Never auto-adds
     upstream items, never removes manifest entries. The allowlist governs which **files** are
     mirrored; the **manifest** governs which entries exist (entry tags/gating are human-owned,
     so sync only refreshes derived fields: `version` patch-bump, `originUrl`, `pinnedRef`,
     `tokenEstimate`, `purpose`/`whenToUse` from frontmatter `description:`).

2. **Each `select` item declares `name`, `type`, `upstreamPath`** (relative to upstream root),
   so non-conventional paths like `.kiro/agents/refactor-cleaner.md` are handled explicitly.

3. **Local layout** `agents/<source-slug>/<name>.md` (`agents/ecc/`, `agents/oh-my-claudecode/`),
   mirroring the `skills/superpowers/` verbatim convention and leaving room for future
   first-party `agents/haus-owned/`. Manifest id scheme `haus.<source-slug>-<name>`;
   `originSourceId` = source id; `originUrl = <repo>/blob/<sha>/<upstreamPath>`.

4. **Real YAML parser for `sources.yaml`.** The `yaml` package (devDependency — scripts run in
   CI/dev only; runtime `dependencies` stay empty) replaces the regex reader. Reads handle the
   nested `items:` list robustly; writes still use targeted line replacement on the source's
   block so comments and flow-style item lists are preserved verbatim (a `YAML.stringify`
   round-trip would reformat the whole file).

5. **Weekly workflow** (`.github/workflows/upstream-sync.yml`) now iterates all sources;
   renamed "Upstream catalog sync". License gate (`assertMitLicense`) runs per source before
   `--apply`.

## Landing sequence (cross-repo)

Agents install through the CLI's existing type-agnostic path — no CLI change is required for
the sync architecture itself. (Non-`tsx` `npx` enforcement for those agents: ADR-0003, now
[ADR-0005](0005-npx-tsx-exemption-for-curated-skills.md).)

1. **Catalog PR** — `sources.yaml`, refactored `sync-upstream.mjs`, 11 agent files + manifest
   entries, docs. Merge → `haus validate-catalog` CI green.
2. **Fixture sync** — catalog merge dispatches `sync-catalog-fixture`; copies the manifest and
   `validation-rules.json` into the CLI fixture. No agent logic involved.

## Consequences

- Drift detection is per-source and per-item for agents; adding more agents later is a manual
  `sources.yaml` `items[]` edit (intentional — the allowlist is the control point).
- `select` never fabricates or removes manifest entries; a listed item missing its manifest
  entry is copied and reported, not silently registered.
- New devDependency (`yaml`) — first non-toolchain dep in `scripts/`. Justified by the nested
  parse; superpowers `mirror` output proven unchanged.
- Net catalog change: +11 agent items (68 → 79).

## Alternatives considered

- **Extend the regex line-walker** to read `items:` — rejected: brittle for nested multi-key
  flow maps; a real parser is lower-risk and clearer.
- **Full mirror of upstream `agents/`** — rejected: pulls unwanted agents and every future
  upstream addition; no allowlist control.
- **`YAML.stringify` for writes** — rejected: reformats the whole file (loses flow-style item
  lists), producing noisy diffs on every sync.
