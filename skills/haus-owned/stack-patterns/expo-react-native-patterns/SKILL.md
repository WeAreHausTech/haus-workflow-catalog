---
name: expo-react-native-patterns
description: Expo + React Native router. Use for Expo Router routes, RN components, native modules, expo config plugins, and EAS build/submit.
---

# Expo / React Native Patterns

## Use when

- task changes Expo Router routes (`app/_layout.tsx`, `app/(tabs)/*.tsx`)
- task touches React Native components, hooks, or native modules
- task modifies `app.json` / `app.config.ts` / `expo.json`
- task adds or modifies an Expo config plugin (`plugins/*`)
- task wires EAS Build / EAS Submit (`eas.json`) or app store metadata

## Do not use when

- project is web-only React (use `react19-patterns`)
- task is bare React Native without Expo — many Expo APIs don't apply
- task is unrelated to mobile (native iOS Swift / Android Kotlin without RN wrapper)

## Inspect first

- `app.json` / `app.config.ts` — name, slug, scheme, plugins, splash, icons, EAS projectId
- `eas.json` — build profiles (development, preview, production), submit config
- `app/_layout.tsx` — root navigation, Stack/Tabs setup, providers
- `metro.config.js` — Metro bundler config (custom resolvers, transformers)
- `package.json` — `expo` SDK major version (router patterns differ by SDK)
- iOS/Android native folders if `expo prebuild` has been run (managed-vs-bare workflow)

## Avoid mistakes

- importing Node.js modules (`fs`, `path`) into RN code — bundler crashes
- using `localStorage` / `sessionStorage` — use `@react-native-async-storage/async-storage` or `expo-secure-store`
- editing `ios/` / `android/` folders directly when on managed workflow (Expo overwrites on prebuild)
- forgetting to register Expo config plugin in `app.json` `plugins` array
- mixing React Navigation v6 patterns with Expo Router (file-based) — pick one
- importing web-only libraries (no RN support) — fails at runtime, not compile

## Router

1. Load `references/conventions.md` for routing, component, and native module patterns.
2. Load `references/scope.md` for in-scope files and managed-vs-bare boundaries.
3. Load `references/workflow.md` only for EAS build, OTA update, and store submission flow.
4. Keep platform-specific code behind `Platform.OS` checks; use Expo APIs over raw RN where available.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
