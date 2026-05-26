import type { Preview } from "@storybook/react";
import "@allaboard/ui/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "hsl(222 47% 4%)" }],
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
