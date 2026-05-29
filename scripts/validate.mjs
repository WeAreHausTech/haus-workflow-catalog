#!/usr/bin/env node
/**
 * Standalone catalog validator — no external dependencies, runs with Node.js ≥18.
 * After @haus-tech/haus-workflow is published (P9), CI will switch to:
 *   npm install -g @haus-tech/haus-workflow && haus validate-catalog ./manifest.json
 *
 * Schema (source of truth for CatalogItem shape):
 *   schema/catalog-item.schema.json
 *   schema/manifest.schema.json
 *
 * SYNC REQUIRED: validation rules (forbidden tags, phrases, required sections)
 * must stay in sync with haus-workflow/src/catalog/validation-rules.ts.
 * See EXECUTION-PLAN.md F6 for the sync strategy.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FORBIDDEN_TAGS,
  BANNED_AGENT_PHRASES,
  REQUIRED_SKILL_SECTIONS,
  REQUIRED_AGENT_SECTIONS,
  RISKY_INSTALL_PATTERNS,
  ALLOWED_NPX_PATTERN,
  ANY_NPX_PATTERN,
  HTTP_URL_PATTERN,
  PLACEHOLDER_PATTERN,
} from "./validation-rules.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MANIFEST = path.join(ROOT, "manifest.json");

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;

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

    if (item.type === "skill" || item.type === "agent" || item.type === "template") {
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
        if (item.type === "template") {
          if (!fs.existsSync(abs)) {
            fail(`${item.id}: missing template file ${item.path}`);
          }
        } else if (item.type === "skill") {
          const skillMd = path.join(abs, "SKILL.md");
          if (!fs.existsSync(skillMd)) {
            fail(`${item.id}: missing ${path.relative(ROOT, skillMd)}`);
          } else {
            const text = fs.readFileSync(skillMd, "utf8");
            for (const section of REQUIRED_SKILL_SECTIONS) {
              if (!text.includes(section)) fail(`${item.id}: SKILL.md missing ${section}`);
            }
          }
        } else if (item.type === "agent") {
          if (!fs.existsSync(abs)) {
            fail(`${item.id}: missing agent file ${item.path}`);
          } else {
            const text = fs.readFileSync(abs, "utf8");
            if (!text.startsWith("---")) fail(`${item.id}: agent file missing YAML frontmatter`);
            for (const section of REQUIRED_AGENT_SECTIONS) {
              if (!text.includes(section)) fail(`${item.id}: agent file missing ${section}`);
            }
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
        if (HTTP_URL_PATTERN.test(ref)) {
          fail(`${item.id}: reference uses insecure http:// URL: ${ref}`);
        }
        if (/^https?:\/\//i.test(ref)) continue;
        // For skills: item.path is a directory — resolve refs from that directory.
        // For agents/templates: item.path is a file — resolve refs from its parent directory.
        const base = item.type === "skill"
          ? path.join(ROOT, item.path)
          : path.dirname(path.join(ROOT, item.path));
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
        if (PLACEHOLDER_PATTERN.test(line)) {
          fail(`${rel}:${i + 1}: TODO or placeholder in shipped content`);
        }
        if (RISKY_INSTALL_PATTERNS.some((re) => re.test(line))) {
          fail(`${rel}:${i + 1}: risky install pattern`);
        }
        if (ANY_NPX_PATTERN.test(line) && !ALLOWED_NPX_PATTERN.test(line)) {
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

/**
 * Warn when an item's version is > 1.0.0 but CHANGELOG.md has no mention
 * of that item's id. Soft warning (no failure increment) — first bump may
 * predate this check, but subsequent bumps should always have an entry.
 */
function checkChangelogCoverage(items) {
  const changelogPath = path.join(ROOT, "CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) return;
  const changelog = fs.readFileSync(changelogPath, "utf8");
  for (const item of items) {
    if (!item.version || item.version === "1.0.0") continue;
    // Strip "haus." prefix for readability matching (entries use short names)
    const shortId = item.id.replace(/^haus\./, "");
    if (!changelog.includes(item.id) && !changelog.includes(shortId)) {
      console.warn(`WARN  ${item.id}: version is ${item.version} but no CHANGELOG.md entry found (see README Contributing)`);
    }
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
    checkChangelogCoverage(manifest.items);
    console.log(`Checked ${manifest.items.length} catalog items.`);
  }
}
checkShippedMarkdown();

if (failures > 0) {
  console.error(`\n${failures} validation failure(s).`);
  process.exit(1);
}
console.log("Catalog valid.");
