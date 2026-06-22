#!/usr/bin/env node
/**
 * Shared catalog validation core — used by scripts/validate.mjs and tests.
 * Keep in sync with haus-workflow/src/catalog/validate-core.ts (ADR-0001 pattern).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv from 'ajv'

import {
  auditForbiddenTagsInText,
  auditMarkdownLines,
  extractFrontmatterValue,
} from './forbidden-content.mjs'
import { validateCuratedProvenance, validateReferences } from './manifest-item-fields.mjs'
import {
  ALLOWED_NPX_PATTERN,
  ANY_NPX_PATTERN,
  auditDisallowedTags,
  buildItemPathSourceMap,
  FORBIDDEN_TAGS,
  isNpxTsxOnlyExempt,
  PLACEHOLDER_PATTERN,
  REQUIRED_SKILL_FRONTMATTER,
  resolveMarkdownItemSource,
  RISKY_INSTALL_PATTERNS,
} from './validation-rules.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCHEMA_DIR = path.join(__dirname, '..', 'schema')

const ITEM_SEMVER_RE = /^\d+\.\d+\.\d+$/
const MANIFEST_SEMVER_RE = /^\d+\.\d+\.\d+$/

const ajv = new Ajv({ allErrors: true, strict: false })

const manifestSchema = JSON.parse(
  fs.readFileSync(path.join(SCHEMA_DIR, 'manifest.schema.json'), 'utf8'),
)
const itemSchema = JSON.parse(
  fs.readFileSync(path.join(SCHEMA_DIR, 'catalog-item.schema.json'), 'utf8'),
)
ajv.addSchema(itemSchema)
const validateManifest = ajv.compile(manifestSchema)
const validateItem = ajv.compile(itemSchema)

export function isSafeCatalogPath(itemPath) {
  if (!itemPath || path.isAbsolute(itemPath) || itemPath.includes('\\')) return false
  const normalized = path.normalize(itemPath)
  return !normalized.startsWith('..') && !normalized.includes('/..')
}

export function findForbiddenTag(input) {
  const text =
    typeof input === 'string'
      ? input
      : `${input?.id ?? ''} ${(Array.isArray(input?.tags) ? input.tags : []).join(' ')}`
  const lower = text.toLowerCase()
  for (const word of FORBIDDEN_TAGS) {
    if (lower.includes(word)) return word
  }
  return null
}

export function missingSkillFrontmatterKeys(text) {
  const missing = []
  for (const key of REQUIRED_SKILL_FRONTMATTER) {
    if (!extractFrontmatterValue(text, key)) missing.push(key)
  }
  return missing
}

export function validateItemSchema(item) {
  return { ok: validateItem(item) }
}

function auditForbiddenStacks(items) {
  const failures = []
  for (const item of items) {
    const tags = Array.isArray(item.tags) ? item.tags : []
    const text = `${item.id} ${tags.join(' ')}`.toLowerCase()
    for (const word of FORBIDDEN_TAGS) {
      if (text.includes(word)) failures.push(`${item.id}: unsupported stack/tag "${word}"`)
    }
  }
  return failures
}

function auditCuratedRequiresAny(items) {
  const failures = []
  for (const item of items) {
    if (item.source !== 'curated' || item.default === true) continue
    const requiresAny = item.requiresAny
    if (!Array.isArray(requiresAny) || requiresAny.length === 0) {
      failures.push(`${item.id}: non-default curated item missing requiresAny`)
    }
  }
  return failures
}

const OPT_IN_TIERS = new Set(['workflow', 'ops', 'review', 'design'])

/**
 * Opt-in metadata contract (P5-0). Role-gated non-default items surface in the
 * conversational setup UX grouped by optInGroup, so the pair must be present,
 * consistent, and never on a baseline (default:true) item.
 */
function auditOptInMetadata(items) {
  const failures = []
  for (const item of items) {
    const hasTier = item.optInTier !== undefined
    const hasGroup = item.optInGroup !== undefined

    if (hasTier !== hasGroup) {
      failures.push(`${item.id}: optInTier and optInGroup must be set together`)
    }
    if (hasTier) {
      if (!OPT_IN_TIERS.has(item.optInTier)) {
        failures.push(
          `${item.id}: invalid optInTier "${item.optInTier}" (expected one of ${[...OPT_IN_TIERS].join(', ')})`,
        )
      }
      if (typeof item.optInGroup !== 'string' || item.optInGroup.length === 0) {
        failures.push(`${item.id}: optInGroup must be a non-empty string`)
      }
      if (item.default === true) {
        failures.push(`${item.id}: opt-in items (optInTier set) must not be default:true`)
      }
      if (typeof item.purpose !== 'string' || item.purpose.length === 0) {
        failures.push(`${item.id}: opt-in items (optInTier set) must have a non-empty purpose`)
      }
    }

    // Completeness: an item reachable only via a role gate (no stack/dependency
    // auto-install path) and not in the baseline IS opt-in tier — it must carry
    // optInTier/optInGroup so the setup UX can offer it.
    const requiresAny = Array.isArray(item.requiresAny) ? item.requiresAny : []
    const roleOnly = requiresAny.length > 0 && requiresAny.every((clause) => clause && clause.role)
    if (item.default !== true && roleOnly && !hasTier) {
      failures.push(`${item.id}: role-gated opt-in item missing optInTier/optInGroup`)
    }
  }
  return failures
}

function auditManifestStructure(manifestVersion, items) {
  const failures = []
  const seenIds = new Map()
  const seenPaths = new Map()

  if (typeof manifestVersion !== 'string' || !MANIFEST_SEMVER_RE.test(manifestVersion)) {
    failures.push('manifest.json: top-level "version" is not valid semver (expected X.Y.Z)')
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (!item.id) {
      failures.push(`item[${i}]: missing id`)
      continue
    }

    const provenanceError = validateCuratedProvenance(item)
    if (provenanceError) failures.push(provenanceError)

    const referencesError = validateReferences(item.id, item.references)
    if (referencesError) failures.push(referencesError)

    if (!item.type) {
      failures.push(`${item.id}: missing type`)
      continue
    }
    if (!item.source) failures.push(`${item.id}: missing source`)
    if (!item.title) failures.push(`${item.id}: missing title`)
    if (item.version && !ITEM_SEMVER_RE.test(item.version)) {
      failures.push(`${item.id}: version "${item.version}" is not valid semver (expected X.Y.Z)`)
    }

    const prev = seenIds.get(item.id)
    if (prev !== undefined) {
      failures.push(`${item.id}: duplicate id (first at index ${prev})`)
    } else {
      seenIds.set(item.id, i)
    }

    if (
      item.type === 'skill' ||
      item.type === 'agent' ||
      item.type === 'template' ||
      item.type === 'command' ||
      item.type === 'config'
    ) {
      if (!item.path) {
        failures.push(`${item.id}: missing path`)
      } else if (!isSafeCatalogPath(item.path)) {
        failures.push(`${item.id}: path "${item.path}" is not a safe relative path`)
      } else {
        const norm = item.path.replace(/\\/g, '/')
        const existing = seenPaths.get(norm)
        if (existing) failures.push(`${item.id}: path "${norm}" already used by ${existing}`)
        else seenPaths.set(norm, item.id)
      }

      const isHaus = item.source === 'haus'
      const isCuratedApproved = item.source === 'curated' && item.reviewStatus === 'approved'
      if (!isHaus && !isCuratedApproved) {
        failures.push(`${item.id}: source must be "haus" or curated with reviewStatus "approved"`)
      }
    }

    // Config items skip content audits (they are tooling files, not agent context),
    // so enforce their structural contract explicitly: under configs/ and weightless.
    if (item.type === 'config') {
      const norm = (item.path ?? '').replace(/\\/g, '/')
      if (!norm.startsWith('configs/')) {
        failures.push(`${item.id}: config items must live under configs/ (got "${item.path}")`)
      }
      if (item.tokenEstimate !== 0) {
        failures.push(
          `${item.id}: config items must set tokenEstimate: 0 (got ${item.tokenEstimate})`,
        )
      }
    }
  }
  return failures
}

function checkRequiredFrontmatter(text, label) {
  const failures = []
  for (const key of REQUIRED_SKILL_FRONTMATTER) {
    if (!extractFrontmatterValue(text, key))
      failures.push(`${label}: missing non-empty frontmatter '${key}:'`)
  }
  return failures
}

function auditTemplateContent(root, absPath, itemId) {
  const rel = path.relative(root, absPath)
  const text = fs.readFileSync(absPath, 'utf8')
  const failures = auditMarkdownLines(
    text,
    rel,
    { PLACEHOLDER_PATTERN, RISKY_INSTALL_PATTERNS, ANY_NPX_PATTERN, ALLOWED_NPX_PATTERN },
    { checkPlaceholder: true, checkNonTsxNpx: true },
  )
  failures.push(...auditForbiddenTagsInText(text, `${itemId}: ${rel}`))
  return failures
}

function auditShippedFiles(root, items) {
  const failures = []
  for (const item of items) {
    if (!item.path || !isSafeCatalogPath(item.path)) continue
    const absPath = path.join(root, item.path)
    if (item.type === 'skill') {
      const skillMd = path.join(absPath, 'SKILL.md')
      if (!fs.existsSync(skillMd)) {
        failures.push(`${item.id}: missing ${path.relative(root, skillMd)}`)
        continue
      }
      const text = fs.readFileSync(skillMd, 'utf8')
      failures.push(...checkRequiredFrontmatter(text, `${item.id}: SKILL.md`))
      failures.push(
        ...auditForbiddenTagsInText(text, `${item.id}: ${path.relative(root, skillMd)}`),
      )
    } else if (item.type === 'agent') {
      if (!fs.existsSync(absPath)) {
        failures.push(`${item.id}: missing agent file ${item.path}`)
        continue
      }
      const text = fs.readFileSync(absPath, 'utf8')
      const rel = path.relative(root, absPath)
      failures.push(...checkRequiredFrontmatter(text, `${item.id}: ${rel}`))
      failures.push(...auditForbiddenTagsInText(text, `${item.id}: ${rel}`))
    } else if (item.type === 'template') {
      if (!fs.existsSync(absPath)) {
        failures.push(`${item.id}: missing template file ${item.path}`)
        continue
      }
      failures.push(...auditTemplateContent(root, absPath, item.id))
    } else if (item.type === 'command') {
      if (!fs.existsSync(absPath)) {
        failures.push(`${item.id}: missing command file ${item.path}`)
        continue
      }
      const text = fs.readFileSync(absPath, 'utf8')
      const rel = path.relative(root, absPath)
      failures.push(...checkRequiredFrontmatter(text, `${item.id}: ${rel}`))
      failures.push(...auditTemplateContent(root, absPath, item.id))
    } else if (item.type === 'config') {
      // Config items ship a file (eslint.config.mjs) or a directory of files
      // (configs/prettier/). Verify the path exists; they are not loaded into
      // agent context, so no frontmatter/forbidden-tag audit applies.
      if (!fs.existsSync(absPath)) {
        failures.push(`${item.id}: missing config path ${item.path}`)
      }
    }
  }
  return failures
}

const DIR_ITEM_TYPE = {
  skills: 'skill',
  agents: 'agent',
  templates: 'template',
  commands: 'command',
}

function walkMd(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, fn)
    else if (entry.name.endsWith('.md')) fn(full)
  }
}

function auditMarkdownContent(root, items) {
  const failures = []
  const pathSourceMap = buildItemPathSourceMap(items)
  for (const dir of ['skills', 'agents', 'templates', 'commands']) {
    const abs = path.join(root, dir)
    if (!fs.existsSync(abs)) continue
    const dirType = DIR_ITEM_TYPE[dir] ?? ''
    walkMd(abs, (file) => {
      const text = fs.readFileSync(file, 'utf8')
      const rel = path.relative(root, file)
      const norm = rel.replace(/\\/g, '/')
      const source = resolveMarkdownItemSource(norm, pathSourceMap)
      const checkNonTsxNpx = !isNpxTsxOnlyExempt(dirType, source)
      failures.push(
        ...auditMarkdownLines(
          text,
          rel,
          { PLACEHOLDER_PATTERN, RISKY_INSTALL_PATTERNS, ANY_NPX_PATTERN, ALLOWED_NPX_PATTERN },
          { checkPlaceholder: false, checkNonTsxNpx },
        ),
      )
      if (!norm.includes('/references/')) failures.push(...auditForbiddenTagsInText(text, rel))
    })
  }
  return failures
}

/**
 * @param {string} root - Catalog repo root (directory containing manifest.json)
 * @param {object} [manifest] - Pre-loaded manifest; loads from root/manifest.json when omitted
 * @returns {{ ok: boolean, failures: string[], items: object[], itemCount: number }}
 */
export function validateCatalog(root, manifest) {
  const manifestPath = path.join(root, 'manifest.json')
  let data
  if (manifest !== undefined) {
    data = manifest
  } else {
    if (!fs.existsSync(manifestPath)) {
      return {
        ok: false,
        failures: ['manifest.json missing'],
        items: [],
        itemCount: 0,
      }
    }
    try {
      data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    } catch (error) {
      return {
        ok: false,
        failures: [`manifest.json invalid JSON: ${error.message}`],
        items: [],
        itemCount: 0,
      }
    }
  }
  const failures = []

  if (!validateManifest(data)) {
    for (const err of validateManifest.errors ?? []) {
      failures.push(`manifest.json: ${err.instancePath || '/'} ${err.message}`)
    }
  }

  const items = Array.isArray(data.items) ? data.items : []
  for (const item of items) {
    if (!validateItem(item)) {
      for (const err of validateItem.errors ?? []) {
        failures.push(`${item.id ?? 'unknown'}: ${err.instancePath || '/'} ${err.message}`)
      }
    }
  }

  failures.push(
    ...auditManifestStructure(data.version, items),
    ...auditCuratedRequiresAny(items),
    ...auditOptInMetadata(items),
    ...auditForbiddenStacks(items),
    ...auditShippedFiles(root, items),
    ...auditMarkdownContent(root, items),
    ...auditDisallowedTags(items),
  )

  return {
    ok: failures.length === 0,
    failures,
    items,
    itemCount: items.length,
  }
}
