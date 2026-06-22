# Security

Supply-chain policy for catalog content that `@haus-tech/haus-workflow` fetches and installs
into consuming projects. This repo gates **what may ship**; runtime agent guards live in
[haus-workflow `docs/security.md`](https://github.com/WeAreHausTech/haus-workflow/blob/main/docs/security.md).

## Canonical rules

`validation-rules.json` is the single source of truth (ADR-0001). The CLI keeps a synced
fixture at `library/catalog/validation-rules.json`. When rules change, land CLI validator +
fixture first, then this repo — see [runbook.md](runbook.md).

Enforcement: `scripts/validate.mjs` on every PR (`yarn validate`); same rules at CLI ingest
(`validate-catalog.ts`).

## Forbidden stack tags

`forbiddenTags` blocks unsupported stacks on manifest `tags` and in when-signals
(frontmatter `description:` and legacy `## Use when`). Prose elsewhere is not scanned — items
may name platforms in negation or file paths.

Current list: `python`, `django`, `go`, `rust`, `java`, `spring`, `kotlin`, `swift`,
`android`, `flutter`, `dart`, `c++`, `perl`, `defi`, `trading`.

The CLI recommender applies a matching binary eligibility gate so these stacks are not
recommended even if content slipped through.

## Install-command safety

Shipped markdown is line-scanned for patterns that auto-install packages without user review:

| Pattern class   | Examples                                      | Exempt?                      |
| --------------- | --------------------------------------------- | ---------------------------- |
| Risky install   | `npx -y`, `npx --yes`, `yarn dlx`, `pnpm dlx` | **Never**                    |
| Non-`tsx` `npx` | `npx playwright`, `npx prisma`                | Only `source: curated` items |

Haus-first-party items (`source: haus`) must use `npx tsx` only. Curated verbatim content may
name standard toolchain commands — see [ADR-0005](adr/0005-npx-tsx-exemption-for-curated-skills.md).

Implementation: `scripts/forbidden-content.mjs` → `auditMarkdownLines()`.

## Tag allowlist (positive gate)

Every manifest tag must be in `allowedStacks`, `alwaysAllowedTags`, or end with a
`patternTagSuffixes` entry (e.g. `-patterns`). New stacks require an allowlist entry before use.

## Reference integrity

Manifest `references[]` entries that are URLs must use `https://` — no `http://`. Relative
paths are not used for bundled content; files under `item.path` install via the CLI full-tree
cache.

## Upstream trust model

Curated items under `skills/<source>/`, `agents/<source>/`, and `commands/<source>/` are
copied verbatim from pinned upstream snapshots (`sources.yaml`). Do not hand-edit except
security patches.

`scripts/sync-upstream.mjs --apply` hard-stops when upstream license is not MIT (no auto-PR).
Curated items require `license` and `licenseConfidence` in `manifest.json`.

Weekly sync opens a review PR; maintainers sanity-check the diff before merge — see
[runbook.md](runbook.md).

## Shipped-content quality gates

Per-item audits on templates and commands still enforce `TODO` / `PLACEHOLDER` markers.
The repo-wide markdown walk disables that scan (legitimate prose false positives) but keeps
install-safety and forbidden-stack when-signal checks.

Skills and agents require non-empty frontmatter `description:`.

## Commit-time secret scanning

`lefthook.yml` pre-commit runs gitleaks (when installed) plus a grep baseline on added lines
for inline credential assignments. Complements validation — catches secrets in repo plumbing,
not just catalog markdown. The catalog also ships `templates/lefthook-security.yml` for
consuming projects (installed by `haus apply`).

## What this repo does not control

- Runtime PreToolUse guards, `permissions.deny` / `permissions.ask` — haus-workflow
- Whether a consumer project applies recommended items — user / `haus apply` choice
- Security of third-party URLs in `references[]` beyond the https requirement
