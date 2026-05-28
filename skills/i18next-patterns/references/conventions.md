## Naming conventions

- Namespace files: `locales/<lang>/<ns>.json` (e.g. `locales/sv/common.json`, `locales/en/product.json`)
- Namespace names: lowercase, singular, kebab-case (`common`, `product`, `checkout`, `account-settings`)
- Translation keys: dot-separated camelCase (`button.signIn`, `error.network.timeout`)
- Interpolation: `{{variable}}` double-curly — never `${var}` template literals
- Plurals: i18next standard suffixes — `_one`, `_other`, `_zero` (per CLDR rules)
- Context: `_<context>` suffix (`order.status_pending`, `order.status_shipped`)
- Component-scoped namespaces: match component name kebab-cased (`ProductCard` → `product-card`)
- React hook usage: `const { t } = useTranslation(["common", "product"])` — declare needed namespaces

## Do / don't

DO: Declare all `ns` used by a route up front in `useTranslation([...])` — DON'T: pull in `defaultNS` for one key
DO: Use `Trans` component for inline JSX in strings — DON'T: build HTML strings via concatenation
DO: Add `i18next-parser` to extract keys automatically — DON'T: maintain key lists by hand
DO: Set `fallbackLng` to the project's source locale (e.g. `sv`) — DON'T: leave `en` as fallback when source is Swedish
DO: Use `returnNull: false` and explicit fallback `t(key, "default text")` for missing keys — DON'T: render `null`
DO: For Next.js App Router, use server-side translations via `getServerTranslations(lng, ns)` — DON'T: rely on client-side hydration alone for SEO content
DO: Pluralize via `t(key, { count })` — DON'T: write `if (count === 1) t("x_one") else t("x_other")`
DO: Lazy-load namespaces per-route — DON'T: load all namespaces on app boot

## Forbidden patterns

NEVER: hardcoded UI strings in components after i18next is wired — broken locale completeness
NEVER: template literal interpolation inside `t(key)` — extractors can't parse it
NEVER: dynamic key construction without an enum/registry (`t(\`error.\${type}\`)`) — extraction misses keys
NEVER: change a translation key without updating every locale file — silent fallback to source locale
NEVER: ship locale files with unresolved markers or untranslated source strings — production leak
NEVER: rely on `localStorage` for locale persistence in SSR routes — server can't read it; hydration mismatch
NEVER: load remote translations synchronously in critical render path — UI blocks on network
NEVER: write keys with spaces or special chars — breaks dot-path lookups
