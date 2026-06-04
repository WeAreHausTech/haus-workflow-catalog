/**
 * Every skill/agent/template path in the REAL manifest resolves on disk, and every
 * relative `references` entry resolves relative to its item's base (skill dir, or the
 * parent dir of an agent/template file). https:// references are skipped (not on disk).
 *
 * Mirrors the path-resolution logic in scripts/validate.mjs.
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

test('every relative reference resolves on disk', () => {
  for (const item of manifest.items) {
    for (const ref of item.references ?? []) {
      if (/^https?:\/\//i.test(ref)) continue
      const base =
        item.type === 'skill'
          ? path.join(REPO_ROOT, item.path)
          : path.dirname(path.join(REPO_ROOT, item.path))
      const refAbs = path.resolve(base, ref)
      assert.ok(fs.existsSync(refAbs), `${item.id}: reference does not exist: ${ref}`)
    }
  }
})
