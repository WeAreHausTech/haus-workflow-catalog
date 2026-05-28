# Workflow

## Implementation steps

1. For a new translation key: add it to the source locale file first, then to every other locale (use parser to scaffold).
2. For a new namespace: create `locales/<lang>/<ns>.json` per locale; add `<ns>` to `useTranslation([...])` calls.
3. For a new locale: copy the source locale folder, translate, add to `supportedLngs` in i18n config.
4. For App Router (Next.js 13+), use a server-side `getServerTranslations` helper; never rely on client-side hydration for above-the-fold copy.
5. Configure `i18next-parser` (`i18next-parser.config.js`) and run `yarn i18n:extract` to scaffold missing keys.
6. Verify locale completeness with the parser's `--fail-on-update` mode in CI.
7. When changing key shape (rename, restructure), update all locale files atomically — don't ship a partial migration.
8. For pluralization, use `t(key, { count })` and rely on i18next's CLDR-driven suffix selection.

## Commands

```bash
yarn dev                                       # local dev with i18next debug logs (set debug: true in dev only)
yarn i18n:extract                              # run i18next-parser to find missing keys
yarn i18n:check                                # CI mode — fail if locale files drift from source
yarn build                                     # production build (locale files bundled or fetched lazily)

# Key inspection
grep -r "t(\"<key>\"" src/                     # find usage of a specific key
grep -rL "\"<key>\"" locales/                  # find locales missing a key
```

## Validation checklist

- [ ] Every key present in source locale also present in every other supported locale
- [ ] No hard-coded user-facing strings in components touched by the change
- [ ] All `useTranslation([...])` calls declare every namespace they consume
- [ ] No template-literal interpolation inside `t(key)` calls
- [ ] Pluralization handled via `t(key, { count })`, not manual `if/else`
- [ ] App Router routes use server-side translations for SEO-critical content
- [ ] No `defaultNS` fallback being used implicitly for new code
- [ ] `i18next-parser` ran clean — no untracked keys, no orphans
- [ ] Fallback locale set explicitly (`fallbackLng`)
- [ ] Locale completeness check passes in CI
- [ ] Regression test added before fixing an i18n bug
