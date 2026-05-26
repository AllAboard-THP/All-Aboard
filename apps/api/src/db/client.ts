import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

export type AppDatabase = NodePgDatabase<typeof schema>;

export function createPool(): pg.Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return new pg.Pool({ connectionString: url });
}

export function createDb(pool: pg.Pool): AppDatabase {
  return drizzle(pool, { schema });
}
