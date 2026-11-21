/**
 * CLI entry for `pnpm --filter api run db:migrate` (and `node dist/scripts/db-migrate.js`
 * in the API image): apply Drizzle migrations, then the idempotent seed.
 *
 * `migrate.ts` only exports the function so that importing it from `index.ts`
 * has no side effect.
 */
import { runMigrationsIfConfigured } from "../migrate.js";

try {
  await runMigrationsIfConfigured();
  console.log("db:migrate: done");
} catch (error) {
  console.error("db:migrate: failed", error);
  process.exitCode = 1;
}
