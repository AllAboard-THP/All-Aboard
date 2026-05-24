import { defineConfig, devices } from "@playwright/test";

const apiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:4000";
const webUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

const e2eEnv = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET:
    process.env.JWT_SECRET ?? "dev-only-jwt-secret-min-32-characters!!",
  MVP_LOGIN_PASSWORD:
    process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password",
  PORT: "4000",
  HOST: "127.0.0.1",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: "pnpm --filter api exec tsx src/index.ts",
          url: `${apiUrl}/health`,
          env: e2eEnv,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: "pnpm --filter web run dev",
          url: webUrl,
          env: { API_URL: apiUrl },
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
});
