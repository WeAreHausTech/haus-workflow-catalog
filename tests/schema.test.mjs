/**
 * Every item in the REAL manifest.json validates against the catalog-item schema,
 * the manifest validates against the manifest schema, and the manifest round-trips
 * (parse -> stringify -> parse is stable). Uses ajv (already a devDependency).
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import Ajv from 'ajv'

import { REPO_ROOT } from './helpers/catalog-fixture.mjs'

const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8'))
const itemSchema = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'schema', 'catalog-item.schema.json'), 'utf8'),
)
const manifestSchema = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'schema', 'manifest.schema.json'), 'utf8'),
)

const ajv = new Ajv({ allErrors: true })
ajv.addSchema(itemSchema)
const validateManifest = ajv.compile(manifestSchema)
const validateItem = ajv.getSchema(itemSchema.$id)

test('real manifest validates against manifest.schema.json', () => {
  const ok = validateManifest(manifest)
  assert.ok(ok, JSON.stringify(validateManifest.errors, null, 2))
})

test('every item validates against catalog-item.schema.json', () => {
  for (const item of manifest.items) {
    const ok = validateItem(item)
    assert.ok(ok, `${item.id}: ${JSON.stringify(validateItem.errors)}`)
  }
})

test('manifest has at least one item and a semver version', () => {
  assert.ok(Array.isArray(manifest.items) && manifest.items.length > 0)
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/)
})

test('manifest round-trips stably (parse -> stringify -> parse)', () => {
  const raw = fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8')
  const once = JSON.stringify(JSON.parse(raw))
  const twice = JSON.stringify(JSON.parse(once))
  assert.equal(once, twice)
})

test('all item ids are unique', () => {
  const ids = manifest.items.map((i) => i.id)
  assert.equal(new Set(ids).size, ids.length)
})
