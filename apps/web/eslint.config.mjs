import path from "node:path";
import { fileURLToPath } from "node:url";
import { createNextEslintConfig } from "@allaboard/config-eslint/next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...createNextEslintConfig(__dirname),
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
