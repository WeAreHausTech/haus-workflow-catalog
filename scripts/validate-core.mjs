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
import {
  ALLOWED_NPX_PATTERN,
  ANY_NPX_PATTERN,
  auditDisallowedTags,
  FORBIDDEN_TAGS,
  HTTP_URL_PATTERN,
  NPX_TSX_ONLY_EXEMPT_TYPES,
  PLACEHOLDER_PATTERN,
  REQUIRED_SKILL_FRONTMATTER,
  RISKY_INSTALL_PATTERNS,
} from './validation-rules.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCHEMA_DIR = path.join(__dirname, '..', 'schema')

const ITEM_SEMVER_RE = /^\d+\.\d+\.\d+$/
const MANIFEST_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/

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

function auditManifestStructure(manifestVersion, items) {
  const failures = []
  const seenIds = new Map()
  const seenPaths = new Map()

  if (typeof manifestVersion !== 'string' || !MANIFEST_SEMVER_RE.test(manifestVersion)) {
    failures.push(
      'manifest.json: top-level "version" is not valid semver (expected X.Y.Z or X.Y.Z-pre)',
    )
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (!item.id) {
      failures.push(`item[${i}]: missing id`)
      continue
    }
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
      item.type === 'command'
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

      for (const ref of item.references ?? []) {
        if (/^https?:\/\//i.test(ref)) {
          if (!ref.startsWith('https://')) {
            failures.push(`${item.id}: reference must be https:// URL: ${ref}`)
          }
          if (HTTP_URL_PATTERN.test(ref)) {
            failures.push(`${item.id}: reference uses insecure http:// URL: ${ref}`)
          }
        }
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

function auditMarkdownContent(root) {
  const failures = []
  for (const dir of ['skills', 'agents', 'templates', 'commands']) {
    const abs = path.join(root, dir)
    if (!fs.existsSync(abs)) continue
    const checkNonTsxNpx = !NPX_TSX_ONLY_EXEMPT_TYPES.includes(DIR_ITEM_TYPE[dir] ?? '')
    walkMd(abs, (file) => {
      const text = fs.readFileSync(file, 'utf8')
      const rel = path.relative(root, file)
      failures.push(
        ...auditMarkdownLines(
          text,
          rel,
          { PLACEHOLDER_PATTERN, RISKY_INSTALL_PATTERNS, ANY_NPX_PATTERN, ALLOWED_NPX_PATTERN },
          { checkPlaceholder: false, checkNonTsxNpx },
        ),
      )
      if (!rel.includes('/references/')) failures.push(...auditForbiddenTagsInText(text, rel))
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
  const data = manifest ?? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
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
    ...auditForbiddenStacks(items),
    ...auditShippedFiles(root, items),
    ...auditMarkdownContent(root),
    ...auditDisallowedTags(items),
  )

  return {
    ok: failures.length === 0,
    failures,
    items,
    itemCount: items.length,
  }
}
