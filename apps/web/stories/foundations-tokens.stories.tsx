import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Kit/§8.0 Fondations",
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

export const Tokens: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">--primary</p>
        <div className="mt-2 h-10 rounded-md bg-primary" />
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">glass-panel</p>
        <div className="glass-panel mt-2 h-10 rounded-md" />
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">focus-ring</p>
        <button type="button" className="focus-ring mt-2 rounded-md border px-3 py-2">
          Focus moi
        </button>
      </div>
    </div>
  ),
};
