# Scope

## In-scope files and dirs

- `sanity.config.ts` — projectId, dataset, plugins, structure
- `schemas/**/*.ts` — content type and object definitions
- `sanity.cli.ts` — CLI config (project linking, dataset selection)
- `sanity.types.ts` — generated types (treat as build output)
- `lib/sanity.client.ts` / `lib/sanity.fetch.ts` — client wrappers in Next.js consumers
- `lib/queries.ts` — GROQ query constants
- `app/(sanity)/**` or `app/studio/[[...tool]]/page.tsx` — embedded Studio routes
- `app/api/draft-mode/**` — draft mode route handlers
- `studio/` — standalone Studio project (when separated from Next.js app)

## Stack boundaries

- Sanity v3/v5 framework: schemas via `defineType`, Studio in React, GROQ for queries
- Sanity + Next.js: `next-sanity` for typed fetch, `defineLive` for live preview, draft route for Studio integration
- Image pipeline: `@sanity/image-url` for transforms
- Not in scope: Strapi (`strapi-patterns`), WordPress (`wordpress-patterns`)
- Not in scope: pure Next.js routing (`nextjs-patterns`)
- Not in scope: GraphQL schema work — Sanity uses GROQ, not GraphQL

## Triggers

- Adding a new document type or modifying an existing schema field
- Adding or changing a GROQ query consumed in Next.js
- Wiring or updating draft mode / preview mode
- Switching `perspective` for a query (published vs previewDrafts)
- Migrating from `@sanity/client` direct usage to `next-sanity` `sanityFetch`
- Adjusting Studio structure builder or desk navigation
- Schema rename or removal — requires content migration
