import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../drizzle");

let migratePromise: Promise<void> | null = null;

/** Runs Drizzle migrations once per process (avoids parallel migrate races in CI). */
export function ensureMigrated(connectionString: string): Promise<void> {
  if (!migratePromise) {
    migratePromise = (async () => {
      const pool = new pg.Pool({ connectionString, max: 1 });
      const db = drizzle(pool);
      try {
        await migrate(db, { migrationsFolder });
      } finally {
        await pool.end();
      }
    })();
  }
  return migratePromise;
}
