import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Kit/§8.10 Mail preview" };
export default meta;
type Story = StoryObj;

export const Welcome: Story = {
  render: () => (
    <div className="max-w-lg rounded-lg border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-indigo-300">
        Email transactionnel
      </p>
      <h2 className="mt-2 text-xl font-bold">Bienvenue sur All-Aboard</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Aperçu statique MVP — react-email hors scope (WONTFIX-P3-03).
      </p>
    </div>
  ),
};
