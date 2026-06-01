#!/usr/bin/env node
/**
 * Sync manifest.json#version after release-it bumps package.json.
 * Used by .release-it.json hooks.after:bump
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const version = process.argv[2]

if (!version) {
  console.error('Usage: node scripts/sync-manifest-version.mjs <version>')
  process.exit(1)
}

const manifestPath = path.join(ROOT, 'manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
manifest.version = version
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

const check = spawnSync(process.execPath, ['scripts/check-manifest-version.mjs', version], {
  cwd: ROOT,
  stdio: 'inherit',
})
process.exit(check.status ?? 1)
