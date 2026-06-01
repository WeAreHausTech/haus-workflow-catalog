# Scope

## In-scope files and dirs

- `queues/**/*.ts` — `Queue` definitions
- `workers/**/*.ts` — `Worker` definitions and processors
- `lib/redis.ts` / `src/lib/redis.ts` — `IORedis` factory for BullMQ connections
- `src/main.ts` / `src/server.ts` / `app.ts` — lifecycle wiring (worker start, graceful shutdown)
- `package.json` — `bullmq`, `ioredis` versions
- `docker-compose.*` — Redis service when running locally
- `.env` / `.env.example` — `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`

## Stack boundaries

- BullMQ 4.x and 5.x: 5.x has breaking changes — verify version before applying patterns
- `IORedis` is required — `redis` (node-redis) is not compatible
- Vendure backends use BullMQ via `@vendure/job-queue-plugin/package/bullmq` — wrap conventions apply
- NestJS apps use `@nestjs/bullmq` adapter — provider patterns differ but underlying queue semantics match
- Not in scope: Bull v3 (`bull` package), Agenda, in-process schedulers, Sidekiq, RabbitMQ

## Triggers

- Adding a new queue or worker
- Changing job data shape (breaking change for in-flight jobs)
- Switching connection options (TLS, sentinel, cluster)
- Adding a repeatable / cron job
- Adding `attempts` / `backoff` retry policy
- Wiring graceful shutdown
- Migrating from Bull v3 to BullMQ
- Upgrading BullMQ major version (4 → 5)
