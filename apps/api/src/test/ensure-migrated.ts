import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../drizzle");

/** Stable key — serializes migrate across Vitest workers sharing one Postgres in CI. */
const MIGRATION_ADVISORY_LOCK_KEY = 78340102;

let migratePromise: Promise<void> | null = null;

/** Runs Drizzle migrations once per process; advisory lock avoids cross-worker races in CI. */
export function ensureMigrated(connectionString: string): Promise<void> {
  if (!migratePromise) {
    migratePromise = (async () => {
      const pool = new pg.Pool({ connectionString, max: 1 });
      const client = await pool.connect();
      try {
        await client.query("SELECT pg_advisory_lock($1)", [
          MIGRATION_ADVISORY_LOCK_KEY,
        ]);
        try {
          const db = drizzle(client);
          await migrate(db, { migrationsFolder });
        } finally {
          await client.query("SELECT pg_advisory_unlock($1)", [
            MIGRATION_ADVISORY_LOCK_KEY,
          ]);
        }
      } finally {
        client.release();
        await pool.end();
      }
    })();
  }
  return migratePromise;
}
