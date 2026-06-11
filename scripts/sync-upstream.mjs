#!/usr/bin/env node
/**
 * Sync curated superpowers items from upstream pcvelz/superpowers.
 *
 *   node scripts/sync-upstream.mjs          # --check (default): drift report, exit 1 if drift
 *   node scripts/sync-upstream.mjs --check  # same
 *   node scripts/sync-upstream.mjs --apply  # apply deterministic sync rules
 */
import { execSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { extractFrontmatterDescription } from './forbidden-content.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCES_PATH = path.join(ROOT, 'sources.yaml')
const MANIFEST_PATH = path.join(ROOT, 'manifest.json')
const ORIGIN_SOURCE_ID = 'superpowers-pcvelz'
const DEFAULT_WHEN_NOT_TO_USE = 'Do not use when a more specific skill or command applies.'

const args = process.argv.slice(2)
const applyMode = args.includes('--apply')
const checkMode = args.includes('--check') || !applyMode

if (args.some((a) => a.startsWith('-') && a !== '--check' && a !== '--apply')) {
  console.error('Usage: node scripts/sync-upstream.mjs [--check|--apply]')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// YAML / manifest helpers (regex-only YAML parsing per spec)
// ---------------------------------------------------------------------------

function extractSourceBlock(content, sourceId) {
  const lines = content.split('\n')
  const blockLines = []
  let capturing = false
  for (const line of lines) {
    const isItemStart = /^\s*-\s+id:\s*/.test(line)
    if (isItemStart) {
      if (capturing) break
      if (line.includes(sourceId)) {
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

function parseSourcesYaml(content) {
  const block = extractSourceBlock(content, ORIGIN_SOURCE_ID)
  const pick = (key) => {
    const m = block.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm'))
    return m ? m[1].trim() : ''
  }
  return {
    id: ORIGIN_SOURCE_ID,
    repo: pick('repo'),
    license: pick('license'),
    snapshotRef: pick('snapshotRef'),
    retrieved: pick('retrieved'),
    useMode: pick('useMode') || 'copy',
  }
}

function updateSourcesYaml(content, snapshotRef, retrieved) {
  const block = extractSourceBlock(content, ORIGIN_SOURCE_ID)
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

export function cloneUpstream(repoUrl, snapshotRef) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'superpowers-sync-'))
  try {
    execSync(`git init -q`, { cwd: tmpDir, stdio: 'pipe', encoding: 'utf8' })
    execSync(`git remote add origin "${repoUrl}"`, {
      cwd: tmpDir,
      stdio: 'pipe',
      encoding: 'utf8',
    })
    execSync(`git fetch --depth 1 origin ${snapshotRef}`, {
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
  if (headSha !== snapshotRef) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    throw new Error(`cloned HEAD ${headSha} does not match snapshotRef ${snapshotRef}`)
  }
  return { tmpDir, headSha }
}

export function assertMitLicense(upstreamRoot) {
  const licensePath = path.join(upstreamRoot, 'LICENSE')
  if (!fs.existsSync(licensePath)) {
    throw new Error('upstream LICENSE file missing')
  }
  const text = fs.readFileSync(licensePath, 'utf8')
  const hasSpdxMit = /SPDX-License-Identifier:\s*MIT\b/m.test(text)
  const hasMitTitle = /^MIT License/m.test(text)
  if (!hasSpdxMit && !hasMitTitle) {
    throw new Error('upstream license is not MIT (expected SPDX-License-Identifier: MIT)')
  }
}

// ---------------------------------------------------------------------------
// File / directory utilities
// ---------------------------------------------------------------------------

function readFileOrEmpty(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
}

function listFilesRecursive(dir, base = dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
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

function superpowersItems(manifest) {
  return manifest.items.filter((i) => i.originSourceId === ORIGIN_SOURCE_ID)
}

function findManifestItem(manifest, name, type) {
  const id = `haus.superpowers-${name}`
  return manifest.items.find((i) => i.id === id && i.type === type)
}

function newManifestEntry(name, type, itemPath, description, sha, source) {
  const tokenFile =
    type === 'skill' ? path.join(ROOT, itemPath, 'SKILL.md') : path.join(ROOT, itemPath)
  const chars = fs.statSync(tokenFile).size
  return {
    id: `haus.superpowers-${name}`,
    version: '1.0.0',
    source: 'curated',
    type,
    path: itemPath,
    title: `Superpowers ${titleCase(name)}`,
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
    originSourceId: ORIGIN_SOURCE_ID,
    originUrl: originUrl(name, type, sha, source.repo),
    pinnedRef: sha,
    ecosystem: 'superpowers',
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

function localPathFor(name, type) {
  return type === 'skill'
    ? path.join(ROOT, 'skills/superpowers', name)
    : path.join(ROOT, 'commands/superpowers', `${name}.md`)
}

function upstreamPathFor(upstreamRoot, name, type) {
  return type === 'skill'
    ? path.join(upstreamRoot, 'skills', name)
    : path.join(upstreamRoot, 'commands', `${name}.md`)
}

function catalogPathFor(name, type) {
  return type === 'skill' ? `skills/superpowers/${name}` : `commands/superpowers/${name}.md`
}

// ---------------------------------------------------------------------------
// Drift analysis
// ---------------------------------------------------------------------------

function analyzeDrift(manifest, upstreamRoot) {
  const curated = superpowersItems(manifest)
  const curatedSkills = new Map(
    curated.filter((i) => i.type === 'skill').map((i) => [itemName(i), i]),
  )
  const curatedCommands = new Map(
    curated.filter((i) => i.type === 'command').map((i) => [itemName(i), i]),
  )

  const upSkills = upstreamSkillNames(upstreamRoot)
  const upCommands = upstreamCommandNames(upstreamRoot)
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
    const local = localPathFor(name, type)
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
    const dest = localPathFor(name, type)
    const src = upstreamPathFor(upstreamRoot, name, type)
    removeRecursive(dest)
    copyRecursive(src, dest)

    const item = findManifestItem(manifest, name, type)
    if (item) {
      const newVersion = patchBump(item.version)
      item.version = newVersion
      item.originUrl = originUrl(name, type, headSha, source.repo)
      item.pinnedRef = headSha
      item.tokenEstimate = tokenEstimateForItem(catalogPathFor(name, type), type)

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
    const dest = localPathFor(name, type)
    const src = upstreamPathFor(upstreamRoot, name, type)
    copyRecursive(src, dest)
    const catalogPath = catalogPathFor(name, type)
    const descFile = type === 'skill' ? path.join(dest, 'SKILL.md') : dest
    const description = parseDescription(descFile)
    manifest.items.push(newManifestEntry(name, type, catalogPath, description, headSha, source))
    actions.added.push({ name, type })
  }

  for (const entry of report.removed) {
    const { name, type, item } = entry
    const local = localPathFor(name, type)
    removeRecursive(local)
    manifest.items = manifest.items.filter((i) => i.id !== item.id)
    actions.removed.push({ name, type })
  }

  return actions
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const sourcesContent = fs.readFileSync(SOURCES_PATH, 'utf8')
  const source = parseSourcesYaml(sourcesContent)
  if (!source.repo) {
    console.error('ERROR: sources.yaml missing repo for superpowers-pcvelz')
    process.exit(1)
  }

  let tmpDir
  let headSha
  try {
    ;({ tmpDir, headSha } = cloneUpstream(source.repo, source.snapshotRef))
  } catch (err) {
    console.error(`ERROR: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
  try {
    const manifest = loadManifest()
    const report = analyzeDrift(manifest, tmpDir)

    if (checkMode) {
      printCheckReport(source, headSha, report)
      if (hasDrift(report, source.snapshotRef, headSha)) {
        process.exit(1)
      }
      return
    }

    try {
      assertMitLicense(tmpDir)
    } catch (err) {
      console.error(`ERROR: ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
    const actions = applySync(manifest, tmpDir, source, headSha, report)

    if (!actions.noChanges) {
      if (actions.updated.length || actions.added.length || actions.removed.length) {
        saveManifest(manifest)
      }
      const updatedSources = updateSourcesYaml(
        sourcesContent,
        actions.newSnapshotRef,
        actions.newRetrieved,
      )
      fs.writeFileSync(SOURCES_PATH, updatedSources)
    }

    printApplyReport(source, headSha, actions)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

main()
