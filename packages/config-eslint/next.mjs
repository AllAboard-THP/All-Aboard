import path from "node:path";
import { createRequire } from "node:module";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const NEXT_PARSER = "next/dist/compiled/babel/eslint-parser";

function assertNextParserResolvable(baseDirectory) {
  const require = createRequire(path.join(baseDirectory, "package.json"));
  try {
    require.resolve(NEXT_PARSER);
  } catch {
    throw new Error(
      `Cannot resolve "${NEXT_PARSER}" from ${baseDirectory}. ` +
        "Run `pnpm install --frozen-lockfile` from the monorepo root.",
    );
  }
}

/**
 * @param {string} baseDirectory Absolute path to the Next.js app root (where eslint-config-next resolves from).
 * @returns {import("eslint").Linter.Config[]}
 */
export function createNextEslintConfig(baseDirectory) {
  assertNextParserResolvable(baseDirectory);

  const compat = new FlatCompat({
    baseDirectory,
    recommendedConfig: eslint.configs.recommended,
  });

  return tseslint.config(
    ...compat.extends("next/core-web-vitals"),
    ...tseslint.configs.recommended,
  );
}
