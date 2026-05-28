# Workflow

## Implementation steps

1. Run `expo-doctor` first — catches config drift, mismatched SDK versions, missing peer deps.
2. For a new route, add the file under `app/` matching the desired URL segment; export a default component.
3. Update `app/_layout.tsx` if the route needs custom `<Stack.Screen>` options (header, presentation).
4. Add config plugins to `app.json` `plugins` array; pass `[name, options]` tuples when options are needed.
5. For native modules requiring native code, use a config plugin or `expo prebuild` to materialize `ios/` and `android/`.
6. Test on iOS simulator and Android emulator before EAS build: `yarn expo start --ios`, `--android`.
7. Configure `eas.json` profiles (development, preview, production) before running `eas build`.
8. For runtime env, use `EXPO_PUBLIC_*` prefix; access via `process.env.EXPO_PUBLIC_*`.
9. For OTA updates, set `runtimeVersion` policy in `app.json` and use `eas update`.
10. Run `expo-doctor` again after major changes; commit `expo-env.d.ts` if generated.

## Commands

```bash
yarn expo start                                # dev server (interactive picker for iOS/Android/web)
yarn expo start --ios                          # launch iOS simulator
yarn expo start --android                      # launch Android emulator
yarn expo install <pkg>                        # install pkg with SDK-matched version
yarn expo prebuild                             # generate ios/ + android/ folders (one-way exit from managed)
yarn expo prebuild --clean                     # regenerate native code (managed workflow)
yarn expo-doctor                               # config + dependency check
yarn expo customize                            # eject specific files (metro.config, babel.config, etc.)

# EAS Build / Submit / Update
yarn eas build --profile development           # cloud build with development client
yarn eas build --profile production --platform ios
yarn eas submit --platform ios                 # submit to App Store
yarn eas update --branch production            # publish OTA update

# Typed routes (when enabled)
yarn expo-router-typed-routes                  # regenerate route type declarations
```

## Validation checklist

- [ ] `expo-doctor` runs clean — no version mismatches or missing peers
- [ ] `app.json` / `app.config.ts` plugins array lists every required config plugin
- [ ] No Node-only imports (`fs`, `path`, `crypto`) anywhere in `app/` or `components/`
- [ ] `Platform.OS` checks present for iOS/Android divergent code paths
- [ ] Auth tokens stored via `expo-secure-store`, never `AsyncStorage`
- [ ] `EXPO_PUBLIC_*` env vars used only for client-safe values
- [ ] Safe area handled via `useSafeAreaInsets` — no hard-coded padding for notch
- [ ] `expo-image` used for remote images
- [ ] `runtimeVersion` policy set in `app.json` if OTA updates are used
- [ ] Builds tested in all `eas.json` profiles relevant to the change
- [ ] No edits to `ios/` / `android/` on managed workflow
- [ ] Regression test (Jest/Vitest with `jest-expo` or `@testing-library/react-native`) before fix
