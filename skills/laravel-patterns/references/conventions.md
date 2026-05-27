## Naming conventions

- Controllers: `XxxController` (resourceful: `OrderController`; invokable: `ProcessOrderController`)
- Form requests: `StoreXxxRequest`, `UpdateXxxRequest`, `DestroyXxxRequest`
- Services / action classes: `XxxService`, `CreateOrderAction`, `CancelOrderAction` (verb-noun for single-purpose)
- Jobs: `ProcessXxx`, `SendXxxEmail` — imperative verb-noun
- Events: `XxxCreated`, `XxxUpdated`, `XxxFailed` — past-tense noun
- Listeners: `SendXxxNotification`, `UpdateXxxIndex` — imperative verb-noun
- Models: singular PascalCase `Order`; table names: `orders` (auto-resolved plural snake_case)

## Do / don't

DO: Use `FormRequest` classes for all incoming data validation — DON'T: validate directly in controller method body
DO: Keep business logic in service or action classes — DON'T: put domain rules inside controllers or routes
DO: Eager-load relations with `with()` — DON'T: call `->get()` inside a loop (N+1 queries)
DO: Make jobs idempotent; use `$this->fail()` on unrecoverable errors — DON'T: assume a job runs exactly once
DO: Use migrations for all schema changes — DON'T: use `DB::statement()` for schema changes outside migrations
DO: Scope model queries to the authenticated user where relevant — DON'T: return records from other users via an unscoped query
DO: Use `config()` for all env-driven values in app code — DON'T: call `env()` outside of config files

## Forbidden patterns

NEVER: `request()->all()` passed to create/update without explicit validation — mass-assignment vulnerability
NEVER: Unauthenticated route that exposes sensitive data — always apply `auth` middleware
NEVER: Migration without a `down()` method — blocks rollback in production incident
NEVER: Raw SQL string built from user input (use `DB::select()` with bindings or Eloquent) — SQL injection risk
NEVER: `Storage::put()` with a user-supplied filename without sanitization — path traversal risk
NEVER: Queue job dispatched without considering idempotency on retry — duplicate side-effects risk
