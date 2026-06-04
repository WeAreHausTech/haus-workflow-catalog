/**
 * Scans the actual shipped catalog content (skills/, agents/) for forbidden patterns
 * driven by validation-rules.json: TODO/PLACEHOLDER markers, risky install commands,
 * disallowed npx (only `npx tsx` allowed), and http:// URLs. Also asserts no manifest
 * item carries a forbidden stack tag.
 *
 * This is a guard over the production rules + production content, not a reimplementation:
 * it reads validation-rules.json and reconstructs the same regexes scripts/validate.mjs uses.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { REPO_ROOT } from './helpers/catalog-fixture.mjs'

const rules = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'validation-rules.json'), 'utf8'))
const toRe = (r) => new RegExp(r.source, r.flags)

const PLACEHOLDER = toRe(rules.placeholderPattern)
const RISKY = rules.riskyInstallPatterns.map(toRe)
const ANY_NPX = toRe(rules.anyNpxPattern)
const ALLOWED_NPX = toRe(rules.allowedNpxPattern)
const HTTP_URL = toRe(rules.httpUrlPattern)
const FORBIDDEN_TAGS = rules.forbiddenTags

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
  for (const dir of ['skills', 'agents']) {
    walkMd(path.join(REPO_ROOT, dir), (file) => {
      const rel = path.relative(REPO_ROOT, file)
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
      lines.forEach((line, i) => {
        const at = `${rel}:${i + 1}`
        if (PLACEHOLDER.test(line)) hits.push(`${at}: placeholder/TODO`)
        if (RISKY.some((re) => re.test(line))) hits.push(`${at}: risky install`)
        if (ANY_NPX.test(line) && !ALLOWED_NPX.test(line)) hits.push(`${at}: disallowed npx`)
        if (HTTP_URL.test(line.trim())) hits.push(`${at}: http:// url`)
      })
    })
  }
  return hits
}

test('no forbidden patterns in shipped skill/agent markdown', () => {
  const hits = scan()
  assert.deepEqual(hits, [], `Forbidden content:\n${hits.join('\n')}`)
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
