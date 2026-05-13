import { defineConfig, devices } from "@playwright/test";

/**
 * E2E — aligné [plan kit UX — Exécution agent autonome](../../Docs/plan-integration-kit-ux-allaboard.md#execution-agent-autonome).
 * Port **3005** par défaut pour ne pas entrer en conflit avec `pnpm dev` (3000). Surcharge : `E2E_PORT`.
 */
const e2ePort = process.env.E2E_PORT ?? "3005";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${e2ePort}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // `output: "standalone"` : `next start` n'est pas supporté — serveur Node officiel.
  webServer: {
    command: process.env.CI
      ? `cd .next/standalone && PORT=${e2ePort} node apps/web/server.js`
      : `pnpm run build && cd .next/standalone && PORT=${e2ePort} node apps/web/server.js`,
    url: `http://127.0.0.1:${e2ePort}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
