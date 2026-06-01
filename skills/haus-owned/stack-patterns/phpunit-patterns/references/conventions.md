## Naming conventions

- Unit test classes: `XxxTest` in `tests/Unit/` mirroring the source namespace (e.g. `tests/Unit/Services/OrderServiceTest.php`)
- Feature test classes: `XxxTest` in `tests/Feature/` organized by HTTP resource or user story
- Test methods: `test_it_<behavior_description>` snake_case, or annotated `/** @test */` with camelCase method name
- Factories: `XxxFactory` in `database/factories/` — one per model, extending `Factory`
- Data sets for `@dataProvider`: `provide_<scenario_description>()` prefix
- Mock variable names: `$mockXxx` or `$xxxMock` to distinguish from real instances

## Do / don't

DO: Use `RefreshDatabase` trait on all feature tests that touch the database — DON'T: let test database state bleed between tests
DO: Use model factories for all test data creation — DON'T: insert raw data via `DB::table()->insert()` in tests
DO: Test that unauthorized users receive a 401/403 for every protected route — DON'T: test only the authenticated happy path
DO: Mock outbound HTTP calls (Guzzle, Http facade) — DON'T: let tests make real external HTTP requests
DO: Assert HTTP status code before asserting response body — DON'T: skip status assertion and only check JSON structure
DO: Use `assertDatabaseHas` / `assertDatabaseMissing` to verify side effects — DON'T: query the DB manually in assertions
DO: One assertion concept per test method — DON'T: chain 10 unrelated assertions in a single test

## Forbidden patterns

NEVER: `sleep()` in a test — tests must be deterministic and fast; use mocks or fakes for time
NEVER: Shared mutable state between tests (static properties, global state) — causes order-dependent failures
NEVER: Test that only passes in a specific execution order — each test must be fully independent
NEVER: Asserting private method calls or internal implementation — test observable behavior only
NEVER: Outbound HTTP without mocking (`Http::fake()` or Mockery) — flaky tests and external side effects
NEVER: Hardcoded IDs in test assertions (`$this->assertEquals(1, $order->id)`) — IDs are not stable across test runs
