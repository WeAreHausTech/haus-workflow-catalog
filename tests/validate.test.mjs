/**
 * Drives the REAL scripts/validate.mjs over throwaway manifests — one test per
 * fail() branch. Each builds a minimal bad catalog root, runs the validator as a
 * child process, and asserts a non-zero exit plus the expected stderr substring.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { after, test } from 'node:test'

import {
  cleanup,
  makeCatalog,
  runValidate,
  validManifest,
  validSkillItem,
  VALID_SKILL_MD,
} from './helpers/catalog-fixture.mjs'

after(cleanup)

/** Build + run, returning the validator result. */
function check({ manifest, files }) {
  return runValidate(makeCatalog({ manifest, files }))
}

test('happy path: a fully valid manifest exits 0', () => {
  const r = check({
    manifest: validManifest([validSkillItem()]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 0, r.stderr || r.stdout)
  assert.match(r.stdout, /Catalog valid\./)
})

test('manifest.json invalid JSON -> exit 1', () => {
  // Build a valid root, then overwrite the manifest with broken JSON.
  const root = makeCatalog({ manifest: validManifest([]) })
  fs.writeFileSync(path.join(root, 'manifest.json'), '{ not valid json,, }')
  const r = runValidate(root)
  assert.equal(r.status, 1)
  assert.match(r.stderr, /invalid JSON/)
})

test('missing required manifest property (no version) -> schema fail', () => {
  const r = check({ manifest: { items: [] } })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /missing required property 'version'/)
})

test('top-level version not semver -> fail', () => {
  const r = check({ manifest: { version: 'not-semver', items: [] } })
  assert.equal(r.status, 1)
  // schema pattern + the SEMVER_RE check; either message acceptable
  assert.match(r.stderr, /version/i)
})

test('item missing title -> fail', () => {
  const item = validSkillItem()
  delete item.title
  const r = check({
    manifest: validManifest([item]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /missing title/)
})

test('item bad semver version -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ version: '1.2' })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /not valid semver/)
})

test('duplicate id -> fail', () => {
  const a = validSkillItem({ id: 'haus.dup', path: 'skills/a' })
  const b = validSkillItem({ id: 'haus.dup', path: 'skills/b' })
  const r = check({
    manifest: validManifest([a, b]),
    files: {
      'skills/a/SKILL.md': VALID_SKILL_MD,
      'skills/b/SKILL.md': VALID_SKILL_MD,
    },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /duplicate id/)
})

test('duplicate path -> fail', () => {
  const a = validSkillItem({ id: 'haus.a', path: 'skills/shared' })
  const b = validSkillItem({ id: 'haus.b', path: 'skills/shared' })
  const r = check({
    manifest: validManifest([a, b]),
    files: { 'skills/shared/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /already used by/)
})

test('skill missing SKILL.md -> fail', () => {
  const r = check({ manifest: validManifest([validSkillItem()]) })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /missing .*SKILL\.md/)
})

test('skill SKILL.md missing required section -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem()]),
    files: { 'skills/test-skill/SKILL.md': '# only\n## Use when\nx\n' },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /SKILL\.md missing ## Do not use when/)
})

test('template missing file -> fail', () => {
  const item = validSkillItem({
    id: 'haus.tmpl',
    type: 'template',
    path: 'templates/missing.md',
  })
  const r = check({ manifest: validManifest([item]) })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /missing template file/)
})

test('agent missing file -> fail', () => {
  const item = validSkillItem({ id: 'haus.ag', type: 'agent', path: 'agents/missing.md' })
  const r = check({ manifest: validManifest([item]) })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /missing agent file/)
})

test('agent file missing YAML frontmatter -> fail', () => {
  const item = validSkillItem({ id: 'haus.ag', type: 'agent', path: 'agents/a.md' })
  const r = check({
    manifest: validManifest([item]),
    files: {
      'agents/a.md': 'no frontmatter\n## Use when\nx\n## Do not use when\ny\n## Verification\nz\n',
    },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /missing YAML frontmatter/)
})

test('agent file missing required section -> fail', () => {
  const item = validSkillItem({ id: 'haus.ag', type: 'agent', path: 'agents/a.md' })
  const r = check({
    manifest: validManifest([item]),
    files: { 'agents/a.md': '---\nname: a\n---\n## Use when\nx\n## Do not use when\ny\n' },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /agent file missing ## Verification/)
})

test('agent file banned phrase -> fail', () => {
  const item = validSkillItem({ id: 'haus.ag', type: 'agent', path: 'agents/a.md' })
  const r = check({
    manifest: validManifest([item]),
    files: {
      'agents/a.md':
        '---\nname: a\n---\n## Use when\nThis agent will orchestrate work.\n## Do not use when\ny\n## Verification\nz\n',
    },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /disallowed phrase/)
})

test('untrusted source -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ source: 'curated' })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /source must be "haus" or curated/)
})

test('curated + approved source -> exit 0', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ source: 'curated', reviewStatus: 'approved' })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 0, r.stderr)
})

test('reference with http:// URL -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ references: ['http://insecure.example.com/x'] })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /insecure http:\/\//)
})

test('reference file does not exist -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ references: ['references/nope.md'] })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /reference does not exist/)
})

test('https:// reference is skipped (resolves) -> exit 0', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ references: ['https://example.com/llms.txt'] })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 0, r.stderr)
})

test('forbidden stack tag -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ tags: ['haus', 'python'] })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /unsupported stack\/tag "python"/)
})

test('non-allowlisted tag -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem({ tags: ['haus', 'totally-unknown-tag'] })]),
    files: { 'skills/test-skill/SKILL.md': VALID_SKILL_MD },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /tag not in allowlist: "totally-unknown-tag"/)
})

test('placeholder (TODO) in shipped skill content -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem()]),
    files: {
      'skills/test-skill/SKILL.md': VALID_SKILL_MD + '\nTODO finish this\n',
    },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /TODO or placeholder/)
})

test('risky install pattern (npx -y) in shipped content -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem()]),
    files: {
      'skills/test-skill/SKILL.md': VALID_SKILL_MD + '\nRun `npx -y create-thing`\n',
    },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /risky install pattern/)
})

test('disallowed npx (not tsx) in shipped content -> fail', () => {
  const r = check({
    manifest: validManifest([validSkillItem()]),
    files: {
      'skills/test-skill/SKILL.md': VALID_SKILL_MD + '\nRun `npx prettier .`\n',
    },
  })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /disallowed npx/)
})

test('allowed npx tsx in shipped content -> exit 0', () => {
  const r = check({
    manifest: validManifest([validSkillItem()]),
    files: {
      'skills/test-skill/SKILL.md': VALID_SKILL_MD + '\nRun `npx tsx script.ts`\n',
    },
  })
  assert.equal(r.status, 0, r.stderr)
})

test('workflow doc out of sync -> fail', () => {
  const root = makeCatalog({
    manifest: validManifest([validSkillItem()]),
    files: {
      'skills/test-skill/SKILL.md': VALID_SKILL_MD,
      '.claude/WORKFLOW.md': '# drifted content\n',
    },
  })
  const r = runValidate(root)
  assert.equal(r.status, 1)
  assert.match(r.stderr, /out of sync with templates/)
})
