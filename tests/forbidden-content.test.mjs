/**
 * Scans shipped catalog markdown (skills/, agents/, templates/, commands/) for safety
 * violations driven by validation-rules.json: risky install commands, disallowed npx
 * (only `npx tsx` allowed), and http:// URLs. Mirrors the production repo-wide walk,
 * which does not flag TODO/placeholder prose. Also asserts no manifest item carries a
 * forbidden stack tag.
 *
 * This is a guard over the production rules + production content, not a reimplementation:
 * it reads validation-rules.json and reconstructs the same regexes scripts/validate.mjs uses.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { extractFrontmatterDescription } from '../scripts/forbidden-content.mjs'
import { REPO_ROOT } from './helpers/catalog-fixture.mjs'

const rules = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'validation-rules.json'), 'utf8'))
const toRe = (r) => new RegExp(r.source, r.flags)

const RISKY = rules.riskyInstallPatterns.map(toRe)
const ANY_NPX = toRe(rules.anyNpxPattern)
const ALLOWED_NPX = toRe(rules.allowedNpxPattern)
const FORBIDDEN_TAGS = rules.forbiddenTags
const NPX_TSX_ONLY_EXEMPT_TYPES = rules.npxTsxOnlyExemptTypes ?? []
const DIR_ITEM_TYPE = {
  skills: 'skill',
  agents: 'agent',
  templates: 'template',
  commands: 'command',
}

const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8'))

function walkMd(dir, fn) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, fn)
    else if (entry.name.endsWith('.md')) fn(full)
  }
}

function scan() {
  const hits = []
  for (const dir of ['skills', 'agents', 'templates', 'commands']) {
    // The "only npx tsx" rule is waived for exempt item types (agents — AI-instruction
    // prose). Risky-install patterns are never waived (asserted separately below).
    const checkNonTsxNpx = !NPX_TSX_ONLY_EXEMPT_TYPES.includes(DIR_ITEM_TYPE[dir])
    walkMd(path.join(REPO_ROOT, dir), (file) => {
      const rel = path.relative(REPO_ROOT, file).replace(/\\/g, '/')
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
      lines.forEach((line, i) => {
        const at = `${rel}:${i + 1}`
        // Safety scan only — mirrors the production repo-wide walk, which no longer flags
        // TODO/placeholder prose (an authoring guard, enforced per shipped item instead).
        if (RISKY.some((re) => re.test(line))) hits.push(`${at}: risky install`)
        if (checkNonTsxNpx && ANY_NPX.test(line) && !ALLOWED_NPX.test(line)) {
          hits.push(`${at}: disallowed npx`)
        }
        // httpUrlPattern is anchored (^http://) for validating standalone ref strings;
        // in shipped markdown we want to catch http:// anywhere in the line (inline links),
        // but allow local dev URLs (localhost / 127.0.0.1) which appear in command examples.
        if (/http:\/\/(?!localhost|127\.0\.0\.1)/i.test(line)) hits.push(`${at}: http:// url`)
      })
    })
  }
  return hits
}

test('no forbidden patterns in shipped markdown (repo-wide safety walk)', () => {
  const hits = scan()
  assert.deepEqual(hits, [], `Forbidden content:\n${hits.join('\n')}`)
})

test('risky-install patterns are still blocked in exempt (agent) content', () => {
  // The npx-tsx waiver must NOT waive the genuinely dangerous auto-install patterns.
  const risky = 'Run npx -y some-package to bootstrap.'
  assert.ok(
    RISKY.some((re) => re.test(risky)),
    'npx -y must match a risky-install pattern',
  )
  // A benign tool call is the case the waiver intentionally allows for agents.
  const benign = 'Run npx playwright test to verify.'
  assert.ok(ANY_NPX.test(benign) && !ALLOWED_NPX.test(benign), 'npx playwright is non-tsx npx')
  assert.ok(!RISKY.some((re) => re.test(benign)), 'npx playwright is not a risky-install pattern')
})

test('agent is the only npx-tsx-exempt type (guards over-broad waiver)', () => {
  assert.deepEqual(NPX_TSX_ONLY_EXEMPT_TYPES, ['agent'])
})

test('extractFrontmatterDescription reads folded YAML block scalars', () => {
  const md = `---
name: demo
description: >-
  Use when doing multi-line description work.
other: x
---
`
  assert.match(extractFrontmatterDescription(md), /multi-line description/)
})

test('extractFrontmatterDescription reads literal block scalars and header variants', () => {
  const literal = `---
description: |
  Line one
  Line two
---
`
  assert.match(extractFrontmatterDescription(literal), /Line one.*Line two/)

  const comment = `---
description: >- # folded with comment
  Commented header body.
---
`
  assert.match(extractFrontmatterDescription(comment), /Commented header body/)

  const indent = `---
description: >2
  Indented block body.
---
`
  assert.match(extractFrontmatterDescription(indent), /Indented block body/)
})

test('extractFrontmatterDescription returns empty for bare description key', () => {
  const md = `---
name: demo
description:
  should not be consumed
other: x
---
`
  assert.equal(extractFrontmatterDescription(md), '')
})

test('no manifest item carries a forbidden stack tag', () => {
  const bad = []
  for (const item of manifest.items) {
    const blob = `${item.id} ${(item.tags ?? []).join(' ')}`.toLowerCase()
    for (const word of FORBIDDEN_TAGS) {
      if (blob.includes(word)) bad.push(`${item.id}: "${word}"`)
    }
  }
  assert.deepEqual(bad, [], `Forbidden tags:\n${bad.join('\n')}`)
})
