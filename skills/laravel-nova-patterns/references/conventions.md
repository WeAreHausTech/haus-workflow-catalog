## Naming conventions

- Nova resource files: `app/Nova/Order.php` — filename matches Eloquent model exactly
- Nova actions: `app/Nova/Actions/ExportOrders.php` — verb-noun, PascalCase
- Nova filters: `app/Nova/Filters/OrderStatusFilter.php` — noun + `Filter` suffix
- Nova lenses: `app/Nova/Lenses/PendingOrdersLens.php` — adjective/noun + `Lens` suffix
- Nova metrics: `app/Nova/Metrics/NewOrdersCount.php` — noun + metric type suffix (`Count`, `Trend`, `Partition`)
- Policy files: `app/Policies/OrderPolicy.php` — model name + `Policy`

## Do / don't

DO: Use `canSee()` / `canRun()` callbacks to hide or restrict fields/actions by role — DON'T: expose sensitive fields (e.g. `password`, `remember_token`, `secret`) in Nova resources
DO: Add database indexes for all columns used in filter or lens queries — DON'T: create filter queries with unindexed `LIKE '%x%'` (full table scan)
DO: Register a policy for every Nova resource in `AuthServiceProvider` — DON'T: leave a Nova resource without an associated policy
DO: Limit rows returned in lens queries (`->limit()`) — DON'T: write unbounded `orderBy` in lens without a `LIMIT`
DO: Use `canRun($request, $model)` on destructive or batch actions — DON'T: allow destructive Nova actions without authorization check
DO: Test Nova resource with a seeded user that has the expected role — DON'T: test Nova only as admin (misses `canSee` bugs)
DO: Use `BelongsTo` / `HasMany` Nova field types for relations — DON'T: query relations manually inside field callbacks

## Forbidden patterns

NEVER: Nova action with no `canRun` or `authorizedToRun` check — any authenticated user can execute
NEVER: Filter query with `LIKE '%x%'` on unindexed column — degrades to full table scan at scale
NEVER: Nova resource without a registered policy — allows unauthorized view/edit/delete
NEVER: Return `password` or raw token fields in any Nova resource — credential exposure
NEVER: Nova lens with no row limit on unbounded table — OOM or timeout risk
