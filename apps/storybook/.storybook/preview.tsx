import type { Preview } from "@storybook/react";
import { themes } from "storybook/theming";
import "@allaboard/ui/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    docs: {
      theme: themes.dark,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark canvas-background min-h-screen p-6 font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
