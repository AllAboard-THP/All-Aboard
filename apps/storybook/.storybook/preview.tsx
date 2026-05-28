import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { themes } from "storybook/theming";
import "@allaboard/ui/globals.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    docs: {
      theme: themes.dark,
    },
    themes: {
      disable: true,
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        dark: "dark",
      },
      defaultTheme: "dark",
      parentSelector: "html",
    }),
  ],
};

export default preview;
