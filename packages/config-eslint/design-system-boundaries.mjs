/** @type {import("eslint").Linter.Config} */
export const webNoStorybookImports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "@allaboard/storybook",
              "@allaboard/storybook/*",
              "**/apps/storybook/**",
            ],
            message:
              "apps/web must not import apps/storybook — use @allaboard/ui and local features/blocks.",
          },
        ],
      },
    ],
  },
};

/** @type {import("eslint").Linter.Config} */
export const uiNoAppImports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/apps/**", "@allaboard/types", "@allaboard/types/*"],
            message:
              "packages/ui must not import apps/* or @allaboard/types — primitives and tokens only.",
          },
        ],
      },
    ],
  },
};

/** @type {import("eslint").Linter.Config} */
export const storybookNoProductAppImports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/apps/web/**", "**/apps/api/**"],
            message:
              "apps/storybook must not import product apps — stories live in packages/ui.",
          },
        ],
      },
    ],
  },
};
