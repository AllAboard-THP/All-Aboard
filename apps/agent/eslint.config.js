import node from "@allaboard/config-eslint/node";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...node,
  {
    ignores: ["dist/**"],
  },
];
