import pg from "pg";
import { createDb } from "./db/client.js";
import { defaultSeedUsers, seedUsers } from "./db/seed.js";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("db:seed: DATABASE_URL is required");
  process.exit(1);
}

const specs = defaultSeedUsers();
if (specs.length === 0) {
  console.error(
    "db:seed: set DEV_SEED_PASSWORD or MVP_LOGIN_PASSWORD for dev accounts",
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
const db = createDb(pool);
try {
  await seedUsers(db, specs);
  console.log(`db:seed: upserted ${specs.length} user(s)`);
} finally {
  await pool.end();
}
