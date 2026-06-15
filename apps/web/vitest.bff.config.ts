import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** BFF route tests — no React/CSS pipeline (avoids PostCSS native bindings in CI/WSL). */
export default defineConfig({
  css: false,
  test: {
    environment: "node",
    include: ["tests/bff-*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
