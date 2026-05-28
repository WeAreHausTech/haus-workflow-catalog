# Scope

## In-scope files and dirs

- `app/**` — Expo Router file-based routes, layouts, not-found
- `app.json` / `app.config.ts` — Expo config (name, slug, plugins, splash, icons, EAS projectId)
- `eas.json` — EAS Build / Submit profiles
- `metro.config.js` — Metro bundler config
- `babel.config.js` — Babel preset (must include `babel-preset-expo`)
- `plugins/with-*.ts` — local Expo config plugins
- `assets/**` — fonts, images, splash assets
- `components/**`, `hooks/**`, `lib/**` — application code shared across routes
- `ios/` / `android/` — only when bare workflow or after `expo prebuild`

## Stack boundaries

- Managed workflow: Expo handles native code; `ios/` and `android/` are generated, not committed
- Bare workflow: `ios/` and `android/` committed; full native control
- Expo Router (file-based) vs React Navigation v6 (imperative) — pick one; this skill assumes Expo Router
- EAS Build for cloud builds; local prebuild for self-hosted CI
- Web target via Expo Web → combine with web React skills, but performance differs
- Not in scope: pure React Native CLI without Expo (use a separate RN skill)

## Triggers

- Adding a new route or modifying layout
- Adding a native module or config plugin
- Changing `app.json` / `app.config.ts` schema (icons, plugins, scheme, runtimeVersion)
- Setting up or modifying EAS Build profiles
- Switching managed ↔ bare workflow
- Updating Expo SDK major version
- Adding OTA update flow with `expo-updates`
- Adjusting iOS / Android-specific behavior (haptics, share sheet, deep links)
