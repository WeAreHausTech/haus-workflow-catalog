#!/usr/bin/env node
/**
 * Catalog validation entrypoint — thin wrapper over validate-core.mjs.
 * Schema: schema/manifest.schema.json, schema/catalog-item.schema.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { validateCatalog } from './validate-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function checkWorkflowDocSync() {
  const template = path.join(ROOT, 'templates', 'agentic-workflow-standard.md')
  const workflow = path.join(ROOT, '.claude', 'WORKFLOW.md')
  if (!fs.existsSync(template) || !fs.existsSync(workflow)) {
    return ['workflow-doc-sync: template or .claude/WORKFLOW.md missing']
  }
  const a = fs.readFileSync(template, 'utf8')
  const b = fs.readFileSync(workflow, 'utf8')
  if (a !== b) {
    return [
      'workflow-doc-sync: templates/agentic-workflow-standard.md and .claude/WORKFLOW.md differ (must be byte-identical)',
    ]
  }
  return []
}

function main() {
  const result = validateCatalog(ROOT)
  const failures = [...result.failures, ...checkWorkflowDocSync()]

  if (failures.length > 0) {
    console.error('Catalog validation failed:\n')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log(`Catalog validation passed (${result.itemCount} items).`)
}

// Re-export core helpers for tests and downstream scripts
export {
  findForbiddenTag,
  isSafeCatalogPath,
  missingSkillFrontmatterKeys,
  validateCatalog,
  validateItemSchema,
} from './validate-core.mjs'

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
