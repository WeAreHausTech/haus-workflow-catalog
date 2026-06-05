/**
 * Scans markdown/catalog text for forbidden stack tokens.
 */
import { FORBIDDEN_TAGS } from './validation-rules.mjs'

/** Tags omitted from prose scans — too many English false positives; still checked on manifest tags. */
const PROSE_FORBIDDEN_TAGS = FORBIDDEN_TAGS.filter((t) => String(t).toLowerCase() !== 'go')

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractUseWhenSection(text) {
  const marker = '## Use when'
  const idx = String(text).toLowerCase().indexOf(marker.toLowerCase())
  if (idx < 0) return ''
  const tail = String(text).slice(idx + marker.length)
  const next = tail.search(/\n##\s+/)
  return next < 0 ? tail : tail.slice(0, next)
}

/** Returns failure messages when the Use-when section recommends a forbidden stack. */
export function auditForbiddenTagsInText(text, label) {
  const body = extractUseWhenSection(text)
  if (!body.trim()) return []

  const failures = []
  for (const word of PROSE_FORBIDDEN_TAGS) {
    const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i')
    if (re.test(body)) failures.push(`${label}: forbidden stack/tag "${word}" in content`)
  }
  return failures
}

/** Line-level checks shared by skills, agents, and templates. */
export function auditMarkdownLines(
  text,
  rel,
  { PLACEHOLDER_PATTERN, RISKY_INSTALL_PATTERNS, ANY_NPX_PATTERN, ALLOWED_NPX_PATTERN },
) {
  const failures = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (PLACEHOLDER_PATTERN.test(line)) {
      failures.push(`${rel}:${i + 1}: TODO or placeholder in shipped content`)
    }
    if (RISKY_INSTALL_PATTERNS.some((re) => re.test(line))) {
      failures.push(`${rel}:${i + 1}: risky install pattern`)
    }
    if (ANY_NPX_PATTERN.test(line) && !ALLOWED_NPX_PATTERN.test(line)) {
      failures.push(`${rel}:${i + 1}: disallowed npx (only npx tsx allowed)`)
    }
  }
  return failures
}
