import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  assertMitLicense,
  assertSnapshotRef,
  extractSourceBlock,
  inspectSharedSupport,
  parseAllSources,
  selectCatalogPath,
} from '../scripts/sync-upstream.mjs'

test('assertMitLicense accepts SPDX MIT license', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-lic-'))
  try {
    fs.writeFileSync(
      path.join(dir, 'LICENSE'),
      'SPDX-License-Identifier: MIT\n\nPermission is hereby granted...\n',
    )
    assert.doesNotThrow(() => assertMitLicense(dir))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('assertMitLicense accepts MIT License title header', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-lic-title-'))
  try {
    fs.writeFileSync(path.join(dir, 'LICENSE'), 'MIT License\n\nCopyright (c) Example\n')
    assert.doesNotThrow(() => assertMitLicense(dir))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('assertSnapshotRef rejects non-SHA refs', () => {
  assert.throws(() => assertSnapshotRef('main'), /40-character git commit SHA/)
  assert.throws(() => assertSnapshotRef('bd000c6; rm -rf /'), /40-character git commit SHA/)
})

test('parseAllSources defaults absent mode to mirror but rejects an unknown mode', () => {
  const ok = parseAllSources('sources:\n  - id: a\n    repo: https://x/a\n')
  assert.equal(ok[0].mode, 'mirror')
  const sel = parseAllSources('sources:\n  - id: a\n    repo: https://x/a\n    mode: select\n')
  assert.equal(sel[0].mode, 'select')
  assert.throws(
    () => parseAllSources('sources:\n  - id: a\n    repo: https://x/a\n    mode: miror\n'),
    /unknown mode "miror"/,
  )
})

test('extractSourceBlock matches the id token exactly, not as a substring', () => {
  // `foo` must not select the `foo-bar` block (substring trap).
  const yaml = [
    'sources:',
    '  - id: foo-bar',
    '    snapshotRef: AAA',
    '  - id: foo',
    '    snapshotRef: BBB',
    '',
  ].join('\n')
  const fooBlock = extractSourceBlock(yaml, 'foo')
  assert.match(fooBlock, /snapshotRef: BBB/)
  assert.ok(!fooBlock.includes('AAA'), 'foo block must not bleed into foo-bar')
  assert.match(extractSourceBlock(yaml, 'foo-bar'), /snapshotRef: AAA/)
})

test('inspectSharedSupport detects drift in skills/shared support files', () => {
  const upstream = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-up-shared-'))
  const localRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-local-shared-'))
  const catalogShared = path.join(localRoot, 'skills/superpowers/shared')
  const upstreamShared = path.join(upstream, 'skills/shared')
  fs.mkdirSync(catalogShared, { recursive: true })
  fs.mkdirSync(upstreamShared, { recursive: true })
  fs.writeFileSync(path.join(catalogShared, 'task-format-reference.md'), 'old\n')
  fs.writeFileSync(path.join(upstreamShared, 'task-format-reference.md'), 'new\n')

  try {
    const result = inspectSharedSupport(upstream, 'superpowers', localRoot)
    assert.equal(result?.removed, false)
    assert.equal(result?.cmp.equal, false)
    assert.ok(result.cmp.files >= 1)
  } finally {
    fs.rmSync(upstream, { recursive: true, force: true })
    fs.rmSync(localRoot, { recursive: true, force: true })
  }
})

test('assertMitLicense rejects ambiguous non-MIT license text', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-lic-bad-'))
  try {
    fs.writeFileSync(path.join(dir, 'LICENSE'), 'This project permits MIT-style use only.\n')
    assert.throws(() => assertMitLicense(dir), /not MIT/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('selectCatalogPath maps skill and agent upstream paths to catalog layout', () => {
  assert.equal(
    selectCatalogPath('ecc', 'frontend-patterns', 'skill'),
    'skills/ecc/frontend-patterns',
  )
  assert.equal(selectCatalogPath('ecc', 'react-reviewer', 'agent'), 'agents/ecc/react-reviewer.md')
  assert.equal(
    selectCatalogPath('superpowers', 'brainstorm', 'command'),
    'commands/superpowers/brainstorm.md',
  )
})

test('parseAllSources normalizes select items with default type agent', () => {
  const sources = parseAllSources(
    'sources:\n  - id: x\n    repo: https://x/a\n    slug: ecc\n    mode: select\n    items:\n      - { name: a, upstreamPath: agents/a.md }\n      - { name: b, type: skill, upstreamPath: skills/b/SKILL.md }\n',
  )
  assert.equal(sources[0].items[0].type, 'agent')
  assert.equal(sources[0].items[1].type, 'skill')
})
