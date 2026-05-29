#!/usr/bin/env node
/**
 * Verify manifest.json top-level version matches the expected version string.
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
