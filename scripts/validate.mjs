#!/usr/bin/env node
/**
 * Standalone catalog validator — no external dependencies, runs with Node.js ≥18.
 * After @haus-tech/haus-workflow is published (P9), CI will switch to:
 *   npm install -g @haus-tech/haus-workflow && haus validate-catalog ./manifest.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MANIFEST = path.join(ROOT, "manifest.json");

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;

const FORBIDDEN_TAGS = [
  "python", "django", "go", "rust", "java", "spring", "kotlin",
  "swift", "android", "flutter", "dart", "c++", "perl", "defi", "trading",
];

const BANNED_AGENT_PHRASES = [
  "autonomous", "swarm", "delegate", "orchestrat", "marketplace",
];

let failures = 0;

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  failures++;
}

function checkManifest() {
  if (!fs.existsSync(MANIFEST)) {
    fail("manifest.json missing");
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch (e) {
    fail(`manifest.json invalid JSON: ${e.message}`);
    return null;
  }
}

function checkItems(items) {
  const seenIds = new Map();
  const seenPaths = new Map();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.id) { fail(`item[${i}]: missing id`); continue; }
    if (!item.type) { fail(`${item.id}: missing type`); continue; }
    if (!item.version) {
      fail(`${item.id}: missing version`);
    } else if (!SEMVER_RE.test(item.version)) {
      fail(`${item.id}: version "${item.version}" is not valid semver (expected X.Y.Z)`);
    }
    if (!item.source) fail(`${item.id}: missing source`);
    if (!item.title) fail(`${item.id}: missing title`);

    if (seenIds.has(item.id)) {
      fail(`${item.id}: duplicate id (first at index ${seenIds.get(item.id)})`);
    } else {
      seenIds.set(item.id, i);
    }

    if (item.type === "skill" || item.type === "agent") {
      if (!item.path) {
        fail(`${item.id}: missing path`);
      } else {
        const norm = item.path.replace(/\\/g, "/");
        if (seenPaths.has(norm)) {
          fail(`${item.id}: path "${norm}" already used by ${seenPaths.get(norm)}`);
        } else {
          seenPaths.set(norm, item.id);
        }
        // Verify path exists on disk
        const abs = path.join(ROOT, item.path);
        if (item.type === "skill") {
          const skillMd = path.join(abs, "SKILL.md");
          if (!fs.existsSync(skillMd)) {
            fail(`${item.id}: missing ${path.relative(ROOT, skillMd)}`);
          } else {
            const text = fs.readFileSync(skillMd, "utf8");
            if (!text.includes("## Use when")) fail(`${item.id}: SKILL.md missing ## Use when`);
            if (!text.includes("## Do not use when")) fail(`${item.id}: SKILL.md missing ## Do not use when`);
          }
        } else if (item.type === "agent") {
          if (!fs.existsSync(abs)) {
            fail(`${item.id}: missing agent file ${item.path}`);
          } else {
            const text = fs.readFileSync(abs, "utf8");
            if (!text.startsWith("---")) fail(`${item.id}: agent file missing YAML frontmatter`);
            if (!text.includes("## Use when")) fail(`${item.id}: agent file missing ## Use when`);
            if (!text.includes("## Do not use when")) fail(`${item.id}: agent file missing ## Do not use when`);
            if (!text.includes("## Verification")) fail(`${item.id}: agent file missing ## Verification`);
            const lower = text.toLowerCase();
            for (const ban of BANNED_AGENT_PHRASES) {
              if (lower.includes(ban)) fail(`${item.id}: agent file contains disallowed phrase "${ban}"`);
            }
          }
        }
      }

      if (item.source !== "haus" && !(item.source === "curated" && item.reviewStatus === "approved")) {
        fail(`${item.id}: source must be "haus" or curated with reviewStatus "approved"`);
      }

      for (const ref of item.references ?? []) {
        if (/^http:\/\//i.test(ref)) {
          fail(`${item.id}: reference uses insecure http:// URL: ${ref}`);
        }
        if (/^https?:\/\//i.test(ref)) continue;
        const base = item.type === "agent"
          ? path.dirname(path.join(ROOT, item.path))
          : path.join(ROOT, item.path);
        const refAbs = path.resolve(base, ref);
        if (!fs.existsSync(refAbs)) {
          fail(`${item.id}: reference does not exist: ${ref}`);
        }
      }
    }

    const tagBlob = `${item.id} ${(item.tags ?? []).join(" ")}`.toLowerCase();
    for (const word of FORBIDDEN_TAGS) {
      if (tagBlob.includes(word)) fail(`${item.id}: unsupported stack/tag "${word}"`);
    }
  }
}

function checkShippedMarkdown() {
  const dirs = ["skills", "agents"];
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    walkMd(abs, (file) => {
      const text = fs.readFileSync(file, "utf8");
      const rel = path.relative(ROOT, file);
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? "";
        if (/\bTODO\b|\bPLACEHOLDER\b/i.test(line)) {
          fail(`${rel}:${i + 1}: TODO or placeholder in shipped content`);
        }
        if (/\bnpx\s+-y\b|\bnpx\s+--yes\b|\byarn\s+dlx\b|\bpnpm\s+dlx\b/i.test(line)) {
          fail(`${rel}:${i + 1}: risky install pattern`);
        }
        if (/\bnpx\s+(?!tsx\b)\S+/i.test(line)) {
          fail(`${rel}:${i + 1}: disallowed npx (only npx tsx allowed)`);
        }
      }
    });
  }
}

function walkMd(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMd(full, fn);
    else if (entry.name.endsWith(".md")) fn(full);
  }
}

// Run
const manifest = checkManifest();
if (manifest) {
  if (!manifest.version || !SEMVER_RE.test(manifest.version)) {
    fail(`manifest.json: top-level "version" missing or not valid semver`);
  }
  if (!Array.isArray(manifest.items)) {
    fail("manifest.json: missing or invalid 'items' array");
  } else {
    checkItems(manifest.items);
    console.log(`Checked ${manifest.items.length} catalog items.`);
  }
}
checkShippedMarkdown();

if (failures > 0) {
  console.error(`\n${failures} validation failure(s).`);
  process.exit(1);
}
console.log("Catalog valid.");
