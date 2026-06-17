# ESLint + Prettier Config Distribution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `"config"` catalog item type and a `haus scaffold` CLI command so ESLint and Prettier configs from `haus-tech-configs` can be distributed via `haus-workflow` instead of an npm postinstall script.

**Architecture:** Two repos, four phases.

- **haus-workflow-catalog**: New `configs/` directory. New `"config"` item type in schema + validation. Two config items (ESLint, Prettier).
- **haus-workflow CLI**: Extend `CatalogItem.type` to include `"config"`. New `haus scaffold [id]` command that copies catalog config items to the project root — explicit user action, not auto-applied by `haus apply`.

**Design decision — why `scaffold` not `apply`:** Config files (`eslint.config.js`, `.prettierrc`) live in the project root and are user-owned. Auto-overwriting them on every `haus apply` would break projects that extend or customise the configs. `haus scaffold` is an explicit, one-time bootstrapping action; subsequent updates are opt-in.

**Tech Stack:** TypeScript, Node.js, `fs-extra`, `commander`, `yarn validate`, `yarn test`, `yarn verify` (in CLI repo).

---

## File structure

### haus-workflow-catalog

| Action | Path                                                            |
| ------ | --------------------------------------------------------------- |
| Create | `configs/eslint/eslint.config.js`                               |
| Create | `configs/prettier/prettier.config.cjs`                          |
| Create | `configs/prettier/.prettierignore`                              |
| Modify | `schema/catalog-item.schema.json` — add `"config"` to type enum |
| Modify | `manifest.json` — add 2 config items                            |

### haus-workflow (CLI)

| Action | Path                                                                       |
| ------ | -------------------------------------------------------------------------- |
| Modify | `src/types.ts` — add `'config'` to `CatalogItem.type`                      |
| Modify | `src/claude/write-claude-files.ts` — `targetDirForType` handles `"config"` |
| Create | `src/install/scaffold.ts` — scaffold logic                                 |
| Modify | `src/commands/install.ts` — register `scaffold` subcommand                 |
| Modify | `src/cli.ts` — expose `scaffold` at top level                              |
| Create | `tests/scaffold.test.js` — tests                                           |

---

## Phase 1: Catalog — config files + schema (haus-workflow-catalog)

### Task 1: Add ESLint config file to catalog

**Files:**

- Create: `configs/eslint/eslint.config.js`

- [ ] **Step 1: Copy ESLint config from haus-tech-configs**

Source: `/Users/aniisabihi/Documents/GitHub/haus-tech-configs/eslint.config.js`

```bash
mkdir -p configs/eslint
cp /Users/aniisabihi/Documents/GitHub/haus-tech-configs/eslint.config.js configs/eslint/eslint.config.js
```

- [ ] **Step 2: Verify the file copied correctly**

```bash
head -10 configs/eslint/eslint.config.js
```

Expected: ESLint flat config `import` statements at the top.

---

### Task 2: Add Prettier config files to catalog

**Files:**

- Create: `configs/prettier/prettier.config.cjs`
- Create: `configs/prettier/.prettierignore`

- [ ] **Step 1: Copy Prettier configs from haus-tech-configs**

```bash
mkdir -p configs/prettier
cp /Users/aniisabihi/Documents/GitHub/haus-tech-configs/prettier.config.cjs configs/prettier/prettier.config.cjs
cp /Users/aniisabihi/Documents/GitHub/haus-tech-configs/.prettierignore configs/prettier/.prettierignore
```

- [ ] **Step 2: Verify both files exist**

```bash
ls -la configs/prettier/
```

Expected: `prettier.config.cjs` and `.prettierignore` listed.

---

### Task 3: Add `"config"` to catalog-item schema

**Files:**

- Modify: `schema/catalog-item.schema.json`

The `type` property currently has:

```json
"enum": ["skill", "agent", "template", "command"]
```

- [ ] **Step 1: Add `"config"` to the enum and update description**

In `schema/catalog-item.schema.json`, find:

```json
"type": {
  "type": "string",
  "enum": ["skill", "agent", "template", "command"],
  "description": "Item type. 'template' for universal project instruction files."
},
```

Change to:

```json
"type": {
  "type": "string",
  "enum": ["skill", "agent", "template", "command", "config"],
  "description": "Item type. 'template' for universal project instruction files. 'config' for project-root tooling config files (ESLint, Prettier) distributed via `haus scaffold`."
},
```

- [ ] **Step 2: Run validation to confirm schema change is accepted**

```bash
yarn validate
```

Expected: no schema validation failures.

---

### Task 4: Register config items in manifest.json

**Files:**

- Modify: `manifest.json`

- [ ] **Step 1: Add ESLint and Prettier entries to the `items` array**

Add after the last `haus.*` item (keep alphabetical or group with other haus-owned items):

```json
{
  "id": "haus.eslint-config",
  "version": "1.0.0",
  "source": "haus",
  "type": "config",
  "path": "configs/eslint/eslint.config.js",
  "title": "Haus ESLint config",
  "purpose": "ESLint 9.x flat config for Haus Tech TypeScript/React projects.",
  "whenToUse": "Scaffold into a new project to get the standard Haus ESLint setup. Run `haus scaffold haus.eslint-config`.",
  "whenNotToUse": "Do not scaffold if the project already has a custom ESLint config that extends beyond the Haus baseline.",
  "tags": ["frontend", "backend", "typescript", "quality"],
  "repoRoles": ["next-app", "react-app", "nestjs-api", "vendure-plugin", "vendure-app"],
  "requiresAny": [{ "dependency": "typescript" }],
  "tokenEstimate": 0,
  "installMode": "copy-selected",
  "reviewStatus": "approved",
  "riskLevel": "low"
},
{
  "id": "haus.prettier-config",
  "version": "1.0.0",
  "source": "haus",
  "type": "config",
  "path": "configs/prettier",
  "title": "Haus Prettier config",
  "purpose": "Prettier config and .prettierignore for Haus Tech projects.",
  "whenToUse": "Scaffold into a new project to get the standard Haus Prettier setup. Run `haus scaffold haus.prettier-config`.",
  "whenNotToUse": "Do not scaffold if the project already has a custom Prettier config.",
  "tags": ["frontend", "backend", "typescript", "quality"],
  "repoRoles": [],
  "tokenEstimate": 0,
  "installMode": "copy-selected",
  "reviewStatus": "approved",
  "riskLevel": "low"
}
```

Note: `tokenEstimate: 0` because config files are not loaded into agent context — they're project tooling files.

- [ ] **Step 2: Run validate + tests**

```bash
yarn validate && yarn test
```

Expected: all pass.

- [ ] **Step 3: Commit catalog changes**

```bash
git add configs/ schema/catalog-item.schema.json manifest.json
git commit -m "feat: add config item type and eslint/prettier catalog items"
```

---

## Phase 2: CLI — scaffold command (haus-workflow repo)

All tasks below are in `/Users/aniisabihi/Documents/GitHub/haus-workflow`.

### Task 5: Add `'config'` to CatalogItem type

**Files:**

- Modify: `src/types.ts`

- [ ] **Step 1: Extend the type union**

In `src/types.ts`, find:

```typescript
export type CatalogItem = {
  id: string
  type: 'skill' | 'agent' | 'template' | 'command'
```

Change to:

```typescript
export type CatalogItem = {
  id: string
  type: 'skill' | 'agent' | 'template' | 'command' | 'config'
```

- [ ] **Step 2: Update `CATALOG_ITEM_KNOWN_KEYS` if `type` is listed there**

`CATALOG_ITEM_KNOWN_KEYS` is a list of field names, not type values — no change needed there.

- [ ] **Step 3: Build to verify no type errors**

```bash
yarn build
```

Expected: exits 0.

---

### Task 6: Handle `"config"` in `targetDirForType`

**Files:**

- Modify: `src/claude/write-claude-files.ts`

Config items must NOT be written to `.claude/`. Return `null` from `targetDirForType` so `writeClaudeFiles` skips them (they are handled by the separate `scaffold` command).

- [ ] **Step 1: Update `targetDirForType`**

In `src/claude/write-claude-files.ts`, find:

```typescript
export function targetDirForType(type: string): string | null {
  if (type === 'agent') return 'agents'
  if (type === 'template') return 'templates'
  if (type === 'command') return 'commands'
  if (type === 'skill') return 'skills'
  return null
}
```

Change to:

```typescript
export function targetDirForType(type: string): string | null {
  if (type === 'agent') return 'agents'
  if (type === 'template') return 'templates'
  if (type === 'command') return 'commands'
  if (type === 'skill') return 'skills'
  // 'config' items are distributed via `haus scaffold`, not `haus apply`
  return null
}
```

(No functional change needed — the `return null` already handles unknown types. The comment makes the intent explicit so future contributors don't add a case here by mistake.)

- [ ] **Step 2: Build**

```bash
yarn build
```

Expected: exits 0.

---

### Task 7: Write scaffold logic

**Files:**

- Create: `src/install/scaffold.ts`

- [ ] **Step 1: Write the failing test first**

Create `tests/scaffold.test.js`:

```javascript
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'

import { scaffoldConfigItems } from '../dist/install/scaffold.js'

describe('scaffoldConfigItems', () => {
  let tmpDir
  let catalogRoot

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-scaffold-test-'))
    catalogRoot = path.join(tmpDir, 'catalog')
    fs.mkdirSync(path.join(catalogRoot, 'configs', 'eslint'), { recursive: true })
    fs.writeFileSync(
      path.join(catalogRoot, 'configs', 'eslint', 'eslint.config.js'),
      '// eslint config\n',
    )
  })

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('copies a single-file config item to the project root', async () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-project-'))
    try {
      const result = await scaffoldConfigItems(projectRoot, catalogRoot, [
        {
          id: 'haus.eslint-config',
          type: 'config',
          path: 'configs/eslint/eslint.config.js',
          source: 'haus',
          tags: [],
          repoRoles: [],
          tokenEstimate: 0,
        },
      ])
      const dest = path.join(projectRoot, 'eslint.config.js')
      assert.ok(fs.existsSync(dest), 'eslint.config.js should exist in project root')
      assert.equal(result.scaffolded.length, 1)
      assert.equal(result.skipped.length, 0)
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('skips a file that already exists and is different (no overwrite)', async () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-project-'))
    fs.writeFileSync(path.join(projectRoot, 'eslint.config.js'), '// custom config\n')
    try {
      const result = await scaffoldConfigItems(projectRoot, catalogRoot, [
        {
          id: 'haus.eslint-config',
          type: 'config',
          path: 'configs/eslint/eslint.config.js',
          source: 'haus',
          tags: [],
          repoRoles: [],
          tokenEstimate: 0,
        },
      ])
      const content = fs.readFileSync(path.join(projectRoot, 'eslint.config.js'), 'utf8')
      assert.equal(content, '// custom config\n', 'existing file must not be overwritten')
      assert.equal(result.scaffolded.length, 0)
      assert.equal(result.skipped.length, 1)
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('overwrites when force: true', async () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-project-'))
    fs.writeFileSync(path.join(projectRoot, 'eslint.config.js'), '// custom config\n')
    try {
      const result = await scaffoldConfigItems(
        projectRoot,
        catalogRoot,
        [
          {
            id: 'haus.eslint-config',
            type: 'config',
            path: 'configs/eslint/eslint.config.js',
            source: 'haus',
            tags: [],
            repoRoles: [],
            tokenEstimate: 0,
          },
        ],
        { force: true },
      )
      const content = fs.readFileSync(path.join(projectRoot, 'eslint.config.js'), 'utf8')
      assert.equal(content, '// eslint config\n')
      assert.equal(result.scaffolded.length, 1)
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })
})
```

- [ ] **Step 2: Run tests — expect failure (module not found)**

```bash
yarn test 2>&1 | grep scaffold
```

Expected: `Error: Cannot find module '../dist/install/scaffold.js'`

- [ ] **Step 3: Write the scaffold module**

Create `src/install/scaffold.ts`:

```typescript
/**
 * Scaffold catalog config items into the project root.
 * Unlike `haus apply`, this is explicit and user-initiated — it does not auto-run.
 * Existing files are preserved by default; use `force: true` to overwrite.
 */

import path from 'node:path'

import fs from 'fs-extra'

import type { CatalogItem } from '../types.js'
import { log, warn } from '../utils/logger.js'

export type ScaffoldResult = {
  scaffolded: string[]
  skipped: string[]
}

/**
 * Copy catalog config items to the project root.
 * - Single-file items: copy the file directly (e.g. `configs/eslint/eslint.config.js` → `<root>/eslint.config.js`).
 * - Directory items: copy all files in the directory to the project root (e.g. `configs/prettier/` → `<root>/`).
 */
export async function scaffoldConfigItems(
  projectRoot: string,
  catalogRoot: string,
  items: CatalogItem[],
  opts: { force?: boolean; dryRun?: boolean } = {},
): Promise<ScaffoldResult> {
  const scaffolded: string[] = []
  const skipped: string[] = []

  for (const item of items) {
    if (item.type !== 'config') continue

    const sourcePath = path.join(catalogRoot, item.path)
    const stat = await fs.stat(sourcePath).catch(() => null)
    if (!stat) {
      warn(`Skipping ${item.id}: source not found at ${sourcePath}`)
      continue
    }

    if (stat.isFile()) {
      const filename = path.basename(sourcePath)
      const dest = path.join(projectRoot, filename)
      const result = await scaffoldFile(sourcePath, dest, item.id, opts)
      if (result === 'scaffolded') scaffolded.push(filename)
      else skipped.push(filename)
    } else if (stat.isDirectory()) {
      const entries = await fs.readdir(sourcePath)
      for (const entry of entries) {
        const src = path.join(sourcePath, entry)
        const dest = path.join(projectRoot, entry)
        const result = await scaffoldFile(src, dest, item.id, opts)
        if (result === 'scaffolded') scaffolded.push(entry)
        else skipped.push(entry)
      }
    }
  }

  return { scaffolded, skipped }
}

async function scaffoldFile(
  src: string,
  dest: string,
  itemId: string,
  opts: { force?: boolean; dryRun?: boolean },
): Promise<'scaffolded' | 'skipped'> {
  const exists = await fs.pathExists(dest)

  if (exists && !opts.force) {
    warn(`Skipping ${path.basename(dest)}: already exists (use --force to overwrite)`)
    return 'skipped'
  }

  if (opts.dryRun) {
    log(`[dry-run] would ${exists ? 'overwrite' : 'create'} ${path.basename(dest)} (${itemId})`)
    return 'scaffolded'
  }

  await fs.ensureDir(path.dirname(dest))
  await fs.copy(src, dest, { overwrite: true })
  log(`${exists ? 'Overwrote' : 'Created'} ${path.basename(dest)} (${itemId})`)
  return 'scaffolded'
}
```

- [ ] **Step 4: Build and run tests**

```bash
yarn build && yarn test 2>&1 | grep -A 5 scaffold
```

Expected: `▶ scaffoldConfigItems` with all sub-tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/install/scaffold.ts tests/scaffold.test.js src/types.ts src/claude/write-claude-files.ts
git commit -m "feat: add scaffold module and config catalog item type"
```

---

### Task 8: Register the `scaffold` CLI command

**Files:**

- Create: `src/commands/scaffold.ts`
- Modify: `src/cli.ts`

- [ ] **Step 1: Create the command handler**

Create `src/commands/scaffold.ts`:

```typescript
/**
 * `haus scaffold [id...]`
 *
 * Copies catalog config items to the project root.
 * Run explicitly when bootstrapping a new project or upgrading configs.
 * Does NOT run as part of `haus apply`.
 */

import type { Command } from 'commander'

import { loadCatalogContext } from '../catalog/load-catalog.js'
import { scaffoldConfigItems } from '../install/scaffold.js'
import type { CatalogItem } from '../types.js'
import { log } from '../utils/logger.js'

export function registerScaffoldCommand(program: Command): void {
  program
    .command('scaffold [ids...]')
    .description(
      'Copy catalog config items (ESLint, Prettier) into the project root. ' +
        'Pass item IDs to scaffold specific items, or omit to scaffold all available config items.',
    )
    .option('--force', 'Overwrite existing files')
    .option('--dry-run', 'Preview what would be written without changing anything')
    .option('--root <path>', 'Project root (defaults to cwd)', process.cwd())
    .action(async (ids: string[], options: { force?: boolean; dryRun?: boolean; root: string }) => {
      const { items: allItems, contentRoot } = await loadCatalogContext(options.root)
      const configItems = (allItems as CatalogItem[]).filter((item) => {
        if (item.type !== 'config') return false
        if (item.reviewStatus && item.reviewStatus !== 'approved') return false
        if (item.riskLevel === 'blocked') return false
        if (ids.length > 0 && !ids.includes(item.id)) return false
        return true
      })

      if (configItems.length === 0) {
        if (ids.length > 0) {
          log(`No config items found for: ${ids.join(', ')}`)
        } else {
          log('No config items available in catalog.')
        }
        return
      }

      log(`Scaffolding ${configItems.length} config item(s)…`)

      const result = await scaffoldConfigItems(options.root, contentRoot, configItems, {
        force: options.force,
        dryRun: options.dryRun,
      })

      if (result.scaffolded.length > 0) {
        log(`✓ Scaffolded: ${result.scaffolded.join(', ')}`)
      }
      if (result.skipped.length > 0) {
        log(`Skipped (already exist): ${result.skipped.join(', ')}`)
        log('Run with --force to overwrite.')
      }
    })
}
```

- [ ] **Step 2: Register in `src/cli.ts`**

`cli.ts` uses inline `program.command()` calls — no `registerXxxCommand` wrappers exist. Add the import and command inline, following the same pattern as other commands.

In `src/cli.ts`, add the import at the top with the other command imports:

```typescript
import { runScaffold } from './commands/scaffold.js'
```

Rename the exported function in `src/commands/scaffold.ts` from `registerScaffoldCommand` to `runScaffold` and change its signature to accept `(ids: string[], options: {...})` directly (not a `Command` instance). Then add the command inline in `cli.ts` after the `install` command block:

```typescript
program
  .command('scaffold [ids...]')
  .description(
    'Copy catalog config items (ESLint, Prettier) into the project root. ' +
      'Pass item IDs to scaffold specific items, or omit to scaffold all available config items.',
  )
  .option('--force', 'Overwrite existing files')
  .option('--dry-run', 'Preview what would be written without changing anything')
  .option('--root <path>', 'Project root (defaults to cwd)', process.cwd())
  .action(runScaffold)
```

Update `src/commands/scaffold.ts` to export `runScaffold` as the action handler:

```typescript
export async function runScaffold(
  ids: string[],
  options: { force?: boolean; dryRun?: boolean; root: string },
): Promise<void> {
  // ... body from registerScaffoldCommand's .action() callback
}
```

- [ ] **Step 3: Build**

```bash
yarn build
```

Expected: exits 0.

- [ ] **Step 4: Smoke-test the command help**

```bash
node dist/cli.js scaffold --help
```

Expected output includes:

```
Usage: haus scaffold [options] [ids...]

Copy catalog config items (ESLint, Prettier) into the project root.
```

- [ ] **Step 5: Run full verification gate**

```bash
yarn verify
```

Expected: typecheck + lint + build + test all pass.

- [ ] **Step 6: Commit**

```bash
git add src/commands/scaffold.ts src/cli.ts
git commit -m "feat: add haus scaffold command for config file distribution"
```

---

## Phase 3: Sync CLI catalog fixture (haus-workflow-catalog)

The CLI bundles `manifest.json` and `validation-rules.json` as fixtures in `library/catalog/`. The `catalog-item.schema.json` is **not** synced — it lives only in this repo and is used by catalog validation, not the CLI at runtime.

Fixture sync is triggered automatically on release tag push (`dispatch-fixture-sync.yml` → dispatches `sync-catalog-fixture` in the CLI repo). No manual copy step needed.

### Task 9: Verify fixture sync fires after catalog release

- [ ] **Step 1: After merging Phase 1 changes, cut a catalog release**

```bash
yarn release
```

- [ ] **Step 2: Confirm dispatch workflow ran**

In GitHub Actions for this repo, check the `Dispatch fixture sync` workflow run on the new tag. It should exit 0 (or warn if `HAUS_WORKFLOW_DISPATCH_TOKEN` is unset — in that case the CLI's weekly cron `sync-catalog-from-release` will pick it up instead).

- [ ] **Step 3: Verify CLI fixture updated**

In the haus-workflow repo, confirm `library/catalog/manifest.json` includes the new `haus.eslint-config` and `haus.prettier-config` entries after the sync runs.

---

## Phase 4: Deprecate haus-tech-configs (haus-tech-configs repo)

Only do this after Phase 1 and Phase 2 are merged and the CLI is published.

### Task 10: Add deprecation notice to haus-tech-configs

**Files:**

- Modify: `/Users/aniisabihi/Documents/GitHub/haus-tech-configs/README.md`
- Modify: `/Users/aniisabihi/Documents/GitHub/haus-tech-configs/package.json`

- [ ] **Step 1: Add deprecation header to README**

In `README.md`, prepend:

```markdown
> **Deprecated.** ESLint and Prettier configs are now distributed via [`@haus-tech/haus-workflow`](https://github.com/WeAreHausTech/haus-workflow).
> Run `haus scaffold` in your project to get the same configs.
> This package will no longer receive updates.
```

- [ ] **Step 2: Add deprecation warning to package.json**

In `package.json`, add at top level:

```json
"deprecated": "Use @haus-tech/haus-workflow and `haus scaffold` instead. See https://github.com/WeAreHausTech/haus-workflow-catalog."
```

Note: npm reads the `deprecated` field and shows it as a warning on install.

- [ ] **Step 3: Publish the deprecated version**

```bash
yarn release:patch
```

This publishes the deprecation notice to npm so existing users see the warning on `npm install`.

- [ ] **Step 4: Commit**

```bash
git add README.md package.json
git commit -m "chore: deprecate in favour of haus-workflow scaffold"
```

---

## Self-review checklist

**Catalog (haus-workflow-catalog):**

- [ ] `configs/eslint/eslint.config.js` matches source in haus-tech-configs
- [ ] `configs/prettier/prettier.config.cjs` and `.prettierignore` match source
- [ ] `schema/catalog-item.schema.json` enum includes `"config"`
- [ ] `manifest.json` has `haus.eslint-config` and `haus.prettier-config` with `tokenEstimate: 0`
- [ ] `yarn validate && yarn test` pass

**CLI (haus-workflow):**

- [ ] `CatalogItem.type` includes `'config'`
- [ ] `targetDirForType('config')` returns `null` (skipped by apply)
- [ ] `scaffoldConfigItems` — existing file → skip (no overwrite); `--force` → overwrite
- [ ] `haus scaffold` command registered and shows in `--help`
- [ ] `haus scaffold haus.eslint-config` copies `eslint.config.js` to project root
- [ ] `haus scaffold haus.prettier-config` copies `prettier.config.cjs` and `.prettierignore`
- [ ] `yarn verify` passes
