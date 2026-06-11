import test from 'node:test'
import assert from 'node:assert/strict'

import {
  findForbiddenTag,
  isSafeCatalogPath,
  missingSkillFrontmatterKeys,
  validateItemSchema,
} from '../scripts/validate.mjs'

test('rejects a skill missing description frontmatter', () => {
  const missing = missingSkillFrontmatterKeys('---\ntitle: x\n---\nbody\n')
  assert.ok(missing.includes('description'))
})

test('rejects a forbidden tag', () => {
  const word = findForbiddenTag({
    id: 'haus.bad',
    tags: ['python'],
  })
  assert.equal(word, 'python')
})

test('rejects path traversal in item.path', () => {
  assert.equal(isSafeCatalogPath('../escape'), false)
  assert.equal(isSafeCatalogPath('skills/ok'), true)
})

test('rejects a schema-invalid type enum', () => {
  const result = validateItemSchema({
    id: 'haus.bad',
    type: 'hook',
    source: 'haus',
    version: '1.0.0',
    path: 'skills/bad',
    tags: [],
    repoRoles: [],
    tokenEstimate: 1,
  })
  assert.equal(result.ok, false)
})

test('accepts a well-formed item', () => {
  const result = validateItemSchema({
    id: 'haus.ok',
    type: 'skill',
    source: 'haus',
    version: '1.0.0',
    path: 'skills/ok',
    title: 'Ok',
    tags: ['workflow'],
    repoRoles: [],
    tokenEstimate: 100,
  })
  assert.equal(result.ok, true)
})
