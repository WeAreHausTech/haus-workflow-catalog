## Naming conventions

- Schema files: `schemas/<docType>.ts` exporting a `defineType` call; one type per file
- Schema `name` field: lowercase camelCase matching the file basename
- Schema `title` field: human-readable, used in Studio navigation
- Object types (reusable): `schemas/objects/<name>.ts`
- Field-level objects: inline in parent schema unless reused 2+ times
- GROQ query constants: `lib/queries.ts` exporting `*Query` named constants in SCREAMING_SNAKE or camelCase
- Typed query results: generated via `yarn sanity typegen generate` into `sanity.types.ts`
- Studio plugins: `sanity.config.ts` `plugins` array; one feature per plugin entry

## Do / don't

DO: Use `defineType` / `defineField` / `defineArrayMember` from `sanity` — DON'T: write plain object literals (loses type safety)
DO: Generate types with `sanity typegen` and import them — DON'T: hand-write query result types
DO: Use `next-sanity` `defineLive` + `<SanityLive>` in App Router root layout for ISR — DON'T: manually wire revalidation tags per page
DO: Keep `SANITY_API_READ_TOKEN` and `SANITY_API_WRITE_TOKEN` server-only — DON'T: expose via `NEXT_PUBLIC_*`
DO: Project GROQ results with explicit fields (`{ _id, title, slug }`) — DON'T: select `...` and return whole docs unfiltered
DO: Use `perspective: "published"` for production reads, `"previewDrafts"` only in draft mode — DON'T: serve drafts to anonymous users
DO: Use `groq` tagged template for GROQ literals (enables IDE plugins + typegen) — DON'T: build query strings via concatenation
DO: Use `defineConfig.releases.enabled = true` only when content release feature is active — DON'T: enable speculatively

## Forbidden patterns

NEVER: write token in client bundle — `import` from a `.server.ts` module only
NEVER: rename a schema `name` without a content migration script — breaks all existing documents
NEVER: query without projection (e.g. `*[_type == "post"]`) on large datasets — fetches entire docs
NEVER: rely on `_updatedAt` for cache invalidation — use `revalidateTag` from `next-sanity`
NEVER: store sensitive data (PII, secrets) in Sanity documents — Studio editors see everything
NEVER: GROQ in server components without a typed wrapper — drift between query and component
NEVER: schema field reordering without explicit `order` if `orderings` depends on visual order
NEVER: skip `validation: (Rule) => Rule.required()` on required fields — Studio lets empty docs through
