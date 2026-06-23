import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Pre-bundle deps so Vite does not hard-reload mid-session (Storybook "connection lost"). */
const STORYBOOK_OPTIMIZE_DEPS = [
  "react",
  "react-dom",
  "react/jsx-dev-runtime",
  "@mdx-js/react",
  "@storybook/addon-themes",
  "@storybook/react",
  "sonner",
  "lucide-react",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "radix-ui",
  "@radix-ui/react-slot",
  "next-themes",
] as const;

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
    "../../../packages/ui/src/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  framework: "@storybook/react-vite",
  core: {
    // WSL / port-forward: avoid host checks dropping websocket reloads.
    allowedHosts: ["localhost", "127.0.0.1", ".localhost"],
  },
  async viteFinal(config) {
    const repoRoot = path.resolve(__dirname, "../../..");
    const uiSrc = path.join(repoRoot, "packages/ui/src");
    const storybookCacheDir = path.join(
      repoRoot,
      "node_modules/.cache/vite-storybook",
    );

    const brandingAssets = path.join(repoRoot, "Docs/branding/assets");

    return mergeConfig(config, {
      cacheDir: storybookCacheDir,
      resolve: {
        alias: {
          "@allaboard/branding-assets": brandingAssets,
          "@allaboard/ui/globals.css": path.join(
            uiSrc,
            "styles/globals.css",
          ),
          "@allaboard/ui": uiSrc,
        },
        preserveSymlinks: false,
      },
      assetsInclude: ["**/*.png", "**/*.svg"],
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...new Set([
            ...(config.optimizeDeps?.include ?? []),
            ...STORYBOOK_OPTIMIZE_DEPS,
          ]),
        ],
      },
      server: {
        ...config.server,
        fs: {
          ...config.server?.fs,
          allow: [repoRoot],
        },
        hmr:
          typeof config.server?.hmr === "object" && config.server.hmr !== null
            ? {
                ...config.server.hmr,
                host: "localhost",
                port: 6006,
                clientPort: 6006,
              }
            : {
                host: "localhost",
                port: 6006,
                clientPort: 6006,
              },
      },
    });
  },
};

export default config;
