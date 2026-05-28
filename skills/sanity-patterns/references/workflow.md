# Workflow

## Implementation steps

1. For schema changes: edit the affected `schemas/*.ts` file using `defineType` / `defineField`.
2. Add `validation: (Rule) => Rule.required()` for required fields — Studio enforces it.
3. For schema renames or removals, write a migration script under `migrations/` using `@sanity/client` write token.
4. Regenerate types: `yarn sanity typegen generate` (or project-defined `yarn typegen`) — commit the result.
5. For GROQ changes, edit `lib/queries.ts` and use `groq` tagged template literal.
6. For Next.js consumers, fetch via `next-sanity` `sanityFetch({ query, tags })` — never `@sanity/client` directly in App Router.
7. For draft mode, ensure `app/api/draft-mode/enable/route.ts` validates the secret and sets `draftMode().enable()`.
8. Run Studio locally (`yarn sanity dev`) and confirm schema renders without warnings.
9. Run typecheck — generated types catch query/schema drift.
10. Add a regression test for query shape via a typed integration test (Vitest).

## Commands

```bash
yarn sanity dev                                # run embedded Studio locally
yarn sanity deploy                             # deploy Studio to *.sanity.studio
yarn sanity typegen generate                   # regenerate sanity.types.ts from schemas + queries
yarn sanity manage                             # open Sanity dashboard for the project
yarn sanity dataset list                       # list datasets
yarn sanity dataset export production ./backup.tar.gz   # backup before migrations
yarn sanity exec ./migrations/rename-field.ts  # run a migration script

# next-sanity / Next.js
yarn dev                                       # Next dev server
yarn build                                     # production build (typegen must run first)
```

## Validation checklist

- [ ] All schemas use `defineType` / `defineField` — no plain object literals
- [ ] `sanity.types.ts` regenerated and committed after schema or query changes
- [ ] Required fields carry `Rule.required()` validation
- [ ] GROQ queries use `groq` tagged template, never string concatenation
- [ ] Production reads use `perspective: "published"` (or default); drafts only behind auth
- [ ] No `SANITY_API_WRITE_TOKEN` or write-scoped tokens in `NEXT_PUBLIC_*` env or client bundle
- [ ] Schema renames have a content migration script with backup taken first
- [ ] `next-sanity` `defineLive` wired once at root layout, not per-page
- [ ] Studio runs without console warnings (`yarn sanity dev`)
- [ ] Typecheck passes after typegen (`tsc --noEmit`)
- [ ] Regression test added before fixing a query/schema bug
