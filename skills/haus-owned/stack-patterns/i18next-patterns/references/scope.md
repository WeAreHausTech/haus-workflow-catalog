# Scope

## In-scope files and dirs

- `i18n.ts` / `lib/i18n.ts` — init config, namespaces, fallback
- `i18next.config.ts` (next-i18next legacy)
- `locales/**/*.json` or `public/locales/**/*.json` — translation files
- `app/i18n/**` (App Router) — server-side translation setup
- `next.config.js` `i18n` config (Pages Router only)
- React/Vue consumer files calling `useTranslation` / `<Trans>` / `$t`
- `i18next-parser.config.js` — key extraction config

## Stack boundaries

- i18next + react-i18next: standard React integration, client + SSR
- next-i18next: Pages Router specific; deprecated for App Router projects
- App Router SSR: custom `getServerTranslations` pattern, no next-i18next
- Vue: `vue-i18n` (different API surface, not in scope for this skill)
- FormatJS / Lingui: out of scope; different mental model

## Triggers

- Adding a new locale
- Adding or renaming a translation namespace
- Migrating Pages Router next-i18next to App Router server translations
- Adding key extraction (`i18next-parser`)
- Adding context-aware or plural-aware keys
- Switching locale detector strategy
- Adding language-aware routing (locale prefix in URL)
