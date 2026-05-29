#!/usr/bin/env node
/**
 * Enforces that manifest.json "version" matches the release tag before a GitHub
 * release is created. Without this gate the published manifest.json artifact —
 * which haus CLI consumers download — could advertise the wrong version.
 *
 * Called by: .github/workflows/release.yml, before the catalog is validated or
 * the GitHub Release is created.
 *
 * Usage: node scripts/check-manifest-version.mjs <expected-version>
 * Example: node scripts/check-manifest-version.mjs 2.0.2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const expected = process.argv[2];
if (!expected) {
  console.error("Usage: node scripts/check-manifest-version.mjs <expected-version>");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));

if (manifest.version !== expected) {
  console.error(`FAIL  manifest.json version "${manifest.version}" != release tag "${expected}"`);
  console.error(`      Update manifest.json "version" to "${expected}" before tagging.`);
  process.exit(1);
}

console.log(`OK    manifest.json version ${manifest.version} matches release tag.`);
