import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'

import {
  findForbiddenTag,
  isSafeCatalogPath,
  missingSkillFrontmatterKeys,
  validateCatalog,
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

test('rejects curated item missing provenance fields', () => {
  const result = validateItemSchema({
    id: 'haus.curated-bad',
    type: 'skill',
    source: 'curated',
    version: '1.0.0',
    path: 'skills/bad',
    title: 'Bad',
    tags: ['workflow'],
    repoRoles: [],
    tokenEstimate: 100,
    reviewStatus: 'approved',
    riskLevel: 'low',
  })
  assert.equal(result.ok, false)
})

test('rejects non-default curated item without requiresAny', () => {
  const root = path.join(import.meta.dirname, '..')
  const result = validateCatalog(root, {
    version: '1.0.0',
    items: [
      {
        id: 'haus.ecc-example',
        type: 'agent',
        source: 'curated',
        version: '1.0.0',
        path: 'agents/ecc/example.md',
        title: 'Example',
        tags: ['agent'],
        repoRoles: [],
        tokenEstimate: 100,
        reviewStatus: 'approved',
        riskLevel: 'low',
        useMode: 'copy',
        license: 'MIT',
        licenseConfidence: 'high',
        originSourceId: 'ecc-affaanm',
        originUrl: 'https://github.com/example/repo/blob/sha/agents/example.md',
      },
    ],
  })
  assert.equal(result.ok, false)
  assert.ok(result.failures.some((f) => f.includes('requiresAny')))
})
