/**
 * Catalog validation rules — single source of truth.
 *
 * SYNC REQUIRED: these constants must stay in sync with
 * haus-workflow/src/catalog/validation-rules.ts.
 * When updating rules here, update the CLI file too (and vice versa).
 */

// Allowlist model: the catalog is scoped to haus's supported stacks.
// Items tagging an unsupported stack would load into projects the haus
// workflow cannot safely guide, producing incomplete or misleading AI context.
/** Tags that identify unsupported stacks. Items using these tags fail validation. */
export const FORBIDDEN_TAGS = [
  "python", "django", "go", "rust", "java", "spring", "kotlin",
  "swift", "android", "flutter", "dart", "c++", "perl", "defi", "trading",
];

// Agents in this catalog are narrowly scoped (reviewer, planner, researcher).
// These phrases signal orchestration or delegation behavior that violates the
// single-responsibility model and could cause agents to take unbounded actions.
/** Phrases disallowed in agent files. Agents must not describe autonomous or orchestrating behavior. */
export const BANNED_AGENT_PHRASES = [
  "autonomous", "swarm", "delegate", "orchestrat", "marketplace",
];

// The CLI recommender reads these sections to decide when to surface each item.
// Missing sections mean the recommender cannot gate the item correctly.
/** Sections required in every skill's SKILL.md. */
export const REQUIRED_SKILL_SECTIONS = [
  "## Use when",
  "## Do not use when",
];

// Same gating requirement for agent files.
/** Sections required in every agent's .md file. */
export const REQUIRED_AGENT_SECTIONS = [
  "## Use when",
  "## Do not use when",
  "## Verification",
];

// Auto-confirming npx/yarn dlx/pnpm dlx executes arbitrary remote code —
// a supply chain attack surface. Shipped markdown must not instruct users
// to run unreviewed packages.
/** Install patterns that must not appear in shipped markdown. */
export const RISKY_INSTALL_PATTERNS = [
  /\bnpx\s+-y\b/i,
  /\bnpx\s+--yes\b/i,
  /\byarn\s+dlx\b/i,
  /\bpnpm\s+dlx\b/i,
];

// Two-regex strategy: ANY_NPX_PATTERN catches all npx calls; ALLOWED_NPX_PATTERN
// identifies the one safe form. Check any → then check if allowed → fail if not.
// npx tsx is the sole exception: it's a known TypeScript runner, not a generic
// package executor.
/** The only npx invocation allowed in shipped markdown. */
export const ALLOWED_NPX_PATTERN = /\bnpx\s+tsx\b/i;

/** Regex to detect any npx call (used to catch disallowed ones after allowing tsx). */
export const ANY_NPX_PATTERN = /\bnpx\s+\S+/i;

// All references must use https:// — http:// exposes catalog consumers to
// MITM attacks when the CLI fetches referenced docs at context-load time.
/** Insecure URL pattern. All references must use https://. */
export const HTTP_URL_PATTERN = /^http:\/\//i;

// Incomplete authoring shipped to consumers produces broken or misleading AI
// context. TODO/PLACEHOLDER must be resolved before an item is published.
/** Markers that must not appear in shipped content. */
export const PLACEHOLDER_PATTERN = /\bTODO\b|\bPLACEHOLDER\b/i;
