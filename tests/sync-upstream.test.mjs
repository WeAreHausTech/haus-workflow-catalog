import assert from 'node:assert/strict'
import { test } from 'node:test'

import { verifyClonedSha } from '../scripts/sync-upstream.mjs'

test('verifyClonedSha accepts matching SHAs', () => {
  const sha = 'bd000c6ec1df53449a74397f55305b22802b9a2b'
  assert.doesNotThrow(() => verifyClonedSha(sha, sha))
})

test('verifyClonedSha refuses when cloned HEAD does not match snapshotRef', () => {
  assert.throws(
    () =>
      verifyClonedSha(
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      ),
    /does not match snapshotRef/,
  )
})
