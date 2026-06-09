#!/usr/bin/env node
/**
 * Version sync for the release flow. manifest.json is the catalog's release version;
 * package.json is private metadata that mirrors it. Used by .release-it.json hooks.
 *
 *   node scripts/sync-version.mjs align            # before:bump — package.json ← manifest.json
 *   node scripts/sync-version.mjs write <version>  # after:bump  — manifest.json ← <version>, then verify
 *
 * The post-write verification delegates to check-manifest-version.mjs (the tag gate),
 * which stays a separate script so release.yml can invoke it independently.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const MANIFEST = path.join(ROOT, 'manifest.json')
const PACKAGE = path.join(ROOT, 'package.json')

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const writeJson = (p, obj) => fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`)

const mode = process.argv[2]

if (mode === 'align') {
  // Make package.json match manifest.json before release-it computes the next bump.
  const manifest = readJson(MANIFEST)
  const pkg = readJson(PACKAGE)
  if (pkg.version === manifest.version) process.exit(0)
  pkg.version = manifest.version
  writeJson(PACKAGE, pkg)
  console.log(`Aligned package.json version → ${manifest.version} (from manifest.json)`)
  process.exit(0)
}

if (mode === 'write') {
  // Write the freshly bumped version back into manifest.json, then verify the tag gate.
  const version = process.argv[3]
  if (!version) {
    console.error('Usage: node scripts/sync-version.mjs write <version>')
    process.exit(1)
  }
  const manifest = readJson(MANIFEST)
  manifest.version = version
  writeJson(MANIFEST, manifest)
  const check = spawnSync(process.execPath, ['scripts/check-manifest-version.mjs', version], {
    cwd: ROOT,
    stdio: 'inherit',
  })
  process.exit(check.status ?? 1)
}

console.error(`Unknown mode "${mode}". Use "align" or "write <version>".`)
process.exit(1)
