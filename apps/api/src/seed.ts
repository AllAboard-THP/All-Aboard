import pg from "pg";
import { createDb } from "./db/client.js";
import {
  defaultSeedSubjects,
  defaultSeedUsers,
  allDemoSeedUsers,
  runFullSeed,
  seedSubjects,
  seedUsers,
} from "./db/seed.js";
import { seedDemoContent, seedMentorSubjects } from "./db/seed-demo.js";
import { demoMentorSubjectLinks } from "./db/seed-demo-data.js";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("db:seed: DATABASE_URL is required");
  process.exit(1);
}

const password =
  process.env.DEV_SEED_PASSWORD?.trim() ??
  process.env.MVP_LOGIN_PASSWORD?.trim() ??
  "";

if (!password) {
  console.error(
    "db:seed: set DEV_SEED_PASSWORD or MVP_LOGIN_PASSWORD for dev accounts",
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
const db = createDb(pool);
try {
  const fullReset = process.argv.includes("--full");
  if (fullReset) {
    await runFullSeed(db);
  } else {
    const subjectSpecs = defaultSeedSubjects();
    await seedSubjects(db, subjectSpecs);
    console.log(`db:seed: upserted ${subjectSpecs.length} subject(s)`);

    const coreUsers = defaultSeedUsers();
    const demoUsers = allDemoSeedUsers(password);
    const allUsers = [...coreUsers, ...demoUsers];
    await seedUsers(db, allUsers);
    console.log(`db:seed: upserted ${allUsers.length} user(s)`);

    await seedMentorSubjects(db, demoMentorSubjectLinks());
    await seedDemoContent(db);
  }
} finally {
  await pool.end();
}
