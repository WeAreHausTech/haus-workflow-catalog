import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { assertMitLicense, assertSnapshotRef } from '../scripts/sync-upstream.mjs'

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

test('assertMitLicense rejects ambiguous non-MIT license text', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'haus-lic-bad-'))
  try {
    fs.writeFileSync(path.join(dir, 'LICENSE'), 'This project permits MIT-style use only.\n')
    assert.throws(() => assertMitLicense(dir), /not MIT/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
