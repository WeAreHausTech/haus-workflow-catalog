# Catalog × CLI Execution Plan

Cross-repo improvement plan for `haus-workflow-catalog` and `haus-ai-workflow`.  
Each finding is a self-contained session unit. Complete in sequence — later findings depend on earlier ones.  
Versioning strategy: **git tag–based releases** with **Conventional Commits** changelog.

---

## Repos

| Alias | Path | Repo |
|-------|------|------|
| **CATALOG** | `haus-workflow-catalog/` | `github.com/WeAreHausTech/haus-workflow-catalog` |
| **CLI** | `haus-ai-workflow/` | `github.com/WeAreHausTech/haus-workflow` |

---

## Execution Order & Dependency Map

```
F1 (CHANGELOG)
  └─→ F3 (release workflow + git tags)
        └─→ F4 (pinnedRef in CLI)
        └─→ F10 (per-item changelog)
        └─→ F7 (fixture sync automation)

F5 (JSON Schema)
  └─→ F6 (validator parity)
  └─→ F8 (lock schema SSOT)
  └─→ F4b (template type in CLI)

F9 (ecosystem audit) — independent
F2 — merged into F3
```

**Recommended session order:** F1 → F9 → F5 → F3 → F4 → F6 → F8 → F4b (template) → F7 → F10

---

## F1 — Add CHANGELOG.md to Catalog

**Repo:** CATALOG  
**Depends on:** nothing  
**Blocks:** F3, F10

### What

Create `CHANGELOG.md` at catalog root using [Keep a Changelog](https://keepachangelog.com) format with Conventional Commits sections.

### Steps

1. Create `CHANGELOG.md` at `haus-workflow-catalog/CHANGELOG.md`
2. Structure:
   ```markdown
   # Changelog

   All notable changes to this catalog are documented here.
   Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
   Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

   ## [Unreleased]

   ## [1.0.0] - 2026-05-27

   ### Added
   - Initial catalog: 30 skills, 5 agents, 1 template
   - Manifest schema v0.1.0
   - Standalone CI validator (scripts/validate.mjs)
   - Per-skill semver versioning
   ```
3. Commit: `docs: add CHANGELOG.md with initial 1.0.0 entry`

### Done when

- `CHANGELOG.md` exists at catalog root
- Has `[Unreleased]` section
- Has `[1.0.0]` entry covering initial catalog items
- CI still passes

---

## F9 — Audit ecosystem + requiresAny Completeness

**Repo:** CATALOG  
**Depends on:** nothing  
**Blocks:** nothing (but improves recommender accuracy in CLI)

### What

Every skill in `manifest.json` must have:
- `ecosystem` field set (string matching CLI's recommender groups)
- `requiresAny` array with at least one condition (stack, dependency, or role)

Exception: `global-engineering-rules` has no `requiresAny` (it's always loaded, `default: true`).

### Steps

1. Open `manifest.json` — scan all 30 skills
2. For each skill missing `ecosystem`, add it. Use these values:

   | Ecosystem | Skills |
   |-----------|--------|
   | `nextjs` | nextjs-patterns |
   | `react` | react19-patterns, radix-shadcn-patterns, tanstack-query-router-patterns, testing-library-patterns, storybook-patterns |
   | `typescript` | typescript6-patterns |
   | `vite` | vite8-patterns |
   | `vendure` | vendure-plugin-patterns, vendure-app-patterns |
   | `nestjs` | nestjs-graphql-patterns |
   | `laravel` | laravel-patterns, laravel-nova-patterns, phpunit-patterns |
   | `wordpress` | wordpress-patterns, wordpress-bedrock-patterns, wordpress-acf-elementor-jetengine-patterns |
   | `dotnet` | dotnet-patterns, dotnet-service-patterns |
   | `playwright` | playwright-patterns |
   | `nx` | nx21-monorepo-patterns |
   | `turbo` | turbo-monorepo-patterns |
   | `tailwind` | tailwind-scss-patterns |
   | `vue` | vue-patterns |
   | `auth` | auth-oidc-azure-bankid-patterns |
   | `database` | database-patterns |
   | `packagemanager` | package-manager-yarn4-pnpm89 |

3. For each skill missing `requiresAny`, add conditions. Examples:
   ```json
   // nextjs-patterns
   "requiresAny": [
     { "stack": "nextjs" },
     { "dependency": "next" }
   ]

   // laravel-patterns
   "requiresAny": [
     { "stack": "laravel" },
     { "dependency": "laravel/framework" },
     { "role": "laravel-app" }
   ]
   ```
4. Run `node scripts/validate.mjs` — must pass
5. Commit: `fix(manifest): add missing ecosystem and requiresAny fields to all skills`

### Done when

- All 30 skills (except `global-engineering-rules`) have `ecosystem` set
- All 30 skills (except `global-engineering-rules`) have at least one `requiresAny` clause
- `node scripts/validate.mjs` passes

---

## F5 — Shared JSON Schema for CatalogItem

**Repo:** CATALOG (source of truth) + CLI (consume)  
**Depends on:** nothing  
**Blocks:** F6, F8, F4b (template type)

### What

Create a canonical JSON Schema for `manifest.json` items. Catalog owns it. CLI references it for type generation and validation. Prevents silent schema drift between repos.

### Steps

#### CATALOG

1. Create `schema/catalog-item.schema.json`:
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "$id": "https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/schema/catalog-item.schema.json",
     "title": "CatalogItem",
     "type": "object",
     "required": ["id", "type", "source", "path", "tags", "repoRoles", "tokenEstimate"],
     "properties": {
       "id": { "type": "string", "pattern": "^haus\\." },
       "type": { "type": "string", "enum": ["skill", "agent", "template", "rule", "command"] },
       "source": { "type": "string", "enum": ["haus", "curated"] },
       "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
       "path": { "type": "string" },
       "title": { "type": "string" },
       "purpose": { "type": "string" },
       "whenToUse": { "type": "string" },
       "whenNotToUse": { "type": "string" },
       "tags": { "type": "array", "items": { "type": "string" } },
       "repoRoles": { "type": "array", "items": { "type": "string" } },
       "installMode": { "type": "string", "enum": ["copy-selected", "plugin-only"] },
       "references": { "type": "array", "items": { "type": "string" } },
       "safetyNotes": { "type": "array", "items": { "type": "string" } },
       "tokenBudget": { "type": "integer" },
       "tokenEstimate": { "type": "integer" },
       "default": { "type": "boolean" },
       "requiresAny": {
         "type": "array",
         "items": {
           "oneOf": [
             { "type": "object", "required": ["stack"], "properties": { "stack": { "type": "string" } }, "additionalProperties": false },
             { "type": "object", "required": ["dependency"], "properties": { "dependency": { "type": "string" } }, "additionalProperties": false },
             { "type": "object", "required": ["packageNamePattern"], "properties": { "packageNamePattern": { "type": "string" } }, "additionalProperties": false },
             { "type": "object", "required": ["role"], "properties": { "role": { "type": "string" } }, "additionalProperties": false }
           ]
         }
       },
       "ecosystem": { "type": "string" },
       "reviewStatus": { "type": "string", "enum": ["approved", "candidate", "needs-review", "rejected", "deprecated"] },
       "riskLevel": { "type": "string", "enum": ["low", "medium", "high", "blocked"] },
       "useMode": { "type": "string", "enum": ["copy", "adapted", "wrapped", "rewritten", "reference-only"] },
       "licenseConfidence": { "type": "string", "enum": ["high", "medium", "low", "unknown"] },
       "license": { "type": "string" },
       "originSourceId": { "type": "string" },
       "originUrl": { "type": "string", "pattern": "^https://" },
       "pinnedRef": { "type": "string" },
       "intents": { "type": "array", "items": { "type": "string" } },
       "sourceInfluences": {
         "type": "array",
         "items": {
           "type": "object",
           "required": ["source", "idea"],
           "properties": {
             "source": { "type": "string" },
             "idea": { "type": "string" }
           }
         }
       }
     },
     "additionalProperties": false
   }
   ```

2. Also create `schema/manifest.schema.json`:
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "$id": "https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/schema/manifest.schema.json",
     "title": "CatalogManifest",
     "type": "object",
     "required": ["version", "items"],
     "properties": {
       "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
       "items": {
         "type": "array",
         "items": { "$ref": "./catalog-item.schema.json" }
       }
     },
     "additionalProperties": false
   }
   ```

3. Update `scripts/validate.mjs` — add reference to schema files in comments at top
4. Commit: `feat(schema): add JSON Schema for manifest and CatalogItem`

#### CLI

5. In `haus-ai-workflow/src/types.ts` — add `"template"` to `CatalogItem.type` union:
   ```ts
   type: "skill" | "agent" | "template" | "rule" | "command";
   ```
6. Add comment above `CatalogItem`: `// Schema: https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/schema/catalog-item.schema.json`
7. Commit: `feat(types): add template type to CatalogItem, link JSON Schema`

### Done when

- `schema/catalog-item.schema.json` exists in CATALOG
- `schema/manifest.schema.json` exists in CATALOG
- `CatalogItem.type` in CLI includes `"template"`
- Schema comment links to catalog raw URL
- `node scripts/validate.mjs` still passes

---

## F3 — Git Tags + GitHub Release Workflow

**Repo:** CATALOG  
**Depends on:** F1 (CHANGELOG.md exists)  
**Blocks:** F4, F7, F10

### What

Add automated release workflow to catalog. On push of `v*.*.*` tag:
1. Validate catalog
2. Create GitHub Release with changelog excerpt
3. Attach `manifest.json` as release artifact

### Steps

1. Create `.github/workflows/release.yml`:
   ```yaml
   name: Release

   on:
     push:
       tags:
         - 'v*.*.*'

   permissions:
     contents: write

   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Use Node.js 22
           uses: actions/setup-node@v4
           with:
             node-version: 22

         - name: Validate catalog
           run: node scripts/validate.mjs

         - name: Extract changelog entry
           id: changelog
           run: |
             VERSION="${GITHUB_REF_NAME#v}"
             NOTES=$(awk "/^## \[$VERSION\]/{flag=1; next} /^## \[/{flag=0} flag" CHANGELOG.md)
             echo "notes<<EOF" >> $GITHUB_OUTPUT
             echo "$NOTES" >> $GITHUB_OUTPUT
             echo "EOF" >> $GITHUB_OUTPUT

         - name: Create GitHub Release
           uses: softprops/action-gh-release@v2
           with:
             body: ${{ steps.changelog.outputs.notes }}
             files: manifest.json
             fail_on_unmatched_files: true
   ```

2. Update `.github/workflows/validate.yml` — ensure it still runs on PR + push to main (separate from release)

3. Tag first release:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. Commit workflow: `ci: add release workflow with changelog extraction and manifest artifact`

### Done when

- `.github/workflows/release.yml` exists
- Tag `v1.0.0` pushed to origin
- GitHub Release `v1.0.0` created with `manifest.json` attached
- Release body contains changelog entry text

---

## F4 — pinnedRef + CATALOG_REF Support in CLI

**Repo:** CLI  
**Depends on:** F3 (catalog has git tags)  
**Blocks:** F7

### What

CLI hardcodes `CATALOG_REF = 'main'`. Projects can't pin to a stable catalog snapshot.  
Add env override + lock file `pinnedRef` field so projects can lock to a specific tag.

### Steps

1. In `haus-ai-workflow/src/catalog/constants.ts` — change:
   ```ts
   // Before
   export const CATALOG_REF = 'main';

   // After
   export const CATALOG_REF = process.env.HAUS_CATALOG_REF ?? 'main';
   ```

2. In lock file schema (`library/catalog/haus-lock.schema.json`) — add `catalogRef` field:
   ```json
   "catalogRef": {
     "type": "string",
     "description": "Git tag or branch the catalog was fetched from. Defaults to 'main'.",
     "default": "main"
   }
   ```

3. In `src/update/` — when writing lock file, record current `CATALOG_REF` as `catalogRef`

4. In `src/update/` — when running `haus update --check`, compare lock's `catalogRef` against latest available tag; warn if behind

5. Commit: `feat(catalog): support HAUS_CATALOG_REF env var and catalogRef in lock file`

### Done when

- `CATALOG_REF` reads from `HAUS_CATALOG_REF` env var with `'main'` fallback
- Lock file records `catalogRef` on write
- `haus update --check` reports if behind latest tag
- Tests pass

---

## F6 — Validator Parity

**Repo:** CATALOG + CLI  
**Depends on:** F5 (shared JSON Schema exists)  
**Blocks:** nothing (but prevents future divergence)

### What

Catalog's `scripts/validate.mjs` and CLI's `haus validate-catalog` command must enforce identical rules.  
Current risk: two independent implementations that can silently diverge.

### Steps

#### Option (chosen): catalog validator becomes canonical, CLI delegates

1. In CATALOG `scripts/validate.mjs` — add comment block at top:
   ```js
   /**
    * Canonical catalog validator.
    * Rules here are the source of truth.
    * CLI's `haus validate-catalog` command must stay in sync.
    * Schema: schema/catalog-item.schema.json
    * Last synced: <date>
    */
   ```

2. In CLI `src/commands/validate-catalog.ts` — read the same rule list:
   - Pull required sections, forbidden phrases, forbidden tags from a shared constants file
   - Or directly import a rules config that mirrors `validate.mjs` logic

3. Create `haus-ai-workflow/src/catalog/validation-rules.ts`:
   ```ts
   export const FORBIDDEN_TAGS = [
     'python','django','go','rust','java','spring','kotlin',
     'swift','android','flutter','dart','c++','perl','defi','trading'
   ];

   export const FORBIDDEN_AGENT_PHRASES = [
     'autonomous','swarm','delegate','orchestrat','marketplace'
   ];

   export const REQUIRED_SKILL_SECTIONS = ['## Use when', '## Do not use when'];
   export const REQUIRED_AGENT_SECTIONS = ['## Use when', '## Do not use when', '## Verification'];
   export const RISKY_PATTERNS = ['npx -y', 'npx --yes', 'yarn dlx', 'pnpm dlx'];
   export const ALLOWED_NPX = ['npx tsx'];
   ```

4. Update CATALOG `scripts/validate.mjs` — import rules from a parallel `scripts/validation-rules.mjs` using same constants

5. Add comment in CATALOG `scripts/validation-rules.mjs`:
   ```
   // SYNC REQUIRED: haus-ai-workflow/src/catalog/validation-rules.ts must match this file.
   ```

6. Commits:
   - CATALOG: `refactor(validator): extract validation rules to validation-rules.mjs`
   - CLI: `refactor(validate-catalog): align rules with catalog canonical validator`

### Done when

- Both repos have a rules constants file with identical values
- `node scripts/validate.mjs` and `haus validate-catalog` produce same pass/fail for same input
- SYNC comment present in both files

---

## F8 — Lock Schema Single Source of Truth

**Repo:** CATALOG (source) + CLI (consume)  
**Depends on:** F5 (schema/ dir exists in catalog)  
**Blocks:** nothing

### What

CLI has `library/catalog/haus-lock.schema.json`. Catalog README describes lock format.  
These two descriptions of the same format must be one file owned by CATALOG.

### Steps

1. In CATALOG, create `schema/haus-lock.schema.json`:
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "$id": "https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/schema/haus-lock.schema.json",
     "title": "HausLockFile",
     "description": "Written by `haus install`. Read by `haus update`.",
     "type": "object",
     "required": ["catalog", "lockedAt", "catalogRef", "items"],
     "properties": {
       "catalog": {
         "type": "string",
         "description": "URL of the catalog manifest JSON."
       },
       "lockedAt": {
         "type": "string",
         "format": "date-time"
       },
       "catalogRef": {
         "type": "string",
         "description": "Git tag or branch at time of install.",
         "default": "main"
       },
       "items": {
         "type": "array",
         "items": {
           "type": "object",
           "required": ["id", "version"],
           "properties": {
             "id": { "type": "string" },
             "version": { "type": "string" }
           },
           "additionalProperties": false
         }
       }
     },
     "additionalProperties": false
   }
   ```

2. In CLI, replace `library/catalog/haus-lock.schema.json` content with:
   ```json
   {
     "$comment": "Canonical schema lives at https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/schema/haus-lock.schema.json",
     "$ref": "https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/schema/haus-lock.schema.json"
   }
   ```

3. Update CATALOG `README.md` lock file section — link to `schema/haus-lock.schema.json` instead of inline example

4. Commits:
   - CATALOG: `feat(schema): add haus-lock.schema.json as canonical lock file schema`
   - CLI: `refactor(catalog): point haus-lock.schema.json to canonical CATALOG source`

### Done when

- `schema/haus-lock.schema.json` exists in CATALOG
- CLI's copy references canonical URL
- README lock section links to schema file

---

## F4b — Templates in Manifest

**Repo:** CATALOG + CLI  
**Depends on:** F5 (`"template"` type added to CLI `CatalogItem`)  
**Blocks:** nothing

### What

`templates/haus-way-of-work.md` exists but isn't a catalog item. Can't be installed, updated, or versioned through the catalog pipeline.

### Steps

1. In CATALOG `manifest.json` — add entry after agents section:
   ```json
   {
     "id": "haus.haus-way-of-work",
     "version": "1.0.0",
     "source": "haus",
     "type": "template",
     "path": "templates/haus-way-of-work.md",
     "title": "Haus way of work",
     "purpose": "Universal project instructions: context loading, output discipline, commit hygiene, safety rails, PR workflow.",
     "whenToUse": "Install in every project using haus-workflow. Always active.",
     "whenNotToUse": "Never skip this template.",
     "tags": ["workflow", "baseline", "project-instructions"],
     "repoRoles": [],
     "installMode": "copy-selected",
     "tokenEstimate": 600,
     "tokenBudget": 800,
     "default": true
   }
   ```

2. Update `scripts/validate.mjs` — handle `type === "template"`:
   - Check file exists at `path`
   - No banned phrases check (it's instructions, not an agent)
   - Skip `SKILL.md` / frontmatter checks

3. CLI `src/install/` — ensure `type: "template"` items are copied to `.haus-workflow/templates/`

4. Run `node scripts/validate.mjs` — must pass

5. Commits:
   - CATALOG: `feat(manifest): add haus-way-of-work as template catalog item`
   - CLI: `feat(install): handle template type in install pipeline`

### Done when

- `manifest.json` includes `haus.haus-way-of-work` with `type: "template"`
- Validator handles template type without errors
- CLI installs template to correct path

---

## F7 — Stale Test Fixture Sync in CLI

**Repo:** CLI  
**Depends on:** F3 (catalog has tagged releases + manifest artifact)  
**Blocks:** nothing

### What

`haus-ai-workflow/library/catalog/manifest.json` is a manually-maintained snapshot at `v0.1.0`. Will drift from real catalog. Need automation to keep it current.

### Steps

1. Add `.github/workflows/sync-catalog-fixture.yml` to CLI:
   ```yaml
   name: Sync catalog fixture

   on:
     schedule:
       - cron: '0 6 * * 1'   # weekly Monday 06:00 UTC
     workflow_dispatch:

   jobs:
     sync:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Fetch latest catalog manifest
           run: |
             curl -fsSL \
               https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/manifest.json \
               -o library/catalog/manifest.json

         - name: Check for changes
           id: diff
           run: |
             if git diff --quiet library/catalog/manifest.json; then
               echo "changed=false" >> $GITHUB_OUTPUT
             else
               echo "changed=true" >> $GITHUB_OUTPUT
             fi

         - name: Commit updated fixture
           if: steps.diff.outputs.changed == 'true'
           run: |
             git config user.name "github-actions[bot]"
             git config user.email "github-actions[bot]@users.noreply.github.com"
             git add library/catalog/manifest.json
             git commit -m "chore(catalog): sync fixture from haus-workflow-catalog main"
             git push
   ```

2. Manually sync fixture now — copy current catalog `manifest.json` to `library/catalog/manifest.json`

3. Commit: `chore(catalog): sync fixture to current catalog manifest + add weekly sync workflow`

### Done when

- `library/catalog/manifest.json` matches current catalog manifest
- Weekly sync workflow exists
- `workflow_dispatch` allows manual trigger

---

## F10 — Per-Item Changelog

**Repo:** CATALOG  
**Depends on:** F1 (CHANGELOG.md), F3 (release workflow in place)  
**Blocks:** nothing

### What

When any skill's `version` bumps in `manifest.json`, there must be a corresponding entry in `CHANGELOG.md` detailing what changed. Future sessions and upgrade-reviewing devs need this trail.

### Steps

1. Add **contributing rule** to `README.md` under new `## Contributing` section:
   ```markdown
   ## Contributing

   ### Bumping a skill version

   When you change a skill's content (SKILL.md or any reference file):

   1. Bump the skill's `version` in `manifest.json`:
      - `PATCH` (x.x.1): wording fix, typo, reordering
      - `MINOR` (x.1.x): new guideline, extended scope, new reference file
      - `MAJOR` (1.x.x): removed section, breaking scope change, renamed skill
   2. Add entry to `CHANGELOG.md` under `## [Unreleased]`:
      ```
      ### Changed
      - **nextjs-patterns** `1.0.0 → 1.1.0`: Added RSC caching patterns to workflow.md
      ```
   3. On release: move `[Unreleased]` entries to new version section.

   ### Releasing

   1. Update `CHANGELOG.md`: rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
   2. Add new empty `[Unreleased]` section at top
   3. Push tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
   4. GitHub Actions creates release + attaches manifest.json artifact
   ```

2. Update `scripts/validate.mjs` — add check: if any item `version` > `1.0.0`, warn if `CHANGELOG.md` has no entry for that item's id (soft warning, not hard fail — to avoid blocking first bumps)

3. Commit: `docs: add contributing guide with per-skill versioning and release process`

### Done when

- `README.md` has `## Contributing` section with bump + release instructions
- `scripts/validate.mjs` emits warning when bumped item has no CHANGELOG entry
- Process documented clearly enough for any engineer to follow without context

---

## Session Handoff Checklist

Before closing a finding's session, verify:

- [ ] All files created/modified committed with Conventional Commits message
- [ ] `node scripts/validate.mjs` passes (for any CATALOG change)
- [ ] TypeScript builds (`yarn build`) in CLI (for any CLI change)
- [ ] Tests pass (`yarn test`) for any CLI change
- [ ] This `EXECUTION-PLAN.md` updated: mark finding as `✅ DONE` with completion date
- [ ] If finding opened new gaps, add a note under that finding

## Status

| Finding | Status | Completed |
|---------|--------|-----------|
| F1 — CHANGELOG.md | ✅ DONE | 2026-05-27 |
| F9 — ecosystem audit | 🔲 TODO | — |
| F5 — JSON Schema | 🔲 TODO | — |
| F3 — Release workflow + git tags | 🔲 TODO | — |
| F4 — pinnedRef + CATALOG_REF | 🔲 TODO | — |
| F6 — Validator parity | 🔲 TODO | — |
| F8 — Lock schema SSOT | 🔲 TODO | — |
| F4b — Templates in manifest | 🔲 TODO | — |
| F7 — Fixture sync | 🔲 TODO | — |
| F10 — Per-item changelog | 🔲 TODO | — |
