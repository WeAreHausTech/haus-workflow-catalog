---
name: auth-oidc-azure-bankid-patterns
description: Enterprise auth router for OIDC, Azure AD, BankID, and SAML2 identity flows.
---

# Enterprise Auth Patterns (OIDC / Azure AD / BankID / SAML2)

## Use when

- task modifies login/session/token/claims or external identity provider integration
- task touches auth middleware/guards, callback handlers, or identity config
- task wires or modifies SAML2 SP/IDP metadata, ACS endpoints, or assertion validation (e.g. Laravel `24slides/laravel-saml2`)

## Do not use when

- task is generic user profile CRUD with no auth protocol change
- task is unrelated to identity, tokens, or access policy
- task is `next-auth` / `@auth/core` session work (use `nextauth-patterns`)

## Inspect first

- auth guard/middleware and session/token handling files
- OIDC/Azure/BankID provider config and callback handlers
- SAML2 config files: SP entityId, ACS URL, IDP metadata XML, certificate fingerprint
- claim/role mapping logic and downstream authorization checks

## Avoid mistakes

- accepting unvalidated tokens/claims
- changing redirect/callback URLs without env/config alignment
- mixing authentication identity with authorization policy logic
- accepting SAML assertions without signature validation or with mismatched audience/issuer
- shipping SAML SP private keys or IDP shared secrets in repo

## Router

1. Load `references/conventions.md` for naming, do/don't, and forbidden patterns.
2. Load `references/scope.md` for provider integration touchpoints.
3. Load `references/workflow.md` only for auth flow and failure path tracing.
4. Validate token/session lifecycle and permission impact.

## References

- references/scope.md
- references/workflow.md
