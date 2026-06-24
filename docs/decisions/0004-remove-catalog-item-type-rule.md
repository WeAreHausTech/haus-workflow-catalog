# ADR-0004: Remove unused `rule` catalog item type

## Status

Accepted (2026-06-16)

## Context

`catalog-item.schema.json` and `haus-workflow` `CatalogItem.type` included `'rule'` as a
valid item type. No manifest item ever used it. The CLI sync path (`KNOWN_ITEM_TYPES`) already
omitted `'rule'`, so a hypothetical `rule` item would sync-fail while the recommender could
still surface it — split-brain between schema and runtime.

The meta tag `rule` in `validation-rules.json#allowedStacks` is unrelated (tagging convention
for hook/rule content) and is **not** removed.

## Decision

Remove `'rule'` from:

- `schema/catalog-item.schema.json` `type` enum
- `schema/haus-lock.schema.json` item `type` enum
- `haus-workflow` `CatalogItem.type` union (`src/types.ts`)

Supported item types remain: `skill`, `agent`, `template`, `command`.

## Consequences

- Schema and CLI types match runtime behavior.
- No migration: zero shipped `rule` items.
- Future “rules as catalog items” would need a new ADR and enum re-entry with full sync/recommend wiring.
