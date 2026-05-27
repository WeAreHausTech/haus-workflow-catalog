## Naming conventions

- Callback handlers: `handleCallback`, `handleLogout`, `handleSilentRenew`
- Token utilities in `lib/auth/` — e.g. `lib/auth/tokenUtils.ts`, `lib/auth/sessionUtils.ts`
- Claims mappers in `lib/claims/` — e.g. `lib/claims/azureClaimsMapper.ts`, `lib/claims/bankIdClaimsMapper.ts`
- OIDC config objects: `oidcConfig`, `azureAdConfig`, `bankIdConfig` (camelCase, provider-prefixed)
- Middleware/guard files: `authGuard.ts`, `oidcMiddleware.ts` (lowercase-hyphen or camelCase)
- Session cookie name constant: `SESSION_COOKIE_NAME` (SCREAMING_SNAKE for constants)

## Do / don't

DO: Validate `state` and `nonce` server-side on every callback — DON'T: trust client-supplied state without comparing to server session value
DO: Use PKCE (`code_challenge` + `code_verifier`) for all public/SPA clients — DON'T: use implicit flow; it exposes tokens in URL fragments
DO: Store session identifiers in `httpOnly`, `Secure`, `SameSite=Lax` cookies — DON'T: store access tokens or refresh tokens in `localStorage` or `sessionStorage`
DO: Verify `iss` and `aud` claims when validating tokens — DON'T: trust `sub` claim without confirming the issuer matches the configured provider
DO: Rotate session identifier after successful authentication (session fixation protection) — DON'T: reuse pre-auth session ID post-login
DO: Use short-lived access tokens and refresh via server-side token exchange — DON'T: set access token TTL > 15 minutes for sensitive resources
DO: Log auth events (login success, logout, token refresh) without token/claim values — DON'T: log raw tokens, claims payloads, or `id_token` strings
DO: Derive `redirect_uri` from server-side config only — DON'T: accept `redirect_uri` from query params or user-controlled input

## Forbidden patterns

NEVER: Construct `redirect_uri` from user-supplied query parameters — open redirect vulnerability
NEVER: Skip token signature validation in tests — establishes false confidence in auth flow
NEVER: Decode JWT without verifying signature (e.g. `jwt.decode()` without `jwt.verify()`) — tokens can be forged
NEVER: Store BankID personal number in session beyond immediate verification — PII retention risk
NEVER: Catch and swallow auth errors silently — auth failures must surface or be logged
NEVER: Return full claims object in API response — expose only mapped, required attributes
NEVER: Use `alg: none` or skip algorithm validation in JWT verification — critical security bypass
