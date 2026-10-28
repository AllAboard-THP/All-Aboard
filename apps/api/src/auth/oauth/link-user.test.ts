import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { oauthAccounts } from "../../db/schema.js";
import { ensureMigrated } from "../../test/ensure-migrated.js";
import { linkGoogleUser } from "./link-user.js";
import type { GoogleUserProfile } from "./google-client.js";

const profile: GoogleUserProfile = {
  sub: "google-sub-123",
  email: "newuser@example.com",
  emailVerified: true,
  name: "New User",
  picture: "https://example.com/avatar.png",
};

describe("linkGoogleUser", () => {
  it("returns email_not_verified when Google email is not verified", async () => {
    const db = {} as never;
    const result = await linkGoogleUser(db, {
      ...profile,
      emailVerified: false,
    });
    expect(result).toBe("email_not_verified");
  });
});

describe.skipIf(!process.env.DATABASE_URL)("linkGoogleUser (database)", () => {
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

  it("creates the user and the oauth account, then finds it again", async () => {
    const stamp = Date.now();
    const googleProfile: GoogleUserProfile = {
      ...profile,
      sub: `google-sub-${stamp}`,
      email: `oauth-${stamp}@example.com`,
    };

    const first = await linkGoogleUser(db, googleProfile);
    expect(first).toMatchObject({ isNewUser: true });

    const rows = await db
      .select()
      .from(oauthAccounts)
      .where(eq(oauthAccounts.providerAccountId, googleProfile.sub));
    expect(rows).toHaveLength(1);

    const second = await linkGoogleUser(db, googleProfile);
    expect(second).toMatchObject({ isNewUser: false });
  });
});
