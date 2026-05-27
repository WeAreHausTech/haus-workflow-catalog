## Naming conventions

- Hosted services: `XxxBackgroundService` implementing `BackgroundService`
- Message consumers: `XxxConsumer` implementing the broker interface (e.g. `IConsumer<XxxMessage>`)
- Commands: `XxxCommand`; handlers: `XxxCommandHandler`
- Events: `XxxCreatedEvent`, `XxxFailedEvent` (past-tense noun)
- Retry/resilience policies: defined in `ResiliencePolicies.cs` or as named Polly policies in DI
- Idempotency key property: `IdempotencyKey` (PascalCase, on all command/message DTOs)

## Do / don't

DO: Use `StoppingToken` from `ExecuteAsync(CancellationToken stoppingToken)` for graceful shutdown — DON'T: ignore cancellation in the main service loop
DO: Include an idempotency key on all message consumers and handle duplicate delivery — DON'T: assume the broker delivers each message exactly once
DO: Apply Polly retry with exponential backoff and jitter on all external HTTP/service calls — DON'T: retry immediately in a tight loop (causes thundering herd)
DO: Pair every retry policy with a circuit breaker — DON'T: retry unbounded without circuit breaker on degraded downstream
DO: Use `IHostedService` / `BackgroundService` lifecycle correctly (start fast, stop gracefully) — DON'T: do heavy init in `StartAsync`; defer to `ExecuteAsync`
DO: Structured-log consumer processing start, completion, and failure with correlation IDs — DON'T: swallow consumer exceptions silently
DO: Use `IServiceScopeFactory` inside background services to resolve scoped dependencies — DON'T: inject Scoped services directly into a Singleton background service

## Forbidden patterns

NEVER: `Thread.Sleep()` inside a hosted service — blocks thread pool; use `await Task.Delay()`
NEVER: Fire-and-forget `Task` without error handling — unobserved exceptions crash the host in some runtimes
NEVER: Consumer that throws on receiving a duplicate message — must be idempotent
NEVER: `.Result` or `.Wait()` in async background service code — deadlock risk
NEVER: Unbounded retry without circuit breaker — can cascade failures across services
NEVER: `HttpContext` accessed from a background service — background services have no HTTP context
NEVER: Queue consumer that acks a message before processing is complete — leads to data loss on crash
