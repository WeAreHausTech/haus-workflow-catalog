# Future Improvements

Deferred tasks with rationale and implementation guidance.
Each item includes why it was deferred and the earliest sensible trigger for doing it.

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
