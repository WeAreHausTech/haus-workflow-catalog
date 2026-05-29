# Future Improvements

Deferred tasks with rationale and implementation guidance.
Each item includes why it was deferred and the earliest sensible trigger for doing it.

---

## FI-1 — Automated Weekly Fixture Sync in CLI

**Repo:** `haus-workflow`  
**Deferred:** F7 was completed by manual sync. Automation was skipped.  
**Why deferred:** Weekly sync workflow adds CI noise before the catalog stabilises. Manual sync during F7 was sufficient for test coverage.

**When to implement:** Once the catalog ships its second tagged release (`v1.1.0`+) and active skill updates are happening on a regular cadence.

**What to do:**  
Create `.github/workflows/sync-catalog-fixture.yml` in `haus-workflow`:

```yaml
name: Sync catalog fixture

on:
  schedule:
    - cron: '0 6 * * 1' # weekly Monday 06:00 UTC
  workflow_dispatch:

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Fetch latest catalog manifest
        run: |
          curl -fsSL \
            https://raw.githubusercontent.com/WeAreHausTech/haus-workflow-catalog/main/manifest.json \
            -o library/catalog/manifest.json

      - name: Check for changes
        id: diff
        run: |
          if git diff --quiet library/catalog/manifest.json; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Commit updated fixture
        if: steps.diff.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add library/catalog/manifest.json
          git commit -m "chore(catalog): sync fixture from haus-workflow-catalog main"
          git push
```

---

## FI-2 — Full Validation Rules in CLI's `validate-catalog` Command

**Repo:** `haus-workflow`  
**Deferred:** F6 wired `FORBIDDEN_TAGS` into the CLI command but left the deeper checks (file existence, required sections, banned agent phrases, risky install patterns) unimplemented in `src/commands/validate-catalog.ts`.  
**Why deferred:** `validate-catalog` is intended for CI use against a local catalog directory. The catalog's own `scripts/validate.mjs` is the primary gate. The CLI command is a convenience alias; duplicating all checks adds maintenance burden before the two repos are stabilised.

**When to implement:** When `haus validate-catalog` is the primary CI gate (i.e. after `@haus-tech/haus-workflow` is published at P9 and the catalog repo's CI switches from `node scripts/validate.mjs` to `haus validate-catalog ./manifest.json`).

**What to do:**  
In `src/commands/validate-catalog.ts`:

1. Import all constants from `src/catalog/validation-rules.ts`:

   ```ts
   import {
     BANNED_AGENT_PHRASES,
     REQUIRED_SKILL_SECTIONS,
     REQUIRED_AGENT_SECTIONS,
     RISKY_INSTALL_PATTERNS,
     ALLOWED_NPX_PATTERN,
     ANY_NPX_PATTERN,
     HTTP_URL_PATTERN,
     PLACEHOLDER_PATTERN,
   } from '../catalog/validation-rules.js'
   ```

2. Add `auditShippedFiles(manifestDir, items)` — for each skill/agent/template item:
   - Skill: check `{path}/SKILL.md` exists and contains `REQUIRED_SKILL_SECTIONS`
   - Agent: check file exists, has `---` frontmatter, contains `REQUIRED_AGENT_SECTIONS`, no `BANNED_AGENT_PHRASES`
   - Template: check file exists

3. Add `auditMarkdownContent(manifestDir, items)` — walk `skills/` and `agents/` looking for `PLACEHOLDER_PATTERN` and `RISKY_INSTALL_PATTERNS`.

4. Wire both into `runValidateCatalog` alongside existing checks.

---

## FI-3 — `testing` Ecosystem in `computeRuleIntents`

**Repo:** `haus-workflow`  
**Deferred:** Low impact — no behaviour change needed.  
**Why deferred:** Skills with testing-related tags (`storybook`, `testing-library`, `playwright`, `phpunit`, `testing`) are caught by the `isTestingRule` tag check _before_ the ecosystem→intent map is evaluated. This means `ecosystem: "testing"` on `testing-library-patterns` (and `ecosystem: "storybook"` on `storybook-patterns`) is effectively cosmetic — it is never reached in `computeRuleIntents`.

**When to implement:** If/when a new testing skill is added that does NOT have a recognised testing tag (e.g. a custom test runner with an unfamiliar tag name). At that point, add `eco === "testing"` → `intents.add("testing")` to the ecosystem map and document that the ecosystem field alone is sufficient.

**What to do:**  
In `src/recommender/task-intent.ts`, inside `computeRuleIntents`, add after the `isTestingRule` early-return block:

```ts
// Note: testing rules currently rely on tag-based detection above.
// Ecosystem-based fallback for testing rules not covered by known tags:
if (eco === 'testing' || eco === 'playwright' || eco === 'storybook') {
  intents.add('testing')
  return intents
}
```

---

## FI-4 — `haus update --check` Tag Comparison via GitHub API

**Repo:** `haus-workflow`  
**Deferred:** Partial — `catalogRef` is written to the lock file (F4) and included in `--check` output, but there is no comparison against latest available tags in the remote repo.  
**Why deferred:** Requires a GitHub API call (`/repos/WeAreHausTech/haus-workflow-catalog/tags`). This adds latency, a new network dependency, and potential rate-limit issues. The core value — knowing the installed ref — is already provided by `catalogRef` in the lock.

**When to implement:** When the catalog tags multiple releases and teams actively manage catalog versions. At that point, comparing installed ref against latest tag is actionable; today there is only one tag.

**What to do:**  
In `src/catalog/remote-catalog.ts`, add:

```ts
const CATALOG_TAGS_URL = 'https://api.github.com/repos/WeAreHausTech/haus-workflow-catalog/tags'

export async function fetchLatestCatalogTag(): Promise<string | null> {
  try {
    const res = await fetch(CATALOG_TAGS_URL, {
      signal: AbortSignal.timeout(5_000),
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const tags = (await res.json()) as Array<{ name: string }>
    // Tags are returned newest-first.
    return tags[0]?.name ?? null
  } catch {
    return null
  }
}
```

In `src/update/lockfile.ts`, add to `checkLock` return:

```ts
// Read catalogRef from first lock item (all items share the same ref).
const catalogRef = lock[0]?.catalogRef ?? null;
return { ok: ..., count: ..., catalogRef };
```

In `src/commands/update.ts`, inside `options.check`:

```ts
const latestTag = await fetchLatestCatalogTag();
const refMismatch = latestTag && status.catalogRef && status.catalogRef !== latestTag;

log(JSON.stringify({
  ...status,
  catalogRef: status.catalogRef ?? "main",
  latestCatalogTag: latestTag,
  catalogRefBehind: refMismatch ? `installed from ${status.catalogRef}, latest is ${latestTag}` : false,
  ...
}, null, 2));
```
