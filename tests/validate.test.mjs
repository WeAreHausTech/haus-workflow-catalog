import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  findForbiddenTag,
  isSafeCatalogPath,
  missingSkillFrontmatterKeys,
  validateCatalog,
  validateItemSchema,
} from '../scripts/validate.mjs'

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function configManifest(overrides = {}) {
  return {
    version: '1.0.0',
    items: [
      {
        id: 'haus.eslint-config',
        type: 'config',
        source: 'haus',
        version: '1.0.0',
        path: 'configs/eslint/eslint.config.mjs',
        title: 'Haus ESLint config',
        tags: [],
        repoRoles: [],
        tokenEstimate: 0,
        ...overrides,
      },
    ],
  }
}

const configFailures = (manifest) =>
  validateCatalog(REPO_ROOT, manifest).failures.filter((f) => f.includes('haus.eslint-config'))

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
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const result = validateCatalog(root, {
    version: '1.0.0',
    items: [
      {
        id: 'haus.ecc-example',
        type: 'agent',
        source: 'curated',
        version: '1.0.0',
        path: 'agents/ecc/a11y-architect.md',
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

test('accepts a config item whose file exists', () => {
  assert.deepEqual(configFailures(configManifest()), [])
})

test('rejects a config item whose path is missing on disk', () => {
  const failures = configFailures(configManifest({ path: 'configs/eslint/does-not-exist.mjs' }))
  assert.ok(failures.some((f) => f.includes('missing config path')))
})

test('rejects a config item not under configs/', () => {
  const failures = configFailures(configManifest({ path: 'eslint.config.mjs' }))
  assert.ok(failures.some((f) => f.includes('must live under configs/')))
})

test('rejects a config item with non-zero tokenEstimate', () => {
  const failures = configFailures(configManifest({ tokenEstimate: 42 }))
  assert.ok(failures.some((f) => f.includes('tokenEstimate: 0')))
})

test('accepts a curated item with reviewStatus deprecated', () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const result = validateCatalog(root, {
    version: '1.0.0',
    items: [
      {
        id: 'haus.ecc-deprecated-example',
        type: 'agent',
        source: 'curated',
        version: '1.0.0',
        path: 'agents/ecc/a11y-architect.md',
        title: 'Deprecated Example',
        tags: ['agent'],
        repoRoles: [],
        tokenEstimate: 100,
        reviewStatus: 'deprecated',
        riskLevel: 'low',
        useMode: 'copy',
        license: 'MIT',
        licenseConfidence: 'high',
        originSourceId: 'ecc-affaanm',
        originUrl: 'https://github.com/example/repo/blob/sha/agents/example.md',
        requiresAny: [{ stack: 'typescript' }],
      },
    ],
  })
  const itemFailures = result.failures.filter((f) => f.includes('haus.ecc-deprecated-example'))
  assert.deepEqual(itemFailures, [])
})
