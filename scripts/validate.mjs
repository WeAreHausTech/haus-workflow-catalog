#!/usr/bin/env node
/**
 * Standalone catalog validator — runs with Node.js ≥18.
 * Catches structural, content, and filesystem consistency errors in manifest.json
 * and the skill/agent/template files it references.
 *
 * Exists as a standalone Node.js script (no haus CLI required) so that CI can
 * run validation during repo bootstrap and in environments where the CLI is not
 * yet installed. The haus CLI's `validate-catalog` command runs the same checks
 * via the shared validation-rules.mjs constants.
 *
 * Schema (source of truth for CatalogItem shape):
 *   schema/catalog-item.schema.json
 *   schema/manifest.schema.json
 *
 * SYNC REQUIRED: validation rules (forbidden tags, phrases, required sections)
 * must stay in sync with haus-workflow/src/catalog/validation-rules.ts.
 * See EXECUTION-PLAN.md F6 for the sync strategy.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv from 'ajv'

import {
  FORBIDDEN_TAGS,
  REQUIRED_SKILL_FRONTMATTER,
  RISKY_INSTALL_PATTERNS,
  ALLOWED_NPX_PATTERN,
  ANY_NPX_PATTERN,
  HTTP_URL_PATTERN,
  PLACEHOLDER_PATTERN,
  NPX_TSX_ONLY_EXEMPT_TYPES,
  auditDisallowedTags,
} from './validation-rules.mjs'
import {
  auditForbiddenTagsInText,
  auditMarkdownLines,
  extractFrontmatterValue,
} from './forbidden-content.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const MANIFEST = path.join(ROOT, 'manifest.json')
const SCHEMA_DIR = path.join(ROOT, 'schema')

// Slightly broader than the schema pattern: allows pre-release (-rc.1) and build
// metadata (+001) so release candidates can be validated before the tag is cut.
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/

const catalogItemSchema = JSON.parse(
  fs.readFileSync(path.join(SCHEMA_DIR, 'catalog-item.schema.json'), 'utf8'),
)
const manifestSchema = JSON.parse(
  fs.readFileSync(path.join(SCHEMA_DIR, 'manifest.schema.json'), 'utf8'),
)
const ajv = new Ajv({ allErrors: true })
ajv.addSchema(catalogItemSchema)
const validateManifest = ajv.compile(manifestSchema)
const validateCatalogItem = ajv.compile(catalogItemSchema)

/** Reject path traversal in catalog item paths. */
export function isSafeCatalogPath(itemPath) {
  if (!itemPath || path.isAbsolute(itemPath) || itemPath.includes('\\')) return false
  const normalized = path.normalize(itemPath)
  return !normalized.startsWith('..') && !normalized.includes('/..')
}

/** Returns the first forbidden stack/tag word found on an item, or null. */
export function findForbiddenTag(item) {
  const tagBlob = `${item.id} ${(item.tags ?? []).join(' ')}`.toLowerCase()
  for (const word of FORBIDDEN_TAGS) {
    if (tagBlob.includes(word)) return word
  }
  return null
}

/** Required skill frontmatter keys missing from `text`. */
export function missingSkillFrontmatterKeys(text) {
  const missing = []
  for (const key of REQUIRED_SKILL_FRONTMATTER) {
    if (!extractFrontmatterValue(text, key)) missing.push(key)
  }
  return missing
}

/** Validate a single manifest item against catalog-item.schema.json. */
export function validateItemSchema(item) {
  if (validateCatalogItem(item)) return { ok: true }
  return { ok: false, errors: validateCatalogItem.errors ?? [] }
}

let failures = 0

function fail(msg) {
  console.error(`FAIL  ${msg}`)
  failures++
}

// Shared pattern bundle for auditMarkdownLines (skills, agents, templates, commands).
const MARKDOWN_PATTERNS = {
  PLACEHOLDER_PATTERN,
  RISKY_INSTALL_PATTERNS,
  ANY_NPX_PATTERN,
  ALLOWED_NPX_PATTERN,
}

// Every required frontmatter key must be present and non-empty. Key-agnostic so a new
// key added to validation-rules.json#requiredSkillFrontmatter is enforced, not ignored.
// Applied to skills and commands (both ship a `description:` when-signal).
function checkRequiredFrontmatter(text, label) {
  for (const key of REQUIRED_SKILL_FRONTMATTER) {
    if (!extractFrontmatterValue(text, key)) {
      fail(`${label}: missing non-empty frontmatter '${key}:'`)
    }
  }
}

function checkManifest() {
  if (!fs.existsSync(MANIFEST)) {
    fail('manifest.json missing')
    return null
  }
  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  } catch (e) {
    fail(`manifest.json invalid JSON: ${e.message}`)
    return null
  }

  // Schema validates required fields, types, enums, and patterns.
  // Version-pattern errors are filtered: validate.mjs intentionally allows pre-release
  // versions (e.g. 1.0.0-rc.1) that the schema's stricter pattern rejects.
  if (!validateManifest(manifest)) {
    for (const err of validateManifest.errors ?? []) {
      if (err.keyword === 'pattern' && err.instancePath.endsWith('/version')) continue
      const loc = err.instancePath || '(root)'
      const msg = err.params?.missingProperty
        ? `missing required property '${err.params.missingProperty}'`
        : err.message
      fail(`${loc}: ${msg}`)
    }
  }

  return manifest
}

function checkItems(items) {
  const seenIds = new Map()
  // Paths must be globally unique: the CLI uses path as the install target,
  // so two items sharing a path would overwrite each other on install.
  const seenPaths = new Map()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // ajv already reported missing id/type. Guard here prevents confusing downstream errors.
    if (!item.id || !item.type) continue

    if (!item.title) fail(`${item.id}: missing title`)

    // ajv catches missing version; SEMVER_RE allows pre-release versions the schema rejects.
    if (item.version && !SEMVER_RE.test(item.version)) {
      fail(`${item.id}: version "${item.version}" is not valid semver (expected X.Y.Z)`)
    }

    if (seenIds.has(item.id)) {
      fail(`${item.id}: duplicate id (first at index ${seenIds.get(item.id)})`)
    } else {
      seenIds.set(item.id, i)
    }

    if (
      item.type === 'skill' ||
      item.type === 'agent' ||
      item.type === 'template' ||
      item.type === 'command'
    ) {
      if (!item.path) {
        fail(`${item.id}: missing path`)
      } else {
        const norm = item.path.replace(/\\/g, '/')
        if (!isSafeCatalogPath(item.path)) {
          fail(`${item.id}: unsafe path "${item.path}" (path traversal not allowed)`)
        } else if (seenPaths.has(norm)) {
          fail(`${item.id}: path "${norm}" already used by ${seenPaths.get(norm)}`)
        } else {
          seenPaths.set(norm, item.id)
        }
        // Verify path exists on disk
        const abs = path.join(ROOT, item.path)
        if (item.type === 'skill') {
          const skillMd = path.join(abs, 'SKILL.md')
          if (!fs.existsSync(skillMd)) {
            fail(`${item.id}: missing ${path.relative(ROOT, skillMd)}`)
          } else {
            const text = fs.readFileSync(skillMd, 'utf8')
            // Skills declare their when-signal via YAML frontmatter `description:`
            // (the superpowers convention), not prose section headers.
            checkRequiredFrontmatter(text, `${item.id}: SKILL.md`)
            for (const msg of auditForbiddenTagsInText(
              text,
              `${item.id}: ${path.relative(ROOT, skillMd)}`,
            )) {
              fail(msg)
            }
          }
        } else if (item.type === 'agent') {
          if (!fs.existsSync(abs)) {
            fail(`${item.id}: missing agent file ${item.path}`)
          } else {
            const text = fs.readFileSync(abs, 'utf8')
            const rel = path.relative(ROOT, abs)
            checkRequiredFrontmatter(text, `${item.id}: ${rel}`)
            for (const msg of auditForbiddenTagsInText(text, `${item.id}: ${rel}`)) {
              fail(msg)
            }
          }
        } else if (item.type === 'template') {
          if (!fs.existsSync(abs)) {
            fail(`${item.id}: missing template file ${item.path}`)
          } else {
            const text = fs.readFileSync(abs, 'utf8')
            const rel = path.relative(ROOT, abs)
            for (const msg of auditMarkdownLines(text, rel, MARKDOWN_PATTERNS)) {
              fail(msg)
            }
            for (const msg of auditForbiddenTagsInText(text, `${item.id}: ${rel}`)) {
              fail(msg)
            }
          }
        } else if (item.type === 'command') {
          if (!fs.existsSync(abs)) {
            fail(`${item.id}: missing command file ${item.path}`)
          } else {
            const text = fs.readFileSync(abs, 'utf8')
            const rel = path.relative(ROOT, abs)
            // Commands declare their description via frontmatter, same as skills.
            checkRequiredFrontmatter(text, `${item.id}: ${rel}`)
            for (const msg of auditMarkdownLines(text, rel, MARKDOWN_PATTERNS)) {
              fail(msg)
            }
            for (const msg of auditForbiddenTagsInText(text, `${item.id}: ${rel}`)) {
              fail(msg)
            }
          }
        }
      }

      // "haus" source is implicitly trusted. "curated" items additionally require
      // explicit approval — source alone doesn't clear an external item for install.
      if (
        item.source !== 'haus' &&
        !(item.source === 'curated' && item.reviewStatus === 'approved')
      ) {
        fail(`${item.id}: source must be "haus" or curated with reviewStatus "approved"`)
      }

      if (item.references !== undefined && !Array.isArray(item.references)) {
        fail(`${item.id}: references must be an array`)
      } else {
        for (const ref of item.references ?? []) {
          if (typeof ref !== 'string') {
            fail(`${item.id}: references[] entries must be strings`)
            continue
          }
          if (HTTP_URL_PATTERN.test(ref)) {
            fail(`${item.id}: reference uses insecure http:// URL: ${ref}`)
          }
          if (!ref.startsWith('https://')) {
            fail(
              `${item.id}: references[] must be https:// URLs only (bundled files belong under item.path, not references[]): ${ref}`,
            )
          }
        }
      }
    }

    const tagBlob = `${item.id} ${(item.tags ?? []).join(' ')}`.toLowerCase()
    for (const word of FORBIDDEN_TAGS) {
      if (tagBlob.includes(word)) fail(`${item.id}: unsupported stack/tag "${word}"`)
    }
  }

  // Allowlist: every tag must be a known stack, an always-allowed meta tag, or a
  // pattern-suffix convention. Mirrors `haus validate-catalog` so a tag that passes
  // here can never be rejected by the CLI's stricter CI check (the WS1 drift).
  for (const msg of auditDisallowedTags(items)) fail(msg)
}

// Maps a shipped-content directory to the catalog item type it holds, so the
// per-type npx exemption (NPX_TSX_ONLY_EXEMPT_TYPES) can be applied during the walk.
const DIR_ITEM_TYPE = {
  skills: 'skill',
  agents: 'agent',
  templates: 'template',
  commands: 'command',
}

function checkShippedMarkdown() {
  const dirs = ['skills', 'agents', 'templates', 'commands']
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir)
    if (!fs.existsSync(abs)) continue
    // Agent files are AI-instruction prose where `npx <tool>` is legitimate guidance, not a
    // catalog-executed installer — so the "only npx tsx" rule is waived for exempt types.
    // Risky-install patterns (npx -y / dlx) are NOT waived (auditMarkdownLines enforces them
    // regardless of this flag).
    const checkNonTsxNpx = !NPX_TSX_ONLY_EXEMPT_TYPES.includes(DIR_ITEM_TYPE[dir])
    walkMd(abs, (file) => {
      const text = fs.readFileSync(file, 'utf8')
      const rel = path.relative(ROOT, file).replace(/\\/g, '/')
      // Repo-wide safety scan only. The TODO/placeholder check is an authoring-quality
      // guard, not a safety rule, and false-positives on legitimate prose (guidance text
      // discussing TODOs, CSS `.placeholder`), so it is disabled here — per-item shipped
      // template/command audits still enforce it.
      for (const msg of auditMarkdownLines(text, rel, MARKDOWN_PATTERNS, {
        checkPlaceholder: false,
        checkNonTsxNpx,
      })) {
        fail(msg)
      }
      if (!rel.includes('/references/')) {
        for (const msg of auditForbiddenTagsInText(text, rel)) {
          fail(msg)
        }
      }
    })
  }
}

/**
 * The shipped workflow standard (`templates/agentic-workflow-standard.md`) and this
 * repo's own copy (`.claude/WORKFLOW.md`) must be byte-identical — the latter is the
 * former applied to this repo. A mismatch means an edit landed in one but not the other.
 */
function checkWorkflowDocSync() {
  const template = path.join(ROOT, 'templates', 'agentic-workflow-standard.md')
  const local = path.join(ROOT, '.claude', 'WORKFLOW.md')
  // A missing file is itself a failure — silently returning would mask real drift.
  for (const f of [template, local]) {
    if (!fs.existsSync(f)) {
      fail(`workflow doc sync check: ${path.relative(ROOT, f)} is missing`)
      return
    }
  }
  // Byte comparison (Buffer.equals), not decoded-string: catches differences in
  // line endings or trailing bytes that a UTF-8 string compare could normalise away.
  if (!fs.readFileSync(template).equals(fs.readFileSync(local))) {
    fail(
      '.claude/WORKFLOW.md is out of sync with templates/agentic-workflow-standard.md. ' +
        'Copy the template over it: cp templates/agentic-workflow-standard.md .claude/WORKFLOW.md',
    )
  }
}

function walkMd(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, fn)
    else if (entry.name.endsWith('.md')) fn(full)
  }
}

const isMain =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  // checkItems depends on a valid manifest.
  // checkShippedMarkdown is independent — runs even when manifest is broken
  // so all failures surface in a single pass.
  const manifest = checkManifest()
  if (manifest) {
    // ajv reports missing version; SEMVER_RE check covers the broader pre-release form.
    if (manifest.version && !SEMVER_RE.test(manifest.version)) {
      fail(`manifest.json: top-level "version" is not valid semver (expected X.Y.Z or X.Y.Z-pre)`)
    }
    if (Array.isArray(manifest.items)) {
      checkItems(manifest.items)
      console.log(`Checked ${manifest.items.length} catalog items.`)
    }
  }
  checkShippedMarkdown()
  checkWorkflowDocSync()

  if (failures > 0) {
    console.error(`\n${failures} validation failure(s).`)
    process.exit(1)
  }
  console.log('Catalog valid.')
}
