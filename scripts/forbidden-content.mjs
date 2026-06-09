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

/** YAML block-scalar header: `>`, `>-`, `>2`, `|- # note`, etc. */
function isYamlBlockScalarHeader(rest) {
  return /^[>|][-+]?(\d+)?(?:\s+#.*)?$/.test(rest)
}

/** Extracts the YAML frontmatter `description:` value (the superpowers when-signal). */
export function extractFrontmatterDescription(text) {
  const m = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return ''
  const lines = m[1].split(/\r?\n/)
  const idx = lines.findIndex((l) => /^description:[ \t]*/.test(l))
  if (idx < 0) return ''
  const rest = lines[idx].replace(/^description:[ \t]*/, '').trim()
  if (!rest) return ''
  if (!isYamlBlockScalarHeader(rest)) {
    return rest.replace(/^["']|["']$/g, '').trim()
  }
  const body = []
  for (let j = idx + 1; j < lines.length; j++) {
    const line = lines[j]
    if (/^[a-zA-Z_][\w.-]*:[ \t]/.test(line)) break
    if (line.trim() === '') continue
    if (/^\s+/.test(line)) body.push(line.trimStart())
    else break
  }
  return body.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Returns failure messages when the skill's when-signal recommends a forbidden stack.
 * Scans both the frontmatter `description:` (superpowers convention) and any legacy
 * `## Use when` section (haus-owned agents/skills) — other prose may name platforms in
 * negation or file paths, so it is intentionally excluded.
 */
export function auditForbiddenTagsInText(text, label) {
  const body = `${extractFrontmatterDescription(text)}\n${extractUseWhenSection(text)}`
  if (!body.trim()) return []

  const failures = []
  for (const word of PROSE_FORBIDDEN_TAGS) {
    const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i')
    if (re.test(body)) failures.push(`${label}: forbidden stack/tag "${word}" in content`)
  }
  return failures
}

/**
 * Line-level checks shared by skills, agents, and templates.
 * `checkPlaceholder` gates the TODO/placeholder scan: it is an authoring-quality guard,
 * not a safety rule, and produces false positives on legitimate prose (e.g. "scan for
 * TODOs", CSS `.placeholder`). The repo-wide markdown walk disables it; per-item shipped
 * template/command audits keep it on.
 */
export function auditMarkdownLines(
  text,
  rel,
  { PLACEHOLDER_PATTERN, RISKY_INSTALL_PATTERNS, ANY_NPX_PATTERN, ALLOWED_NPX_PATTERN },
  { checkPlaceholder = true } = {},
) {
  const failures = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (checkPlaceholder && PLACEHOLDER_PATTERN.test(line)) {
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
