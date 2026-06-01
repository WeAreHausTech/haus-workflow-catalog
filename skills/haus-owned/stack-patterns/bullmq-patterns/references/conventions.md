## Naming conventions

- Queue names: kebab-case, descriptive of the work (`email-send`, `order-fulfillment`, `image-resize`)
- Queue module files: `queues/<name>.queue.ts` exporting the `Queue` instance
- Worker module files: `workers/<name>.worker.ts` exporting the `Worker` instance
- Job names within a queue: kebab-case (`send-welcome-email`, `retry-failed-payment`)
- Job data type: explicit TypeScript interface — `interface SendWelcomeEmailJob { userId: string }`
- Connection module: `lib/redis.ts` exporting `IORedis` factory (`createBullMqConnection()`)
- Scheduler / repeatable job IDs: stable keys so re-deploy doesn't duplicate (`repeat: { jobId: "daily-cleanup" }`)

## Do / don't

DO: Use one `IORedis` instance per `Queue` and one per `Worker` (BullMQ requirement) — DON'T: share a single instance across both
DO: Set `Worker` `concurrency` explicitly (e.g. `{ concurrency: 5 }`) — DON'T: rely on the default of 1
DO: Set `removeOnComplete` / `removeOnFail` retention to bounded values — DON'T: keep all jobs forever (Redis memory bloat)
DO: Pass connection as a shared factory result, not a literal options object — DON'T: instantiate `new IORedis({...})` inline per queue
DO: Use `attempts` + `backoff` for retry policy — DON'T: implement retry by re-adding jobs manually
DO: For repeatable jobs use `jobId` to dedupe across deploys — DON'T: rely on `repeat.cron` alone (creates new entries each deploy)
DO: Type job data via `Queue<TData, TResult>` generics — DON'T: cast `as any` in processor
DO: Throw inside the processor to mark the job failed — DON'T: catch and return silently
DO: Close workers + queues in a `SIGTERM` handler — DON'T: rely on process exit alone

## Forbidden patterns

NEVER: use `Redis` from the `redis` (node-redis) package — BullMQ requires `IORedis` from `ioredis`
NEVER: mix `bull` (v3) and `bullmq` packages in the same project — different APIs, queue shapes differ
NEVER: store secrets or PII in job data without server-side encryption — Redis backups may leak
NEVER: log full job data containing user input verbatim — PII leakage
NEVER: ignore `Worker` error events (`worker.on("error", ...)`) — silent failure
NEVER: skip the `connection` option when constructing `Queue` / `Worker` — BullMQ refuses to start
NEVER: run worker concurrency higher than Redis connection pool can support
NEVER: deploy without graceful shutdown — in-flight jobs marked failed mid-execution
NEVER: rely on `jobId` collision detection to dedupe long-running schedules without TTL — old jobs linger
