#!/usr/bin/env node
/**
 * Regenerate CHANGELOG.md auto sections (v2.2.0 → latest tag) from git tags and
 * conventional commits, using the same rules as .release-it.json.
 * Preserves the hand-written legacy block from ## [2.1.0] downward.
 *
 *   node scripts/regenerate-changelog.mjs          # write CHANGELOG.md
 *   node scripts/regenerate-changelog.mjs --check  # exit 1 if file would change
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md')
const RELEASE_IT = path.join(ROOT, '.release-it.json')
const LEGACY_MARK = '## [2.1.0]'
const AUTO_FLOOR = '2.2.0'
const REPO = 'https://github.com/WeAreHausTech/haus-workflow-catalog'

const checkOnly = process.argv.includes('--check')

function git(...args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `git ${args.join(' ')} failed`)
  }
  return result.stdout.trim()
}

function loadReleaseConfig() {
  const plugin = JSON.parse(fs.readFileSync(RELEASE_IT, 'utf8')).plugins[
    '@release-it/conventional-changelog'
  ]
  const typeSections = new Map(
    plugin.preset.types.map(({ type, section, hidden }) => [type, { section, hidden }]),
  )
  const commitFilter = new Function(`return (${plugin.writerOpts.commitFilter})`)()
  return { header: plugin.header, typeSections, commitFilter }
}

function stripTag(tag) {
  return tag.startsWith('v') ? tag.slice(1) : tag
}

function compareSemver(a, b) {
  const pa = stripTag(a).split('.').map(Number)
  const pb = stripTag(b).split('.').map(Number)
  for (let i = 0; i < 3; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

function listAutoTags() {
  const tags = git('tag', '--list', 'v*.*.*', '--sort=-v:refname')
    .split('\n')
    .filter(Boolean)
    .filter((tag) => compareSemver(tag, `v${AUTO_FLOOR}`) >= 0)
  return tags
}

function parseConventional(subject) {
  const match = subject.match(/^(\w+)(?:\(([^)]*)\))?!?:\s*(.+)$/)
  if (!match) return null
  return { type: match[1], scope: match[2] || '', subject: match[3] }
}

function linkifySubject(subject) {
  return subject.replace(/\(#(\d+)\)/g, (_match, num) => `([#${num}](${REPO}/issues/${num}))`)
}

function formatBullet(hash, subject, scope) {
  const short = hash.slice(0, 7)
  const linked = linkifySubject(subject)
  const prefix = scope ? `**${scope}:** ` : ''
  return `- ${prefix}${linked} ([${short}](${REPO}/commit/${hash}))`
}

function commitsBetween(prevTag, tag, commitFilter, typeSections) {
  const raw = git('log', `${prevTag}..${tag}`, '--no-merges', '--format=%H%x09%s')
  if (!raw) return []
  const commits = []
  for (const line of raw.split('\n')) {
    const tab = line.indexOf('\t')
    if (tab < 0) continue
    const hash = line.slice(0, tab)
    const subject = line.slice(tab + 1)
    const parsed = parseConventional(subject)
    if (!parsed) continue
    const meta = typeSections.get(parsed.type)
    if (!meta || meta.hidden) continue
    if (!commitFilter({ type: parsed.type, scope: parsed.scope })) continue
    commits.push({ ...parsed, hash, section: meta.section })
  }
  return commits
}

function tagDate(tag) {
  return git('log', '-1', '--format=%cs', tag)
}

function renderRelease(tag, prevTag, commits) {
  const version = stripTag(tag)
  const prev = stripTag(prevTag)
  const lines = [`## [${version}](${REPO}/compare/v${prev}...${tag}) (${tagDate(tag)})`, '']
  if (commits.length === 0) return lines.join('\n')

  const grouped = new Map()
  for (const commit of commits) {
    if (!grouped.has(commit.section)) grouped.set(commit.section, [])
    grouped.get(commit.section).push(commit)
  }

  for (const section of ['Added', 'Fixed', 'Changed']) {
    const items = grouped.get(section)
    if (!items?.length) continue
    lines.push(`### ${section}`, '')
    for (const item of items) {
      lines.push(formatBullet(item.hash, item.subject, item.scope))
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

function extractLegacy(existing) {
  const idx = existing.indexOf(LEGACY_MARK)
  if (idx < 0) {
    throw new Error(`Legacy marker ${LEGACY_MARK} not found in CHANGELOG.md`)
  }
  return existing.slice(idx).trimEnd()
}

function generate() {
  const { header, typeSections, commitFilter } = loadReleaseConfig()
  const tags = listAutoTags()
  const sections = []

  for (let i = 0; i < tags.length; i += 1) {
    const tag = tags[i]
    const prevTag = tags[i + 1] ?? null
    if (!prevTag) {
      // v2.2.0 compares against the newest tag below the auto floor.
      const below = git('tag', '--list', 'v*.*.*', '--sort=-v:refname')
        .split('\n')
        .filter(Boolean)
        .find((candidate) => compareSemver(candidate, tag) < 0)
      if (!below) throw new Error(`No previous tag found for ${tag}`)
      sections.push(
        renderRelease(tag, below, commitsBetween(below, tag, commitFilter, typeSections)),
      )
      continue
    }
    sections.push(
      renderRelease(tag, prevTag, commitsBetween(prevTag, tag, commitFilter, typeSections)),
    )
  }

  const legacy = extractLegacy(fs.readFileSync(CHANGELOG, 'utf8'))
  return `${header.trimEnd()}\n\n${sections.join('\n\n')}\n\n${legacy}\n`
}

const next = generate()
if (checkOnly) {
  const current = fs.readFileSync(CHANGELOG, 'utf8')
  if (current !== next) {
    console.error('CHANGELOG.md is out of date. Run: yarn changelog:regenerate')
    process.exit(1)
  }
  console.log('CHANGELOG.md is up to date.')
  process.exit(0)
}

fs.writeFileSync(CHANGELOG, next)
console.log('Regenerated CHANGELOG.md from git tags (v2.2.0 → latest).')
