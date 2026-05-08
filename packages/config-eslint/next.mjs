import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * @param {string} baseDirectory Absolute path to the Next.js app root (where eslint-config-next resolves from).
 * @returns {import("eslint").Linter.Config[]}
 */
export function createNextEslintConfig(baseDirectory) {
  const compat = new FlatCompat({
    baseDirectory,
    recommendedConfig: eslint.configs.recommended,
  });

  return tseslint.config(
    ...compat.extends("next/core-web-vitals"),
    ...tseslint.configs.recommended,
  );
}
