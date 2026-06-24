---
name: laravel-nova-patterns
description: Laravel Nova router. Use for admin resources, actions, fields, filters, and policies.
---

# Laravel Nova Patterns

## Use when

- task changes Nova admin resources, fields, actions, cards, or filters
- task touches `app/Nova/*`, resource policies, or Nova tool integration

## Do not use when

- task is customer-facing API/domain change without admin UI impact
- task belongs to non-Laravel admin stacks

## Inspect first

- `app/Nova/*` resource classes and custom fields/actions
- linked Eloquent model + policy files
- validation rules and lens/filter query logic

## Avoid mistakes

- exposing sensitive fields in index/detail views
- writing expensive unbounded queries in filters/lenses
- mismatching resource field rules vs model validation/policies

## Router

1. Load `references/conventions.md` for naming, do/don't, and forbidden patterns.
2. Load `references/scope.md` for Nova file targets.
3. Load `references/workflow.md` only for resource lifecycle flow.
4. Verify admin authorization and data visibility before handoff.

## References

- references/scope.md
- references/workflow.md

## Reference Documentation

Up-to-date API docs are cached locally by haus.

To refresh (uses etag — fast if unchanged):

```bash
haus fetch-refs --id haus.laravel-nova-patterns
```

Then read `.haus-workflow/llms-cache/nova-laravel-com-docs-llms-txt.md` for current API reference.

Source: https://nova.laravel.com/docs/llms.txt
