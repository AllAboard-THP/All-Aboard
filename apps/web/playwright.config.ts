import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const webUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "bash scripts/e2e-serve.sh",
        cwd: repoRoot,
        url: webUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
