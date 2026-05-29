#!/usr/bin/env node
/**
 * Prevents catalog items from shipping with stale version numbers after their
 * source files change. Runs on every PR to catch missed bumps early — far better
 * than discovering a stale version after a release tag is already cut.
 *
 * Called by: .github/workflows/validate.yml (pull_request events only).
 *
 * Usage: node scripts/check-item-versions.mjs <base-ref>
 * Example: node scripts/check-item-versions.mjs origin/main
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const baseRef = process.argv[2]
if (!baseRef) {
  console.error('Usage: node scripts/check-item-versions.mjs <base-ref>')
  process.exit(1)
}

// Three-dot diff: all commits reachable from HEAD but not from baseRef.
// Handles multi-commit PRs correctly — two-dot (..) would miss commits
// not directly between base and HEAD in a non-linear history.
const changedFiles = execSync(`git diff --name-only ${baseRef}...HEAD`, { cwd: ROOT })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

if (!changedFiles.length) {
  console.log('No changed files — skipping item version check.')
  process.exit(0)
}

// Load base manifest for version comparison
let baseManifest
try {
  baseManifest = JSON.parse(execSync(`git show ${baseRef}:manifest.json`, { cwd: ROOT }).toString())
} catch {
  console.log('Base manifest not found — skipping item version check.')
  process.exit(0)
}

const currentManifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'))

const baseVersions = new Map(
  (baseManifest.items ?? []).filter((i) => i.path).map((i) => [i.path, i.version]),
)

let failures = 0

for (const item of currentManifest.items ?? []) {
  if (!item.path) continue

  const baseVersion = baseVersions.get(item.path)
  if (baseVersion === undefined) continue // new item — semver format enforced by validate.mjs instead

  // Check if any file under this item's path changed
  const prefix = item.path.replace(/\\/g, '/')
  const touched = changedFiles.some((f) => {
    const nf = f.replace(/\\/g, '/')
    return nf === prefix || nf.startsWith(prefix + '/')
  })

  if (!touched) continue

  if (item.version === baseVersion) {
    console.error(
      `FAIL  ${item.id}: source files changed but version still ${item.version} — bump it in manifest.json`,
    )
    failures++
  } else {
    console.log(`OK    ${item.id}: ${baseVersion} → ${item.version}`)
  }
}

if (failures > 0) {
  console.error(`\n${failures} item(s) need a version bump in manifest.json.`)
  process.exit(1)
}

console.log('All modified items have bumped versions.')
