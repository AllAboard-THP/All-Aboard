import type { Preview } from "@storybook/react";
import { themes } from "storybook/theming";
import "@allaboard/ui/globals.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    docs: {
      theme: themes.dark,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
