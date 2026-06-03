import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  async viteFinal(config) {
    const repoRoot = path.resolve(__dirname, "../../..");
    const uiSrc = path.join(repoRoot, "packages/ui/src");
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@allaboard/ui/globals.css": path.join(
            uiSrc,
            "styles/globals.css",
          ),
          "@allaboard/ui": uiSrc,
        },
        preserveSymlinks: true,
      },
      assetsInclude: ["**/*.png", "**/*.svg"],
      server: {
        fs: {
          allow: [repoRoot],
        },
      },
    });
  },
};

export default config;
