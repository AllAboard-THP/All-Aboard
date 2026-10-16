import { storybookNoProductAppImports } from "@allaboard/config-eslint/design-system-boundaries";
import base from "@allaboard/config-eslint/node";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  storybookNoProductAppImports,
  {
    ignores: ["storybook-static/**", "node_modules/**"],
  },
];
