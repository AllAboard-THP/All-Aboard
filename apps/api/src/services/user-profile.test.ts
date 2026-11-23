import { randomUUID } from "node:crypto";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedUsers } from "../db/seed";
import { users } from "../db/schema";
import { ensureMigrated } from "../test/ensure-migrated.js";
import { authorProfileFor, loadAuthorProfiles } from "./user-profile";

const seedPassword =
  process.env.DEV_SEED_PASSWORD?.trim() ||
  process.env.MVP_LOGIN_PASSWORD?.trim() ||
  "";

describe.skipIf(!process.env.DATABASE_URL || !seedPassword)(
  "loadAuthorProfiles (database)",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await ensureMigrated(process.env.DATABASE_URL!);
    });

    afterAll(async () => {
      await pool.end();
    });

    it("resolves author_id given as uuid, email or legacy short name", async () => {
      const email = `author-${randomUUID().slice(0, 8)}@test.local`;
      await seedUsers(db, [
        { email, role: "student", password: seedPassword, fullName: "Ada Lovelace" },
      ]);
      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      const [bob] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, "bob@dev.local"))
        .limit(1);

      const profiles = await loadAuthorProfiles(db, [
        row!.id,
        email.toUpperCase(),
        "bob",
        "not-a-user",
      ]);

      expect(authorProfileFor(profiles, row!.id)).toEqual({
        id: row!.id,
        displayName: "Ada Lovelace",
      });
      expect(authorProfileFor(profiles, email.toUpperCase())?.id).toBe(row!.id);
      if (bob) {
        expect(authorProfileFor(profiles, "bob")?.id).toBe(bob.id);
      }
      expect(authorProfileFor(profiles, "not-a-user")).toBeUndefined();
    });

    it("returns an empty map without querying for no ids", async () => {
      expect((await loadAuthorProfiles(db, [])).size).toBe(0);
      expect((await loadAuthorProfiles(db, ["   "])).size).toBe(0);
    });
  },
);
