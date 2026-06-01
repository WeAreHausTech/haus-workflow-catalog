#!/usr/bin/env node
/**
 * Align package.json#version with manifest.json before release-it bumps.
 * manifest.json is the catalog release version; package.json is private metadata.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'))
const packagePath = path.join(ROOT, 'package.json')
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

if (pkg.version === manifest.version) {
  process.exit(0)
}

pkg.version = manifest.version
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`Aligned package.json version → ${manifest.version} (from manifest.json)`)
