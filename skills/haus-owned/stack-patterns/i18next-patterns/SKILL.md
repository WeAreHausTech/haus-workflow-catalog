---
name: i18next-patterns
description: i18next router. Use for translation namespace structure, key conventions, SSR-safe loading, and locale switching.
---

# i18next Patterns

## Use when

- task adds, modifies, or restructures translation keys / namespaces
- task touches i18next config (`i18n.ts`, `i18next.config.ts`, language detector)
- task wires `react-i18next`, `next-i18next`, or App Router server-side translations
- task adds locale routing or locale-aware redirects

## Do not use when

- project uses a non-i18next translation system (FormatJS, Lingui)
- task is static content with no locale dimension
- task is purely backend with no user-facing copy

## Inspect first

- `i18n.ts` / `lib/i18n.ts` — init config, namespaces, fallback, detection
- `public/locales/<lang>/<ns>.json` (next-i18next pattern) or `locales/<lang>/<ns>.json`
- React/Vue consumer: `useTranslation(ns)` call sites and current key shape
- SSR / App Router setup if applicable (`getServerSideTranslations`, custom loader)
- language detector config: query > cookie > localStorage > navigator

## Avoid mistakes

- duplicating keys across namespaces — pick one and reference via cross-ns reference
- hard-coding strings instead of translating — breaks locale completeness checks
- loading every namespace on every page — set `ns` list per route
- mixing `t(key)` calls with template literals — disables key extraction
- relying on `react-i18next` `Suspense` without a Suspense boundary — blank UI

## Router

1. Load `references/conventions.md` for namespace, key, and interpolation patterns.
2. Load `references/scope.md` for in-scope files and SSR-vs-client boundaries.
3. Load `references/workflow.md` only for locale add/remove or missing-key diagnosis flow.
4. Keep keys flat, namespaces small, server translations explicit per route.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md

## Reference Documentation

Up-to-date API docs are cached locally by haus.

To refresh (uses etag — fast if unchanged):

```bash
haus fetch-refs --id haus.i18next-patterns
```

Then read `.haus-workflow/llms-cache/www-i18next-com-llms-txt.md` for current API reference.

Source: https://www.i18next.com/llms.txt
