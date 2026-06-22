#!/usr/bin/env node
/**
 * Sync curated catalog items from upstream sources declared in sources.yaml.
 *
 * Each source declares a `mode`:
 *   - mirror: full-directory mirror of upstream skills/ + commands/ (auto-adds new
 *     upstream items, removes deleted ones). Used by superpowers-pcvelz.
 *   - select: sync only an explicit per-source `items[]` allowlist (curated agents).
 *     Never auto-adds upstream items, never removes manifest entries — the allowlist
 *     governs which FILES are mirrored; the manifest governs which ENTRIES exist
 *     (entry tags/gating are human-owned, so sync only refreshes derived fields).
 *
 *   node scripts/sync-upstream.mjs          # --check (default): drift report, exit 1 if drift
 *   node scripts/sync-upstream.mjs --check  # same
 *   node scripts/sync-upstream.mjs --apply  # apply deterministic sync rules
 */
import { execFileSync, execSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import YAML from 'yaml'

import { extractFrontmatterDescription } from './forbidden-content.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCES_PATH = path.join(ROOT, 'sources.yaml')
const MANIFEST_PATH = path.join(ROOT, 'manifest.json')
const DEFAULT_WHEN_NOT_TO_USE = 'Do not use when a more specific skill or command applies.'
const SHARED_SUPPORT = { name: 'shared', type: 'support' }

const args = process.argv.slice(2)
const applyMode = args.includes('--apply')
const checkMode = args.includes('--check') || !applyMode

if (args.some((a) => a.startsWith('-') && a !== '--check' && a !== '--apply')) {
  console.error('Usage: node scripts/sync-upstream.mjs [--check|--apply]')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// YAML / manifest helpers
// ---------------------------------------------------------------------------

// sources.yaml is parsed with a real YAML parser (the `select` mode introduces
// nested `items:` lists with multi-key flow maps that the previous regex/line-walk
// parser could not read — see ADR-0002). Writes back are done with targeted line
// replacement on the source's block so comments and flow-style item lists are
// preserved verbatim (a YAML.stringify round-trip would reformat the whole file).

const VALID_MODES = new Set(['mirror', 'select'])

export function parseAllSources(content) {
  const doc = YAML.parse(content)
  const sources = doc?.sources
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('sources.yaml: no sources[] found')
  }
  return sources.map((s) => {
    // Absent `mode` falls back to `mirror` (safe default — a source missing the field is
    // never silently skipped). But an explicit unknown value (e.g. a typo `miror`) is a
    // hard error: silently treating it as mirror could run destructive full-dir sync on a
    // source meant to be `select`.
    const mode = s.mode == null ? 'mirror' : s.mode
    if (!VALID_MODES.has(mode)) {
      throw new Error(
        `sources.yaml: source "${s.id}" has unknown mode "${s.mode}" (expected mirror or select)`,
      )
    }
    return {
      id: s.id,
      repo: s.repo,
      slug: s.slug,
      license: s.license,
      licenseConfidence: s.licenseConfidence,
      snapshotRef: s.snapshotRef,
      retrieved: s.retrieved,
      useMode: s.useMode || 'copy',
      mode,
      excludeCommands: s.excludeCommands === true,
      items: Array.isArray(s.items)
        ? s.items.map((item) => ({
            name: item.name,
            type: item.type ?? 'agent',
            upstreamPath: item.upstreamPath,
          }))
        : [],
    }
  })
}

/** Block spanning one source entry (`- id: <sourceId>` to the next `- id:` or EOF). */
export function extractSourceBlock(content, sourceId) {
  const lines = content.split('\n')
  const blockLines = []
  let capturing = false
  for (const line of lines) {
    // Parse the id token exactly (not a substring): `line.includes(sourceId)` could match
    // the wrong block when one id is a substring of another or appears in a trailing comment.
    const idMatch = line.match(/^\s*-\s+id:\s*(\S+)/)
    if (idMatch) {
      if (capturing) break
      if (idMatch[1] === sourceId) {
        capturing = true
        blockLines.push(line)
      }
      continue
    }
    if (capturing) blockLines.push(line)
  }
  if (blockLines.length === 0) {
    throw new Error(`sources.yaml: missing source id ${sourceId}`)
  }
  return blockLines.join('\n')
}

/** Replace snapshotRef/retrieved within a single source's block, preserving the rest. */
function updateSourcesYaml(content, sourceId, snapshotRef, retrieved) {
  const block = extractSourceBlock(content, sourceId)
  const updated = block
    .replace(/^(\s*snapshotRef:\s*)\S+/m, `$1${snapshotRef}`)
    .replace(/^(\s*retrieved:\s*)\S+/m, `$1${retrieved}`)
  return content.replace(block, updated)
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Upstream git
// ---------------------------------------------------------------------------

const SNAPSHOT_REF_RE = /^[0-9a-f]{40}$/i

/** Reject non-SHA snapshotRef before any shell/git invocation. */
export function assertSnapshotRef(snapshotRef) {
  if (!SNAPSHOT_REF_RE.test(snapshotRef ?? '')) {
    throw new Error('snapshotRef must be a 40-character git commit SHA')
  }
}

/** Shallow-clone upstream default branch HEAD (not sources.yaml snapshotRef). */
export function cloneUpstream(repoUrl) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'superpowers-sync-'))
  try {
    execSync(`git init -q`, { cwd: tmpDir, stdio: 'pipe', encoding: 'utf8' })
    execSync(`git remote add origin "${repoUrl}"`, {
      cwd: tmpDir,
      stdio: 'pipe',
      encoding: 'utf8',
    })
    execFileSync('git', ['fetch', '--depth', '1', 'origin', 'HEAD'], {
      cwd: tmpDir,
      stdio: 'pipe',
      encoding: 'utf8',
    })
    execSync(`git checkout -q FETCH_HEAD`, { cwd: tmpDir, stdio: 'pipe', encoding: 'utf8' })
  } catch (err) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    throw new Error(`git fetch failed: ${err.stderr || err.message}`)
  }
  const headSha = execSync('git rev-parse HEAD', {
    cwd: tmpDir,
    encoding: 'utf8',
  }).trim()
  return { tmpDir, headSha }
}

export function assertMitLicense(upstreamRoot) {
  const licensePath = ['LICENSE', 'LICENSE.md']
    .map((name) => path.join(upstreamRoot, name))
    .find((candidate) => fs.existsSync(candidate))
  if (!licensePath) {
    throw new Error('upstream LICENSE file missing')
  }
  const text = fs.readFileSync(licensePath, 'utf8')
  const hasSpdxMit = /SPDX-License-Identifier:\s*MIT\b/m.test(text)
  const hasMitTitle = /^(?:The )?MIT License\b/m.test(text)
  if (!hasSpdxMit && !hasMitTitle) {
    throw new Error(
      'upstream license is not MIT (expected SPDX-License-Identifier: MIT, MIT License header in LICENSE/LICENSE.md, or "The MIT License")',
    )
  }
}

// ---------------------------------------------------------------------------
// File / directory utilities
// ---------------------------------------------------------------------------

/** Upstream metadata dirs we never ship into the catalog (IDE plugin manifests). */
const SKIP_COPY_DIR_NAMES = new Set(['.cursor-plugin'])

export function isSkippedSyncDirectory(name) {
  return SKIP_COPY_DIR_NAMES.has(name)
}

function readFileOrEmpty(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
}

function listFilesRecursive(dir, base = dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && isSkippedSyncDirectory(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full, base))
    } else if (entry.isFile()) {
      out.push(path.relative(base, full))
    }
  }
  return out.sort()
}

function fileHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function lineDiffStat(oldText, newText) {
  const oldLines = (oldText ?? '').split('\n')
  const newLines = (newText ?? '').split('\n')
  const max = Math.max(oldLines.length, newLines.length)
  let added = 0
  let removed = 0
  for (let i = 0; i < max; i++) {
    const o = oldLines[i]
    const n = newLines[i]
    if (o === undefined) added++
    else if (n === undefined) removed++
    else if (o !== n) {
      added++
      removed++
    }
  }
  return { added, removed }
}

function comparePaths(localPath, upstreamPath) {
  const localExists = fs.existsSync(localPath)
  const upstreamExists = fs.existsSync(upstreamPath)
  if (!localExists && !upstreamExists) {
    return { equal: true, added: 0, removed: 0, files: 0 }
  }
  if (!localExists || !upstreamExists) {
    const localStat = localExists ? fs.statSync(localPath) : null
    const upstreamStat = upstreamExists ? fs.statSync(upstreamPath) : null
    if (localStat?.isFile() || upstreamStat?.isFile()) {
      const localText = readFileOrEmpty(localPath) ?? ''
      const upstreamText = readFileOrEmpty(upstreamPath) ?? ''
      const stat = lineDiffStat(localText, upstreamText)
      return { equal: false, ...stat, files: 1 }
    }
    return { equal: false, added: 0, removed: 0, files: 1 }
  }

  const localStat = fs.statSync(localPath)
  const upstreamStat = fs.statSync(upstreamPath)

  if (localStat.isFile() && upstreamStat.isFile()) {
    const localText = fs.readFileSync(localPath, 'utf8')
    const upstreamText = fs.readFileSync(upstreamPath, 'utf8')
    const equal = fileHash(localText) === fileHash(upstreamText)
    const stat = equal ? { added: 0, removed: 0 } : lineDiffStat(localText, upstreamText)
    return { equal, ...stat, files: equal ? 0 : 1 }
  }

  if (localStat.isDirectory() && upstreamStat.isDirectory()) {
    const localFiles = new Set(listFilesRecursive(localPath))
    const upstreamFiles = new Set(listFilesRecursive(upstreamPath))
    const all = new Set([...localFiles, ...upstreamFiles])
    let added = 0
    let removed = 0
    let files = 0
    let equal = true
    for (const rel of all) {
      const lp = path.join(localPath, rel)
      const up = path.join(upstreamPath, rel)
      const l = readFileOrEmpty(lp)
      const u = readFileOrEmpty(up)
      if (l === null || u === null || fileHash(l) !== fileHash(u)) {
        equal = false
        files++
        const stat = lineDiffStat(l ?? '', u ?? '')
        added += stat.added
        removed += stat.removed
      }
    }
    return { equal, added, removed, files }
  }

  return { equal: false, added: 0, removed: 0, files: 1 }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const name of fs.readdirSync(src)) {
      if (isSkippedSyncDirectory(name)) continue
      copyRecursive(path.join(src, name), path.join(dest, name))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

function removeRecursive(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------------------
// Manifest / description helpers
// ---------------------------------------------------------------------------

// Reuse the validator's CRLF-safe, block-scalar-aware extractor so upstream files
// with Windows line endings don't yield an empty description (single source of truth).
function parseDescription(filePath) {
  return extractFrontmatterDescription(fs.readFileSync(filePath, 'utf8'))
}

function titleCase(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function patchBump(version) {
  const [major, minor, patch] = version.split('.').map((n) => parseInt(n, 10))
  return `${major}.${minor}.${patch + 1}`
}

function itemName(item) {
  if (item.type === 'skill') {
    return path.basename(item.path)
  }
  return path.basename(item.path, '.md')
}

function originUrl(name, type, sha, repoBase) {
  const base = repoBase.replace(/\.git$/, '')
  return type === 'skill'
    ? `${base}/tree/${sha}/skills/${name}`
    : `${base}/blob/${sha}/commands/${name}.md`
}

function tokenEstimateForItem(itemPath, type) {
  const filePath =
    type === 'skill' ? path.join(ROOT, itemPath, 'SKILL.md') : path.join(ROOT, itemPath)
  const chars = fs.statSync(filePath).size
  return Math.ceil(chars / 4)
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
}

function sourceItems(manifest, sourceId) {
  return manifest.items.filter((i) => i.originSourceId === sourceId)
}

function findManifestItem(manifest, slug, name, type) {
  const id = `haus.${slug}-${name}`
  return manifest.items.find((i) => i.id === id && i.type === type)
}

function newManifestEntry(name, type, itemPath, description, sha, source) {
  const { slug } = source
  const tokenFile =
    type === 'skill' ? path.join(ROOT, itemPath, 'SKILL.md') : path.join(ROOT, itemPath)
  const chars = fs.statSync(tokenFile).size
  return {
    id: `haus.${slug}-${name}`,
    version: '1.0.0',
    source: 'curated',
    type,
    path: itemPath,
    title: `${titleCase(slug)} ${titleCase(name)}`,
    purpose: description,
    whenToUse: description,
    whenNotToUse: DEFAULT_WHEN_NOT_TO_USE,
    tags: ['workflow'],
    repoRoles: [],
    tokenEstimate: Math.ceil(chars / 4),
    installMode: 'copy-selected',
    default: true,
    reviewStatus: 'approved',
    riskLevel: 'low',
    useMode: source.useMode,
    license: source.license,
    licenseConfidence: 'high',
    originSourceId: source.id,
    originUrl: originUrl(name, type, sha, source.repo),
    pinnedRef: sha,
    ecosystem: slug,
  }
}

// ---------------------------------------------------------------------------
// Inventory upstream + local
// ---------------------------------------------------------------------------

function upstreamSkillNames(upstreamRoot) {
  const skillsDir = path.join(upstreamRoot, 'skills')
  if (!fs.existsSync(skillsDir)) return []
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'shared')
    .filter((e) => fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort()
}

function upstreamCommandNames(upstreamRoot) {
  const commandsDir = path.join(upstreamRoot, 'commands')
  if (!fs.existsSync(commandsDir)) return []
  return fs
    .readdirSync(commandsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort()
}

function localPathFor(slug, name, type) {
  return type === 'skill'
    ? path.join(ROOT, 'skills', slug, name)
    : path.join(ROOT, 'commands', slug, `${name}.md`)
}

function upstreamPathFor(upstreamRoot, name, type) {
  return type === 'skill'
    ? path.join(upstreamRoot, 'skills', name)
    : path.join(upstreamRoot, 'commands', `${name}.md`)
}

function catalogPathFor(slug, name, type) {
  return type === 'skill' ? `skills/${slug}/${name}` : `commands/${slug}/${name}.md`
}

function localSharedSupportPath(slug, catalogRoot = ROOT) {
  return path.join(catalogRoot, 'skills', slug, 'shared')
}

function upstreamSharedSupportPath(upstreamRoot) {
  return path.join(upstreamRoot, 'skills/shared')
}

/** Verbatim support files referenced by multiple curated skills (not a manifest item). */
export function inspectSharedSupport(upstreamRoot, slug, catalogRoot = ROOT) {
  const local = localSharedSupportPath(slug, catalogRoot)
  const upstream = upstreamSharedSupportPath(upstreamRoot)
  if (!fs.existsSync(upstream)) {
    if (fs.existsSync(local)) {
      return { removed: true, cmp: { equal: false, added: 0, removed: 0, files: 1 } }
    }
    return null
  }
  const cmp = comparePaths(local, upstream)
  return cmp.equal ? null : { removed: false, cmp }
}

// ---------------------------------------------------------------------------
// Drift analysis
// ---------------------------------------------------------------------------

function analyzeDrift(manifest, upstreamRoot, source) {
  const { id: sourceId, slug } = source
  const curated = sourceItems(manifest, sourceId)
  const curatedSkills = new Map(
    curated.filter((i) => i.type === 'skill').map((i) => [itemName(i), i]),
  )
  const curatedCommands = new Map(
    curated.filter((i) => i.type === 'command').map((i) => [itemName(i), i]),
  )

  const upSkills = upstreamSkillNames(upstreamRoot)
  const upCommands = source.excludeCommands ? [] : upstreamCommandNames(upstreamRoot)
  const upSkillSet = new Set(upSkills)
  const upCommandSet = new Set(upCommands)

  const drifted = []
  const descriptionChanges = []
  const added = []
  const removed = []
  let totalAdded = 0
  let totalRemoved = 0
  let totalFiles = 0

  function inspect(name, type, manifestItem) {
    const local = localPathFor(slug, name, type)
    const upstream = upstreamPathFor(upstreamRoot, name, type)
    const cmp = comparePaths(local, upstream)
    if (!cmp.equal) {
      drifted.push({ name, type, ...cmp })
      totalAdded += cmp.added
      totalRemoved += cmp.removed
      totalFiles += cmp.files
    }
    if (manifestItem && fs.existsSync(upstream)) {
      const descFile = type === 'skill' ? path.join(upstream, 'SKILL.md') : upstream
      const desc = parseDescription(descFile)
      if (desc && (manifestItem.purpose !== desc || manifestItem.whenToUse !== desc)) {
        descriptionChanges.push({ name, type, description: desc, item: manifestItem })
      }
    }
  }

  for (const name of upSkills) {
    const item = curatedSkills.get(name)
    if (!item) {
      added.push({ name, type: 'skill' })
    } else {
      inspect(name, 'skill', item)
    }
  }

  for (const name of upCommands) {
    const item = curatedCommands.get(name)
    if (!item) {
      added.push({ name, type: 'command' })
    } else {
      inspect(name, 'command', item)
    }
  }

  for (const [name, item] of curatedSkills) {
    if (!upSkillSet.has(name)) {
      removed.push({ name, type: 'skill', item })
    }
  }

  for (const [name, item] of curatedCommands) {
    if (!upCommandSet.has(name)) {
      removed.push({ name, type: 'command', item })
    }
  }

  const shared = inspectSharedSupport(upstreamRoot, slug)
  if (shared?.removed) {
    removed.push({ ...SHARED_SUPPORT })
  } else if (shared) {
    drifted.push({ ...SHARED_SUPPORT, ...shared.cmp })
    totalAdded += shared.cmp.added
    totalRemoved += shared.cmp.removed
    totalFiles += shared.cmp.files
  }

  return {
    drifted,
    descriptionChanges,
    added,
    removed,
    totalAdded,
    totalRemoved,
    totalFiles,
    upSkills,
    upCommands,
  }
}

function hasDrift(report, snapshotRef, headSha) {
  return (
    snapshotRef !== headSha ||
    report.drifted.length > 0 ||
    report.added.length > 0 ||
    report.removed.length > 0
  )
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function formatItemLine(entry) {
  if (entry.added !== undefined) {
    return `- ${entry.type}: \`${entry.name}\` (+${entry.added} -${entry.removed})`
  }
  return `- ${entry.type}: \`${entry.name}\``
}

function printCheckReport(source, headSha, report) {
  const lines = []
  lines.push('# Upstream superpowers sync check')
  lines.push('')
  lines.push(`| | |`)
  lines.push(`|---|---|`)
  lines.push(`| snapshotRef | \`${source.snapshotRef}\` |`)
  lines.push(`| upstream HEAD | \`${headSha}\` |`)
  lines.push(`| retrieved | ${source.retrieved} |`)
  lines.push('')

  if (!hasDrift(report, source.snapshotRef, headSha)) {
    lines.push('No drift detected.')
    console.log(lines.join('\n'))
    return
  }

  if (source.snapshotRef !== headSha) {
    lines.push(`Ref drift: snapshotRef differs from upstream HEAD.`)
    lines.push('')
  }

  lines.push(`## Drifted (${report.drifted.length})`)
  if (report.drifted.length === 0) lines.push('_none_')
  else lines.push(...report.drifted.map(formatItemLine))
  lines.push('')

  lines.push(`## New (${report.added.length})`)
  if (report.added.length === 0) lines.push('_none_')
  else lines.push(...report.added.map(formatItemLine))
  lines.push('')

  lines.push(`## Removed (${report.removed.length})`)
  if (report.removed.length === 0) lines.push('_none_')
  else lines.push(...report.removed.map(formatItemLine))
  lines.push('')

  lines.push('## Diffstat')
  lines.push(`${report.totalFiles} file(s) changed, +${report.totalAdded} -${report.totalRemoved}`)

  console.log(lines.join('\n'))
}

function printApplyReport(source, headSha, actions) {
  const lines = []
  lines.push('# Upstream superpowers sync applied')
  lines.push('')
  lines.push(`| | |`)
  lines.push(`|---|---|`)
  lines.push(`| previous snapshotRef | \`${source.snapshotRef}\` |`)
  lines.push(`| new snapshotRef | \`${actions.newSnapshotRef}\` |`)
  lines.push(`| retrieved | ${actions.newRetrieved} |`)
  lines.push('')

  lines.push(`## Updated (${actions.updated.length})`)
  if (actions.updated.length === 0) lines.push('_none_')
  else {
    for (const u of actions.updated) {
      const bump = u.versionBumped ? ` → v${u.newVersion}` : ''
      lines.push(`- ${u.type}: \`${u.name}\`${bump}${u.descriptionUpdated ? ' (description)' : ''}`)
    }
  }
  lines.push('')

  lines.push(`## Added (${actions.added.length})`)
  if (actions.added.length === 0) lines.push('_none_')
  else lines.push(...actions.added.map((a) => `- ${a.type}: \`${a.name}\``))
  lines.push('')

  lines.push(`## Removed (${actions.removed.length})`)
  if (actions.removed.length === 0) lines.push('_none_')
  else lines.push(...actions.removed.map((r) => `- ${r.type}: \`${r.name}\``))
  lines.push('')

  if (actions.noChanges) {
    lines.push('_No file or manifest changes were required._')
  }

  console.log(lines.join('\n'))
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

function applySync(manifest, upstreamRoot, source, headSha, report) {
  const { slug } = source
  const actions = {
    updated: [],
    added: [],
    removed: [],
    newSnapshotRef: headSha,
    newRetrieved: todayIsoDate(),
    noChanges: false,
  }

  const refChanged = source.snapshotRef !== headSha
  const contentDrift =
    report.drifted.length > 0 ||
    report.added.length > 0 ||
    report.removed.length > 0 ||
    report.descriptionChanges.length > 0

  if (!refChanged && !contentDrift) {
    actions.noChanges = true
    return actions
  }

  for (const entry of report.drifted) {
    const { name, type } = entry
    const dest = type === 'support' ? localSharedSupportPath(slug) : localPathFor(slug, name, type)
    const src =
      type === 'support'
        ? upstreamSharedSupportPath(upstreamRoot)
        : upstreamPathFor(upstreamRoot, name, type)
    removeRecursive(dest)
    copyRecursive(src, dest)

    const item = type === 'support' ? null : findManifestItem(manifest, slug, name, type)
    if (item) {
      const newVersion = patchBump(item.version)
      item.version = newVersion
      item.originUrl = originUrl(name, type, headSha, source.repo)
      item.pinnedRef = headSha
      item.tokenEstimate = tokenEstimateForItem(catalogPathFor(slug, name, type), type)

      const desc = parseDescription(type === 'skill' ? path.join(dest, 'SKILL.md') : dest)
      let descriptionUpdated = false
      if (desc && (item.purpose !== desc || item.whenToUse !== desc)) {
        item.purpose = desc
        item.whenToUse = desc
        descriptionUpdated = true
      }

      actions.updated.push({
        name,
        type,
        versionBumped: true,
        newVersion,
        descriptionUpdated,
      })
    } else if (type === 'support') {
      actions.updated.push({
        name,
        type,
        versionBumped: false,
        descriptionUpdated: false,
      })
    }
  }

  for (const change of report.descriptionChanges) {
    if (actions.updated.some((u) => u.name === change.name && u.type === change.type)) {
      continue
    }
    const item = change.item
    item.purpose = change.description
    item.whenToUse = change.description
    item.originUrl = originUrl(change.name, change.type, headSha, source.repo)
    actions.updated.push({
      name: change.name,
      type: change.type,
      versionBumped: false,
      descriptionUpdated: true,
    })
  }

  for (const entry of report.added) {
    const { name, type } = entry
    const dest = localPathFor(slug, name, type)
    const src = upstreamPathFor(upstreamRoot, name, type)
    copyRecursive(src, dest)
    const catalogPath = catalogPathFor(slug, name, type)
    const descFile = type === 'skill' ? path.join(dest, 'SKILL.md') : dest
    const description = parseDescription(descFile)
    manifest.items.push(newManifestEntry(name, type, catalogPath, description, headSha, source))
    actions.added.push({ name, type })
  }

  for (const entry of report.removed) {
    const { name, type, item } = entry
    if (type === 'support') {
      removeRecursive(localSharedSupportPath(slug))
      actions.removed.push({ name, type })
      continue
    }
    const local = localPathFor(slug, name, type)
    removeRecursive(local)
    manifest.items = manifest.items.filter((i) => i.id !== item.id)
    actions.removed.push({ name, type })
  }

  return actions
}

// ---------------------------------------------------------------------------
// Select mode (curated agents — explicit per-source items[] allowlist)
// ---------------------------------------------------------------------------

export function selectCatalogPath(slug, name, type) {
  if (type === 'skill') return `skills/${slug}/${name}`
  if (type === 'agent') return `agents/${slug}/${name}.md`
  if (type === 'command') return `commands/${slug}/${name}.md`
  throw new Error(`unsupported select type: ${type}`)
}

function selectManifestId(slug, name) {
  return `haus.${slug}-${name}`
}

function selectUpstreamContentPath(upstreamRoot, upstreamPath, type) {
  const upstreamAbs = path.join(upstreamRoot, upstreamPath)
  return type === 'skill' ? path.join(upstreamAbs, 'SKILL.md') : upstreamAbs
}

function selectOriginPath(upstreamPath, type) {
  return type === 'skill' ? `${upstreamPath.replace(/\/+$/, '')}/SKILL.md` : upstreamPath
}

function selectOriginUrl(repo, sha, upstreamPath, type) {
  const base = repo.replace(/\.git$/, '')
  return `${base}/blob/${sha}/${selectOriginPath(upstreamPath, type)}`
}

function findSelectManifestItem(manifest, slug, name, type) {
  const id = selectManifestId(slug, name)
  return manifest.items.find((i) => i.id === id && i.type === type)
}

/**
 * Compare each allowlisted item's local file against its upstream file.
 * Returns the items that differ (need copy + bump) and those whose upstream
 * description has changed. Items missing upstream are flagged as errors —
 * a wrong upstreamPath should fail loudly, not silently skip.
 */
function analyzeSelectDrift(manifest, upstreamRoot, source) {
  const { slug } = source
  const drifted = []
  const descriptionChanges = []
  const missingUpstream = []
  let totalAdded = 0
  let totalRemoved = 0
  let totalFiles = 0

  for (const item of source.items) {
    const { name, upstreamPath, type } = item
    const upstreamAbs = path.join(upstreamRoot, upstreamPath)
    if (!fs.existsSync(upstreamAbs)) {
      missingUpstream.push({ name, type, upstreamPath })
      continue
    }
    const localAbs = path.join(ROOT, selectCatalogPath(slug, name, type))
    const cmp = comparePaths(localAbs, upstreamAbs)
    if (!cmp.equal) {
      drifted.push({ name, type, upstreamPath, ...cmp })
      totalAdded += cmp.added
      totalRemoved += cmp.removed
      totalFiles += cmp.files
    }
    const manifestItem = findSelectManifestItem(manifest, slug, name, type)
    if (manifestItem) {
      const desc = parseDescription(selectUpstreamContentPath(upstreamRoot, upstreamPath, type))
      if (desc && (manifestItem.purpose !== desc || manifestItem.whenToUse !== desc)) {
        descriptionChanges.push({ name, type, upstreamPath, description: desc, item: manifestItem })
      }
    }
  }

  return { drifted, descriptionChanges, missingUpstream, totalAdded, totalRemoved, totalFiles }
}

function hasSelectDrift(report, snapshotRef, headSha) {
  return (
    snapshotRef !== headSha ||
    report.drifted.length > 0 ||
    report.descriptionChanges.length > 0 ||
    report.missingUpstream.length > 0
  )
}

function applySelectSync(manifest, upstreamRoot, source, headSha, report) {
  const { slug } = source
  const actions = {
    updated: [],
    copiedNoEntry: [],
    newSnapshotRef: headSha,
    newRetrieved: todayIsoDate(),
  }

  for (const entry of report.drifted) {
    const { name, upstreamPath, type } = entry
    const src = path.join(upstreamRoot, upstreamPath)
    const dest = path.join(ROOT, selectCatalogPath(slug, name, type))
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    if (type === 'skill') {
      removeRecursive(dest)
      copyRecursive(src, dest)
    } else {
      fs.copyFileSync(src, dest)
    }

    const item = findSelectManifestItem(manifest, slug, name, type)
    if (!item) {
      // Allowlist governs FILES; manifest governs ENTRIES. Never fabricate an entry
      // (tags/gating are human-owned) — copy the file and report the gap.
      actions.copiedNoEntry.push({ name })
      continue
    }
    const newVersion = patchBump(item.version)
    item.version = newVersion
    item.originUrl = selectOriginUrl(source.repo, headSha, upstreamPath, type)
    item.pinnedRef = headSha
    item.tokenEstimate = Math.ceil(
      fs.statSync(selectUpstreamContentPath(upstreamRoot, upstreamPath, type)).size / 4,
    )
    const desc = parseDescription(selectUpstreamContentPath(upstreamRoot, upstreamPath, type))
    let descriptionUpdated = false
    if (desc && (item.purpose !== desc || item.whenToUse !== desc)) {
      item.purpose = desc
      item.whenToUse = desc
      descriptionUpdated = true
    }
    actions.updated.push({ name, type, versionBumped: true, newVersion, descriptionUpdated })
  }

  // Description-only changes (file content identical, frontmatter desc differs from manifest).
  for (const change of report.descriptionChanges) {
    if (actions.updated.some((u) => u.name === change.name && u.type === change.type)) continue
    const item = change.item
    item.purpose = change.description
    item.whenToUse = change.description
    item.originUrl = selectOriginUrl(source.repo, headSha, change.upstreamPath, change.type)
    item.pinnedRef = headSha
    actions.updated.push({
      name: change.name,
      type: change.type,
      versionBumped: false,
      descriptionUpdated: true,
    })
  }

  return actions
}

function printSelectCheckReport(source, headSha, report) {
  const lines = []
  lines.push(`# Upstream select sync check — ${source.id}`)
  lines.push('')
  lines.push(`| | |`)
  lines.push(`|---|---|`)
  lines.push(`| snapshotRef | \`${source.snapshotRef}\` |`)
  lines.push(`| upstream HEAD | \`${headSha}\` |`)
  lines.push(`| retrieved | ${source.retrieved} |`)
  lines.push('')

  if (!hasSelectDrift(report, source.snapshotRef, headSha)) {
    lines.push('In sync.')
    console.log(lines.join('\n'))
    return
  }
  if (source.snapshotRef !== headSha) {
    lines.push('Ref drift: snapshotRef differs from upstream HEAD.')
    lines.push('')
  }
  lines.push(`## Drifted (${report.drifted.length})`)
  if (report.drifted.length === 0) lines.push('_none_')
  else
    lines.push(
      ...report.drifted.map((d) => `- ${d.type}: \`${d.name}\` (+${d.added} -${d.removed})`),
    )
  lines.push('')
  lines.push(`## Description changes (${report.descriptionChanges.length})`)
  if (report.descriptionChanges.length === 0) lines.push('_none_')
  else lines.push(...report.descriptionChanges.map((d) => `- ${d.type}: \`${d.name}\``))
  lines.push('')
  if (report.missingUpstream.length > 0) {
    lines.push(`## Missing upstream (${report.missingUpstream.length})`)
    lines.push(
      ...report.missingUpstream.map((m) => `- \`${m.name}\` → \`${m.upstreamPath}\` not found`),
    )
    lines.push('')
  }
  lines.push('## Diffstat')
  lines.push(`${report.totalFiles} file(s) changed, +${report.totalAdded} -${report.totalRemoved}`)
  console.log(lines.join('\n'))
}

function printSelectApplyReport(source, headSha, actions) {
  const lines = []
  lines.push(`# Upstream select sync applied — ${source.id}`)
  lines.push('')
  lines.push(`| | |`)
  lines.push(`|---|---|`)
  lines.push(`| previous snapshotRef | \`${source.snapshotRef}\` |`)
  lines.push(`| new snapshotRef | \`${actions.newSnapshotRef}\` |`)
  lines.push(`| retrieved | ${actions.newRetrieved} |`)
  lines.push('')
  lines.push(`## Updated (${actions.updated.length})`)
  if (actions.updated.length === 0) lines.push('_none_')
  else {
    for (const u of actions.updated) {
      const bump = u.versionBumped ? ` → v${u.newVersion}` : ''
      lines.push(`- ${u.type}: \`${u.name}\`${bump}${u.descriptionUpdated ? ' (description)' : ''}`)
    }
  }
  lines.push('')
  if (actions.copiedNoEntry.length > 0) {
    lines.push(`## Copied without manifest entry (${actions.copiedNoEntry.length})`)
    lines.push(...actions.copiedNoEntry.map((c) => `- \`${c.name}\` — add a manifest entry`))
    lines.push('')
  }
  console.log(lines.join('\n'))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** mirror mode: full-directory sync of upstream skills/ + commands/. */
function processMirrorSource(source, manifest, state) {
  if (!source.slug) {
    console.error(`ERROR (${source.id}): mirror source missing required \`slug\``)
    process.exit(1)
  }
  let tmpDir
  let headSha
  try {
    assertSnapshotRef(source.snapshotRef)
    ;({ tmpDir, headSha } = cloneUpstream(source.repo))
  } catch (err) {
    console.error(`ERROR (${source.id}): ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
  try {
    const report = analyzeDrift(manifest, tmpDir, source)

    if (checkMode) {
      printCheckReport(source, headSha, report)
      if (hasDrift(report, source.snapshotRef, headSha)) state.drift = true
      return
    }

    try {
      assertMitLicense(tmpDir)
    } catch (err) {
      console.error(`ERROR (${source.id}): ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
    const actions = applySync(manifest, tmpDir, source, headSha, report)

    if (!actions.noChanges) {
      const manifestChanged =
        actions.added.length > 0 ||
        actions.removed.some((r) => r.type !== 'support') ||
        actions.updated.some((u) => u.type !== 'support')
      if (manifestChanged) state.manifestChanged = true
      state.sourcesContent = updateSourcesYaml(
        state.sourcesContent,
        source.id,
        actions.newSnapshotRef,
        actions.newRetrieved,
      )
      state.sourcesChanged = true
    }
    printApplyReport(source, headSha, actions)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

/** select mode: explicit per-source items[] allowlist (curated agents). */
function processSelectSource(source, manifest, state) {
  if (!source.slug) {
    console.error(`ERROR (${source.id}): select source missing required \`slug\``)
    process.exit(1)
  }
  let tmpDir
  let headSha
  try {
    assertSnapshotRef(source.snapshotRef)
    ;({ tmpDir, headSha } = cloneUpstream(source.repo))
  } catch (err) {
    console.error(`ERROR (${source.id}): ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
  try {
    const report = analyzeSelectDrift(manifest, tmpDir, source)

    if (checkMode) {
      printSelectCheckReport(source, headSha, report)
      if (hasSelectDrift(report, source.snapshotRef, headSha)) state.drift = true
      return
    }

    if (report.missingUpstream.length > 0) {
      console.error(
        `ERROR (${source.id}): upstream path(s) not found: ` +
          report.missingUpstream.map((m) => m.upstreamPath).join(', '),
      )
      process.exit(1)
    }
    try {
      assertMitLicense(tmpDir)
    } catch (err) {
      console.error(`ERROR (${source.id}): ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
    const actions = applySelectSync(manifest, tmpDir, source, headSha, report)

    const refChanged = source.snapshotRef !== headSha
    if (actions.updated.length > 0 || actions.copiedNoEntry.length > 0 || refChanged) {
      if (actions.updated.length > 0) state.manifestChanged = true
      state.sourcesContent = updateSourcesYaml(
        state.sourcesContent,
        source.id,
        actions.newSnapshotRef,
        actions.newRetrieved,
      )
      state.sourcesChanged = true
    }
    printSelectApplyReport(source, headSha, actions)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

function main() {
  const sourcesContent = fs.readFileSync(SOURCES_PATH, 'utf8')
  const sources = parseAllSources(sourcesContent)
  const manifest = loadManifest()
  const state = {
    drift: false,
    manifestChanged: false,
    sourcesChanged: false,
    sourcesContent,
  }

  for (const source of sources) {
    if (!source.repo) {
      console.error(`ERROR: sources.yaml missing repo for ${source.id}`)
      process.exit(1)
    }
    if (source.mode === 'select') {
      processSelectSource(source, manifest, state)
    } else {
      processMirrorSource(source, manifest, state)
    }
  }

  if (checkMode) {
    if (state.drift) process.exit(1)
    return
  }

  if (state.manifestChanged) saveManifest(manifest)
  if (state.sourcesChanged) fs.writeFileSync(SOURCES_PATH, state.sourcesContent)
}

const isMain =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main()
}
