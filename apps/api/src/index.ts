import "./fastify-augmentation.js";
import { buildApp } from "./app.js";
import { createDb, createPool } from "./db/client.js";
import { startIntuitionPublisher } from "./intuition/index.js";
import { startAiSummaryWorker } from "./services/ai-summary-worker.js";
import { verifyMessageMediaStorageAccess } from "./lib/media-storage/index.js";
import { runMigrationsIfConfigured } from "./migrate.js";

// Fail the deploy on a wrong S3/R2 endpoint, bucket or key, instead of
// starting and failing every chat upload later.
try {
  const mediaStorage = await verifyMessageMediaStorageAccess();
  if (mediaStorage) console.log(mediaStorage);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

await runMigrationsIfConfigured();
const pool = createPool();
const db = pool !== null ? createDb(pool) : null;
const intuitionPublisher = db ? startIntuitionPublisher(db) : null;
const aiSummaryWorker = db ? startAiSummaryWorker(db) : null;

const app = await buildApp({ pool: pool ?? null });
const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST ?? "0.0.0.0";

const shutdown = async () => {
  intuitionPublisher?.stop();
  aiSummaryWorker?.stop();
  await app.close();
  if (pool) await pool.end();
};

process.on("SIGINT", () => {
  void shutdown().then(() => process.exit(0));
});
process.on("SIGTERM", () => {
  void shutdown().then(() => process.exit(0));
});

await app.listen({ port, host });
console.log(`api listening on http://${host}:${port}`);
