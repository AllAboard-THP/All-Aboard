import type { Decorator, Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { themes } from "storybook/theming";

import {
  resolveStorybookLocale,
  StorybookLocaleProvider,
} from "@allaboard/ui/i18n/storybook-locale";

import "@allaboard/ui/globals.css";
import "./preview.css";

const withStorybookLocale: Decorator = (Story, { globals }) => (
  <StorybookLocaleProvider locale={resolveStorybookLocale(globals.locale)}>
    <Story />
  </StorybookLocaleProvider>
);

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Langue des stories (UI + fixtures)",
      toolbar: {
        title: "Langue",
        icon: "globe",
        items: [
          { value: "fr", title: "Français" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: "fr",
  },
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
    withStorybookLocale,
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
