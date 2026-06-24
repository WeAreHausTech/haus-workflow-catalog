---
name: bullmq-patterns
description: BullMQ router. Use for queue definitions, workers, schedulers, repeatable jobs, and graceful shutdown.
---

# BullMQ Patterns

## Use when

- task adds, modifies, or removes a BullMQ queue, worker, scheduler, or flow
- task touches Redis connection wiring for BullMQ (`new Queue("name", { connection })`)
- task adds repeatable jobs (cron, every-N-ms) or delayed jobs
- task wires graceful shutdown (worker drain, queue close) into app lifecycle

## Do not use when

- project uses a different job system (Bull v3, Agenda, custom in-process scheduler)
- task is in-process scheduling without Redis (use a different skill)
- task is Redis general usage with no BullMQ surface (use `database-patterns`)

## Inspect first

- Queue definitions: `queues/*.ts` or `src/queues/*.ts`
- Worker definitions: `workers/*.ts` — `new Worker(name, processor, { connection })`
- Shared Redis connection module: typically `lib/redis.ts` (must be `IORedis` instance for BullMQ)
- App lifecycle: where workers start, where they're closed on `SIGTERM` / `SIGINT`
- `package.json` BullMQ version — 5.x has breaking changes vs 4.x

## Avoid mistakes

- creating multiple `IORedis` connections — BullMQ requires a separate connection per Queue/Worker
- using `Redis` from `redis` package (node-redis) — BullMQ requires `IORedis`
- mixing `bull` v3 and `bullmq` packages — different APIs, can't share queues
- forgetting `concurrency` on `Worker` — defaults to 1, blocks throughput
- not closing workers on shutdown — jobs marked failed when worker disappears
- swallowing job errors in the processor — failed jobs disappear silently

## Router

1. Load `references/conventions.md` for queue, worker, and connection patterns.
2. Load `references/scope.md` for in-scope files and stack boundaries.
3. Load `references/workflow.md` only for graceful shutdown and job retry diagnosis.
4. Keep one queue per concern; share `IORedis` instances per role (Queue vs Worker).

## References

- references/conventions.md
- references/scope.md
- references/workflow.md

## Reference Documentation

Up-to-date API docs are cached locally by haus.

To refresh (uses etag — fast if unchanged):

```bash
haus fetch-refs --id haus.bullmq-patterns
```

Then read `.haus-workflow/llms-cache/docs-bullmq-io-llms-txt.md` for current API reference.

Source: https://docs.bullmq.io/llms.txt
