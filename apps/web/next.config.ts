import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../..");

const brandingAssets = path.join(monorepoRoot, "Docs/branding/assets");

const nextConfig: NextConfig = {
  transpilePackages: ["@allaboard/ui"],
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL?.trim() ||
      process.env.API_URL?.trim() ||
      "http://127.0.0.1:4000",
  },
  turbopack: {
    resolveAlias: {
      "@allaboard/branding-assets": brandingAssets,
    },
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["@allaboard/branding-assets"] = brandingAssets;
    return config;
  },
};

export default withNextIntl(nextConfig);
