/**
 * Every skill/agent/template path in the REAL manifest resolves on disk.
 * references[] entries (when present) must be https:// URLs only — relative paths
 * are not listed in the manifest; bundled files live under item.path.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { REPO_ROOT } from './helpers/catalog-fixture.mjs'

const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8'))

test('every skill path has a SKILL.md on disk', () => {
  for (const item of manifest.items.filter((i) => i.type === 'skill')) {
    const skillMd = path.join(REPO_ROOT, item.path, 'SKILL.md')
    assert.ok(fs.existsSync(skillMd), `${item.id}: missing ${item.path}/SKILL.md`)
  }
})

test('every agent/template file exists on disk', () => {
  for (const item of manifest.items.filter((i) => i.type === 'agent' || i.type === 'template')) {
    const abs = path.join(REPO_ROOT, item.path)
    assert.ok(fs.existsSync(abs), `${item.id}: missing file ${item.path}`)
  }
})

test('references entries are https URLs or absent', () => {
  for (const item of manifest.items) {
    for (const ref of item.references ?? []) {
      assert.ok(!/^http:\/\//i.test(ref), `${item.id}: insecure http:// reference: ${ref}`)
      assert.ok(
        ref.startsWith('https://'),
        `${item.id}: references[] must be https:// only (got relative or invalid): ${ref}`,
      )
    }
  }
})

test('llms.txt feeds live in manifest references only, not synced catalog files', () => {
  const hits = []
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'llms.txt') hits.push(path.relative(REPO_ROOT, full))
    }
  }
  for (const dir of ['skills', 'agents', 'commands', 'templates']) {
    const abs = path.join(REPO_ROOT, dir)
    if (fs.existsSync(abs)) walk(abs)
  }
  assert.deepEqual(
    hits,
    [],
    `llms.txt must not be synced into catalog tree — use manifest references[] (${hits.join(', ')})`,
  )
})
