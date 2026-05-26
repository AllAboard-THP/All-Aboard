import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { createDb } from "./db/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Apply SQL migrations from `apps/api/drizzle/`. No-op if `DATABASE_URL` is unset.
 */
export async function runMigrationsIfConfigured(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.warn("api: DATABASE_URL unset — skipping migrations");
    return;
  }
  const pool = new pg.Pool({ connectionString: url });
  const db = createDb(pool);
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  } finally {
    await pool.end();
  }
}
