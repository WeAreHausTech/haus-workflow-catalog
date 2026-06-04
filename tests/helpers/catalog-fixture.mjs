/**
 * Test harness for driving the REAL scripts/validate.mjs over throwaway catalog roots.
 *
 * validate.mjs derives its catalog ROOT from its own file location and reads
 * manifest.json / schema/ / validation-rules.json relative to that root. To test
 * arbitrary (bad) manifests we therefore build a minimal fake catalog root that
 * copies the real validator + its rule/schema dependencies, drop a test manifest
 * (plus any skill/agent/template files) into it, then run the validator as a child
 * process and inspect exit code + stderr.
 *
 * The fixture root lives UNDER the repo (tests/.tmp/) on purpose: validate.mjs does
 * `import Ajv from 'ajv'`, which resolves by walking up to the repo's node_modules.
 * A root in the OS temp dir would fail that import.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(HERE, '..', '..')
const TMP_BASE = path.join(REPO_ROOT, 'tests', '.tmp')

/**
 * Build a fake catalog root in a fresh temp dir and return its absolute path.
 *
 * @param {object} opts
 * @param {object} opts.manifest            Manifest object written to manifest.json.
 * @param {Record<string,string>} [opts.files]  Extra files: relative path -> contents.
 *        e.g. { 'skills/foo/SKILL.md': '## Use when\n## Do not use when\n' }
 */
export function makeCatalog({ manifest, files = {} }) {
  fs.mkdirSync(TMP_BASE, { recursive: true })
  const root = fs.mkdtempSync(path.join(TMP_BASE, 'cat-'))

  // Copy the real validator and its loader so we exercise the production code.
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
  for (const f of ['validate.mjs', 'validation-rules.mjs']) {
    fs.copyFileSync(path.join(REPO_ROOT, 'scripts', f), path.join(root, 'scripts', f))
  }

  // Copy the canonical rules + schemas.
  fs.copyFileSync(
    path.join(REPO_ROOT, 'validation-rules.json'),
    path.join(root, 'validation-rules.json'),
  )
  fs.mkdirSync(path.join(root, 'schema'), { recursive: true })
  for (const s of ['catalog-item.schema.json', 'manifest.schema.json']) {
    fs.copyFileSync(path.join(REPO_ROOT, 'schema', s), path.join(root, 'schema', s))
  }

  // checkWorkflowDocSync requires these two files to exist and be byte-identical.
  const wf = '# Workflow standard fixture\n'
  fs.mkdirSync(path.join(root, 'templates'), { recursive: true })
  fs.mkdirSync(path.join(root, '.claude'), { recursive: true })
  fs.writeFileSync(path.join(root, 'templates', 'agentic-workflow-standard.md'), wf)
  fs.writeFileSync(path.join(root, '.claude', 'WORKFLOW.md'), wf)

  // The manifest under test.
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // Any referenced skill/agent/template files.
  for (const [rel, contents] of Object.entries(files)) {
    const abs = path.join(root, rel)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, contents)
  }

  return root
}

/** Run the validator in a fixture root. Returns { status, stdout, stderr }. */
export function runValidate(root) {
  try {
    const stdout = execFileSync('node', [path.join(root, 'scripts', 'validate.mjs')], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { status: 0, stdout, stderr: '' }
  } catch (e) {
    return {
      status: e.status ?? 1,
      stdout: e.stdout?.toString() ?? '',
      stderr: e.stderr?.toString() ?? '',
    }
  }
}

/** Remove the whole tests/.tmp tree (call from an after() hook). */
export function cleanup() {
  fs.rmSync(TMP_BASE, { recursive: true, force: true })
}

/** A minimal, fully valid skill item + its SKILL.md, for happy-path / mutation bases. */
export function validSkillItem(overrides = {}) {
  return {
    id: 'haus.test-skill',
    type: 'skill',
    source: 'haus',
    version: '1.0.0',
    path: 'skills/test-skill',
    title: 'Test skill',
    tags: ['haus'],
    repoRoles: [],
    tokenEstimate: 100,
    ...overrides,
  }
}

export const VALID_SKILL_MD = '# Test skill\n\n## Use when\nx\n\n## Do not use when\ny\n'

/** A minimal valid manifest wrapping one valid skill. */
export function validManifest(items) {
  return { version: '2.4.0', items }
}
