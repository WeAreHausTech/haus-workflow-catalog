## Naming conventions

- Expo Router file-based routing: `app/` directory; segments map to URL paths
- Layout files: `app/_layout.tsx` (root), `app/(group)/_layout.tsx` (group layouts)
- Route groups: parenthesized folder names `(tabs)`, `(auth)` — do not appear in URL
- Dynamic segments: `[slug].tsx`; catch-all: `[...rest].tsx`; optional: `[[slug]].tsx`
- Not-found: `app/+not-found.tsx`
- Modal routes: declared in parent layout `<Stack.Screen name="modal" options={{ presentation: "modal" }} />`
- Component files: PascalCase (`ProductCard.tsx`); hooks: camelCase prefixed `use` (`useColorScheme.ts`)
- Native asset folders: `assets/images/`, `assets/fonts/`
- Config plugin: `plugins/with-<feature>.ts` exporting a `ConfigPlugin`
- Env: `EXPO_PUBLIC_*` for client-readable; everything else server-only (build-time substitution)

## Do / don't

DO: Use `expo-router` `<Link>` and `useRouter()` for navigation — DON'T: mix `@react-navigation/native` imperative navigation
DO: Use `Platform.OS` checks for platform-specific code — DON'T: assume web behavior in RN
DO: Use `expo-secure-store` for tokens, `async-storage` for prefs — DON'T: `localStorage` (doesn't exist in RN)
DO: Use `expo-image` over `Image` for caching + performance — DON'T: ship raw `<Image source={...} />` for remote images
DO: Use `useSafeAreaInsets` from `react-native-safe-area-context` — DON'T: hard-code padding for notch/dynamic island
DO: Define color schemes via `useColorScheme()` + theme — DON'T: hard-code colors for dark mode
DO: Use `expo-router` `Stack.Screen` `options` to set per-route header — DON'T: render custom header inside the screen
DO: For env vars, prefix with `EXPO_PUBLIC_` only when needed on client — DON'T: leak server secrets via this prefix
DO: Run `expo-doctor` before EAS build — DON'T: ship a known-bad config

## Forbidden patterns

NEVER: import `fs`, `path`, `crypto`, or Node-only modules into RN code — Metro bundler crashes
NEVER: edit `ios/` or `android/` folders on managed workflow — `expo prebuild` overwrites
NEVER: hard-code API URLs that differ across environments — use `EXPO_PUBLIC_API_URL` or `Constants.expoConfig.extra`
NEVER: skip `Platform.select` for known iOS/Android divergences (haptics, share, etc.)
NEVER: ship without `expo-updates` config when OTA updates are expected
NEVER: bundle large fonts/images without `useFonts` / asset preloading — first-render flash
NEVER: store auth tokens in `AsyncStorage` plaintext — use `expo-secure-store` (Keychain/Keystore backed)
NEVER: enable `expo-router` typed routes (`experimental.typedRoutes`) without regenerating after route additions
NEVER: ignore `expo-doctor` warnings before a release — silent breakage in EAS pipeline
