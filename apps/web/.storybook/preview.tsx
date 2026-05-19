import type { Preview } from "@storybook/react";
import React from "react";

import "../app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "hsl(222 47% 4%)" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-background p-6 font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
