## Naming conventions

- `prisma/schema.prisma` — single source of truth; one schema file per project
- Model names: PascalCase singular (`User`, `OrderLine`); table name follows via `@@map("orders_lines")` if snake_case is required
- Field names: camelCase; column override via `@map("user_id")` when needed
- Enum names: PascalCase singular (`OrderStatus`); values UPPER_SNAKE
- Relation fields: same casing as target model (singular for `to-one`, plural for `to-many`)
- Index names: explicit `@@index([...], name: "idx_<model>_<cols>")` for non-trivial indexes
- Migration folder: timestamped `prisma/migrations/<YYYYMMDDHHMMSS>_<description>/`
- PrismaClient instance: `lib/prisma.ts` (Next.js) or `prisma.service.ts` (NestJS)

## Do / don't

DO: Run `prisma migrate dev --name <description>` to generate + apply locally — DON'T: hand-edit migration SQL after creation (regenerate instead)
DO: Use `prisma generate` after every schema change before running typecheck — DON'T: commit a schema diff without regenerating the client
DO: Singleton PrismaClient in Next.js with `globalThis` guard — DON'T: `new PrismaClient()` per request (exhausts connections)
DO: Use `select` / `include` to fetch only needed fields — DON'T: pull whole rows when one column is needed
DO: Use `Prisma.sql` tagged template for raw queries — DON'T: string-concatenate user input
DO: Define `onDelete` / `onUpdate` on every relation explicitly — DON'T: rely on Prisma's defaults silently
DO: Wrap multi-step writes in `prisma.$transaction([...])` or interactive `$transaction(async tx => ...)` — DON'T: assume sequential awaits are atomic
DO: Add a backfill migration when introducing a required column on populated tables — DON'T: deploy and hope rows are empty

## Forbidden patterns

NEVER: instantiate `new PrismaClient()` more than once per process — connection pool blows out
NEVER: `prisma.$queryRawUnsafe(userInput)` — SQL injection
NEVER: rename a model or column in `schema.prisma` without a migration that preserves data
NEVER: drop a column in a single migration when the column is still read by deployed code — two-phase deploy required
NEVER: edit applied migration SQL files in `prisma/migrations/` — once shipped they are immutable; create a new migration
NEVER: skip `prisma migrate deploy` in production — `migrate dev` is for local development only
NEVER: commit `prisma/migrations/migration_lock.toml` divergence — confirms provider mismatch
NEVER: log full `PrismaClient` instances or query args containing PII — leaks customer data
NEVER: use `findUnique` with a non-unique field — runtime error in production
