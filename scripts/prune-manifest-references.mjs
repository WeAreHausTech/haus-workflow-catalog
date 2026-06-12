#!/usr/bin/env node
/**
 * One-shot helper: keep only https:// entries in manifest references[].
 * Relative paths are redundant after haus-workflow full-tree skill caching.
 *
 * Usage: node scripts/prune-manifest-references.mjs [--write] [--bump-patch]
 * Default: dry-run summary to stdout.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST_PATH = path.join(ROOT, 'manifest.json')

const write = process.argv.includes('--write')
const bumpPatch = process.argv.includes('--bump-patch')

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
let prunedEntries = 0
let clearedItems = 0
let keptHttps = 0

for (const item of manifest.items) {
  const refs = item.references
  if (!refs?.length) continue
  const httpsOnly = refs.filter((ref) => ref.startsWith('https://'))
  prunedEntries += refs.length - httpsOnly.length
  keptHttps += httpsOnly.length
  if (httpsOnly.length === 0) {
    delete item.references
    clearedItems++
  } else {
    item.references = httpsOnly
  }
}

if (bumpPatch) {
  const [major, minor, patch] = manifest.version.split('.').map(Number)
  manifest.version = `${major}.${minor}.${patch + 1}`
}

const summary = {
  version: manifest.version,
  prunedEntries,
  clearedItems,
  keptHttps,
  itemsWithReferences: manifest.items.filter((i) => i.references?.length).length,
}

if (!write) {
  console.log(JSON.stringify(summary, null, 2))
  console.log('Dry run — pass --write to update manifest.json')
  process.exit(0)
}

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(summary, null, 2))
