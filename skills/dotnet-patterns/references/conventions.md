## Naming conventions

- Controllers: `XxxController` (suffix required, extend `ControllerBase` for API)
- Service interfaces and implementations: `IXxxService` / `XxxService` (interface with `I` prefix)
- DTOs: `XxxRequest` (incoming), `XxxResponse` (outgoing) — never expose domain entities directly
- Command/query handlers (MediatR): `XxxHandler` implementing `IRequestHandler<XxxCommand, XxxResponse>`
- Commands and queries: `XxxCommand`, `XxxQuery` — noun describing the operation target
- Extension methods class: `XxxExtensions` (PascalCase with `Extensions` suffix)
- Middleware: `XxxMiddleware` implementing `IMiddleware` or the `Invoke` convention

## Do / don't

DO: Put business logic in services or handlers, not in controllers — DON'T: write domain rules inside controller action methods
DO: Add `CancellationToken ct` parameter to every `async` method signature — DON'T: omit cancellation token in long-running or I/O-bound operations
DO: Return `ProblemDetails` (RFC 7807) for all error responses — DON'T: return raw exception messages or custom error shapes
DO: Use `IOptions<T>` / `IOptionsSnapshot<T>` for configuration binding — DON'T: read `IConfiguration` directly inside business logic classes
DO: Register dependencies with the correct lifetime (Scoped for DbContext, Singleton for stateless services) — DON'T: inject Scoped into Singleton (captive dependency)
DO: Use `async`/`await` throughout the call chain — DON'T: use `async void` (use `async Task`); exceptions are swallowed silently
DO: Inject `ILogger<T>` for structured logging — DON'T: use `Console.WriteLine` or static logger instances

## Forbidden patterns

NEVER: Empty catch block `catch (Exception) {}` — silently discards errors
NEVER: `Thread.Sleep()` — blocks thread pool; use `await Task.Delay()` instead
NEVER: `HttpContext` accessed in domain or service layer — creates coupling to HTTP transport
NEVER: Direct `DbContext` injection into controllers — bypasses service layer and transaction boundaries
NEVER: `ConfigureAwait(false)` omitted in library code — risks deadlock on sync-over-async callers
NEVER: `new HttpClient()` instantiated directly — use `IHttpClientFactory` to avoid socket exhaustion
NEVER: `.Result` or `.Wait()` on a `Task` in async context — deadlock risk in ASP.NET context
