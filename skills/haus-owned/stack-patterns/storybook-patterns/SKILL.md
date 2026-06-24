---
name: storybook-patterns
description: Storybook router. Use for component stories, controls, docs stories, and visual regression preparation.
---

# Storybook Patterns

## Use when

- task changes shared component variants and requires story coverage updates
- task touches `*.stories.*`, Storybook config, or component docs playgrounds

## Do not use when

- task is backend/domain behavior unrelated to component stories
- task is one-off page logic with no reusable component API change

## Inspect first

- affected component file and matching stories
- Storybook preview/main config for decorators/providers
- controls/args that represent public component API

## Avoid mistakes

- stories that diverge from real component contract
- hardcoded mock data that hides edge states
- missing interaction/a11y states for modified components

## Router

1. Load `references/conventions.md` for naming, do/don't, and forbidden patterns.
2. Load `references/scope.md` for story-config boundaries.
3. Load `references/workflow.md` only for story/debug/coverage flow.
4. Keep stories aligned with component public API and states.

## References

- references/scope.md
- references/workflow.md

## Reference Documentation

Up-to-date API docs are cached locally by haus.

To refresh (uses etag — fast if unchanged):

```bash
haus fetch-refs --id haus.storybook-patterns
```

Then read `.haus-workflow/llms-cache/storybook-js-org-llms-txt.md` for current API reference.

Source: https://storybook.js.org/llms.txt
