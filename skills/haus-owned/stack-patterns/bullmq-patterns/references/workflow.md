# Workflow

## Implementation steps

1. For a new queue: create `queues/<name>.queue.ts` exporting `new Queue<TData>("<name>", { connection: createBullMqConnection() })`.
2. Create the matching `workers/<name>.worker.ts` with a typed processor function and a fresh connection.
3. Set explicit `concurrency` on the `Worker` based on workload and Redis capacity.
4. Set retention via `defaultJobOptions: { removeOnComplete: 1000, removeOnFail: 5000 }`.
5. Add retry policy via `attempts: 3, backoff: { type: "exponential", delay: 1000 }` on job options.
6. For repeatable jobs, set a stable `jobId` in `repeat` options so redeploys don't duplicate.
7. Wire graceful shutdown: on `SIGTERM` call `await worker.close()` and `await queue.close()` before exiting.
8. Type the queue with generics: `new Queue<JobData, JobResult>("...", ...)`.
9. Add a regression test that enqueues a job and asserts the worker processes it (use a test Redis or `ioredis-mock`).

## Commands

```bash
# Local Redis (Docker)
docker-compose up redis

# BullMQ Board (admin UI) — only run in dev/staging, never expose to prod
yarn bullmq-board                              # or @bull-board/* if integrated

# Inspect queue state via redis-cli
redis-cli KEYS "bull:<queue-name>:*"
redis-cli LLEN "bull:<queue-name>:waiting"
redis-cli LLEN "bull:<queue-name>:active"

# Drain a stuck queue (DESTRUCTIVE — confirm before running in prod)
redis-cli DEL "bull:<queue-name>:waiting"

# Tests
yarn vitest run workers/__tests__/<name>.test.ts
yarn jest workers/<name>.test.ts
```

## Validation checklist

- [ ] Queue + Worker each use a fresh `IORedis` instance (not shared)
- [ ] `concurrency` set explicitly on every `Worker`
- [ ] `removeOnComplete` / `removeOnFail` retention bounded
- [ ] Retry policy (`attempts` + `backoff`) declared on jobs that need it
- [ ] Repeatable jobs carry stable `jobId` to dedupe across deploys
- [ ] Graceful shutdown on `SIGTERM` closes workers + queues
- [ ] Job data shape typed via generics; no `as any` casts
- [ ] No PII logged from job data
- [ ] `Worker` `error` event handler logs to observability (Sentry / pino)
- [ ] Connection uses `IORedis` from `ioredis` package, not `redis` (node-redis)
- [ ] Bull (v3) and BullMQ not mixed in the same project
- [ ] Regression test added before fixing a queue/worker bug
