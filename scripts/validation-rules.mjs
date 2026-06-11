/**
 * Catalog validation rules — thin loader over the canonical `validation-rules.json`.
 *
 * SINGLE SOURCE OF TRUTH: all rule data lives in `validation-rules.json` at the repo
 * root. This module only loads that JSON and reconstructs regex objects from their
 * `{ source, flags }` form. The haus-workflow CLI consumes the same JSON as a synced
 * fixture (see ADR-0001), so the two validators can no longer drift.
 *
 * Do NOT hand-edit rule values here — edit `validation-rules.json`.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const RULES = JSON.parse(readFileSync(join(here, '..', 'validation-rules.json'), 'utf8'))

/** Reconstruct a RegExp from a `{ source, flags }` record. */
const toRegExp = (r) => new RegExp(r.source, r.flags)

/** Tags that identify unsupported stacks. Items using these tags fail validation. */
export const FORBIDDEN_TAGS = RULES.forbiddenTags

/** Frontmatter keys required in skill SKILL.md, agent .md, and command .md (e.g. `description`). */
export const REQUIRED_SKILL_FRONTMATTER = RULES.requiredSkillFrontmatter

/** Install patterns that must not appear in shipped markdown. */
export const RISKY_INSTALL_PATTERNS = RULES.riskyInstallPatterns.map(toRegExp)

/** The only npx invocation allowed in shipped markdown. */
export const ALLOWED_NPX_PATTERN = toRegExp(RULES.allowedNpxPattern)

/** Regex to detect any npx call (used to catch disallowed ones after allowing tsx). */
export const ANY_NPX_PATTERN = toRegExp(RULES.anyNpxPattern)

/** Insecure URL pattern. All references must use https://. */
export const HTTP_URL_PATTERN = toRegExp(RULES.httpUrlPattern)

/** Markers that must not appear in shipped content. */
export const PLACEHOLDER_PATTERN = toRegExp(RULES.placeholderPattern)

/**
 * Allowlisted tokens — stack/role names plus catalog category tokens
 * (e.g. "haus", "security", "quality", "review"). A tag outside this set and the
 * specials below (ALWAYS_ALLOWED_TAGS, PATTERN_TAG_SUFFIXES) fails validation.
 */
const ALLOWED_STACKS = RULES.allowedStacks

/** Category/meta tags always permitted regardless of the stack allowlist. */
const ALWAYS_ALLOWED_TAGS = RULES.alwaysAllowedTags

/** Tag suffixes treated as conventions, not stack names (e.g. "react-patterns"). */
const PATTERN_TAG_SUFFIXES = RULES.patternTagSuffixes

const ALLOWED_SET = new Set([...ALLOWED_STACKS, ...ALWAYS_ALLOWED_TAGS].map((t) => t.toLowerCase()))

/**
 * Returns true when a tag is permitted: it is in the stack allowlist, an always-allowed
 * meta tag, or ends with a pattern suffix. Mirrors the CLI's `isTagAllowed`.
 */
function isTagAllowed(tag) {
  const lower = String(tag).toLowerCase()
  if (ALLOWED_SET.has(lower)) return true
  return PATTERN_TAG_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

/** Returns a failure message per item tag that is not allowlisted (empty array = all valid). */
export function auditDisallowedTags(items) {
  const failures = []
  for (const item of items) {
    // Items missing an id are reported by structure validation; skipping them here
    // keeps tag-failure output actionable (no "undefined: tag not in allowlist").
    if (!item.id) continue
    for (const tag of Array.isArray(item.tags) ? item.tags : []) {
      if (!isTagAllowed(tag)) failures.push(`${item.id}: tag not in allowlist: "${tag}"`)
    }
  }
  return failures
}
