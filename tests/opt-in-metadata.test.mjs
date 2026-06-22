/**
 * Opt-in metadata contract (P5-0). Role-gated non-default items must carry
 * optInTier + optInGroup so the conversational setup UX can group and offer them.
 * The validator enforces co-presence, a tier enum, baseline exclusion, and that
 * every role-only-gated opt-in item is labelled.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { validateCatalog } from '../scripts/validate.mjs'

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8'))

const TIERS = new Set(['workflow', 'ops', 'review', 'design'])

const isRoleOnlyOptIn = (item) =>
  item.default !== true &&
  Array.isArray(item.requiresAny) &&
  item.requiresAny.length > 0 &&
  item.requiresAny.every((clause) => clause && clause.role)

test('every role-only-gated opt-in item carries optInTier + optInGroup', () => {
  const optIns = manifest.items.filter(isRoleOnlyOptIn)
  assert.ok(optIns.length >= 16, `expected >=16 role-only opt-in items, found ${optIns.length}`)
  for (const item of optIns) {
    assert.ok(TIERS.has(item.optInTier), `${item.id}: missing/invalid optInTier`)
    assert.ok(
      typeof item.optInGroup === 'string' && item.optInGroup.length > 0,
      `${item.id}: missing optInGroup`,
    )
    assert.ok(
      typeof item.purpose === 'string' && item.purpose.length > 0,
      `${item.id}: opt-in item needs a purpose`,
    )
  }
})

test('items sharing a role share an optInGroup label', () => {
  const byRole = new Map()
  for (const item of manifest.items.filter(isRoleOnlyOptIn)) {
    const role = item.requiresAny[0].role
    if (!byRole.has(role)) byRole.set(role, new Set())
    byRole.get(role).add(item.optInGroup)
  }
  for (const [role, groups] of byRole) {
    assert.equal(groups.size, 1, `role ${role} maps to multiple groups: ${[...groups].join(', ')}`)
  }
})

function manifestWith(item) {
  return { version: '1.0.0', items: [{ ...baseAgent, ...item }] }
}

const baseAgent = {
  id: 'haus.ecc-example',
  type: 'agent',
  source: 'curated',
  version: '1.0.0',
  path: 'agents/ecc/refactor-cleaner.md',
  title: 'Example',
  purpose: 'Example purpose.',
  tags: ['agent'],
  repoRoles: [],
  tokenEstimate: 100,
  reviewStatus: 'approved',
  riskLevel: 'low',
  useMode: 'copy',
  license: 'MIT',
  licenseConfidence: 'high',
  originSourceId: 'ecc-affaanm',
  originUrl: 'https://github.com/affaan-m/ECC/blob/sha/agents/example.md',
  ecosystem: 'review',
  default: false,
  requiresAny: [{ role: 'refactor-cleanup' }],
}

const optInFailures = (item) =>
  validateCatalog(REPO_ROOT, manifestWith(item)).failures.filter((f) =>
    f.includes('haus.ecc-example'),
  )

test('rejects optInTier without optInGroup', () => {
  const failures = optInFailures({ optInTier: 'review' })
  assert.ok(failures.some((f) => f.includes('must be set together')))
})

test('rejects an invalid optInTier value', () => {
  const failures = optInFailures({ optInTier: 'nonsense', optInGroup: 'X' })
  assert.ok(failures.some((f) => f.includes('invalid optInTier')))
})

test('rejects opt-in metadata on a baseline (default:true) item', () => {
  const failures = optInFailures({
    default: true,
    requiresAny: undefined,
    optInTier: 'review',
    optInGroup: 'X',
  })
  assert.ok(failures.some((f) => f.includes('must not be default:true')))
})

test('rejects a role-only opt-in item missing optInTier/optInGroup', () => {
  const failures = optInFailures({})
  assert.ok(failures.some((f) => f.includes('missing optInTier/optInGroup')))
})
