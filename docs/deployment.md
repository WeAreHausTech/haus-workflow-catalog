# Deployment

## Overview

No deployed application. Releases publish a GitHub Release with `manifest.json` as an artifact. Consumers fetch the catalog live from `main` via `haus update`.

## CI pipelines

### `validate.yml` — on push to `main` and on all PRs

1. Secret scan (gitleaks)
2. `yarn lint`
3. `yarn format:check`
4. `yarn test`
5. `node scripts/validate.mjs ./manifest.json`
6. `node scripts/check-item-versions.mjs $BASE_SHA` (PRs only — enforces item version bumps)

### `release.yml` — on tag push `v*.*.*`

1. `node scripts/check-manifest-version.mjs` — verifies `manifest.json#version` matches the tag
2. `node scripts/validate.mjs ./manifest.json`
3. Extracts changelog entry for the tag from `CHANGELOG.md`
4. Creates GitHub Release with release notes + `manifest.json` artifact

### `upstream-sync.yml` — weekly Monday 06:00 UTC + `workflow_dispatch`

1. `node scripts/sync-upstream.mjs --apply`
2. `yarn format` (excludes `skills/`, `commands/`, `agents/`)
3. `yarn validate`
4. Opens/updates PR `chore/upstream-superpowers-sync`

If the upstream license is not MIT, the job fails and no PR is opened (legal review required).

### `dispatch-fixture-sync.yml` — on push to `main` touching `manifest.json` or `validation-rules.json`

Dispatches `sync-catalog-fixture` in the `haus-workflow` CLI repo to keep the CLI's offline fixture in sync. See ADR-0001 for the landing order required when changing `validation-rules.json`.

## Release checklist

1. Ensure `main` is clean and all PRs merged.
2. Confirm all changed item paths have bumped versions in `manifest.json`.
3. Run from `main` with a clean working tree:

   ```bash
   yarn release:dry          # preview — check version bump and changelog
   yarn release              # interactive (patch / minor / major)
   # or
   yarn release 2.1.1        # explicit version
   ```

4. `release-it` will:
   - Run `yarn validate`
   - Bump `package.json#version`
   - Sync `manifest.json#version` via `scripts/sync-version.mjs`
   - Update `CHANGELOG.md`
   - Commit, tag `vX.Y.Z`, push
5. Tag push triggers `release.yml` → GitHub Release + `manifest.json` artifact.

## Consumer update propagation

Changes merged to `main` are available to consumers immediately — no CLI release needed. `haus update` fetches the latest catalog from `main` (or the ref in `HAUS_CATALOG_REF`).

## Rollback

No server to roll back. If a bad catalog lands on `main`, revert the commit and push — consumers on `main` ref pick up the revert on their next `haus update`.
