---
name: sanity-patterns
description: Sanity router. Use for Sanity v3/v5 schema, Studio plugin config, GROQ queries, and next-sanity integration.
---

# Sanity Patterns

## Use when

- task changes Sanity content schema (`schemas/*.ts`, `sanity.types.ts`)
- task touches Studio config (`sanity.config.ts`), plugins, or desk structure
- task writes or modifies GROQ queries (`*.groq`, query strings in TS)
- task wires Sanity into Next.js via `next-sanity` (live preview, draft mode, fetch helpers)

## Do not use when

- project uses Strapi, WordPress, or another CMS (use the matching skill)
- task is pure Next.js routing or React rendering with no Sanity contract change
- task is image pipeline only with no Sanity schema impact

## Inspect first

- `sanity.config.ts` — projectId, dataset, plugins, structure
- `schemas/index.ts` and each schema file affected
- `sanity.types.ts` (if generated) for typed client usage
- `next-sanity` setup: `lib/sanity.client.ts`, `lib/sanity.fetch.ts`, draft-mode route handler
- environment variables: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`

## Avoid mistakes

- shipping a schema rename without a content migration plan — breaks live documents
- using `@sanity/client` directly in a server component when `next-sanity` `defineLive` is wired
- leaking `SANITY_API_TOKEN` (write token) to client bundles — always server-only
- writing GROQ that bypasses `perspective: "published"` in production reads (drafts leak)
- hand-typing query results instead of generating with `sanity-codegen` / `yarn sanity typegen`

## Router

1. Load `references/conventions.md` for schema, GROQ, and integration patterns.
2. Load `references/scope.md` for in-scope files and stack boundaries.
3. Load `references/workflow.md` only for schema migration and preview-mode diagnosis.
4. Keep schemas typed, GROQ minimal, and write tokens server-only.

## References

- references/conventions.md
- references/scope.md
- references/workflow.md
