import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Foundations/Tokens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const swatches = [
  { name: "background", className: "bg-background text-foreground" },
  { name: "foreground", className: "bg-foreground text-background" },
  { name: "primary", className: "bg-primary text-primary-foreground" },
  { name: "secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "muted", className: "bg-muted text-muted-foreground" },
  { name: "accent", className: "bg-accent text-accent-foreground" },
  { name: "destructive", className: "bg-destructive text-destructive-foreground" },
  { name: "card", className: "bg-card text-card-foreground" },
  { name: "border", className: "bg-border text-foreground" },
] as const;

export const ColorSwatches: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Couleurs sémantiques</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {swatches.map(({ name, className }) => (
            <div
              key={name}
              className={`flex h-20 flex-col justify-end rounded-lg border border-border p-3 ${className}`}
            >
              <span className="text-xs font-medium opacity-90">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Utilitaires</h2>
        <div className="flex flex-wrap gap-4">
          <div className="glass-panel rounded-xl p-6">
            <p className="text-sm text-card-foreground">.glass-panel</p>
          </div>
          <button
            type="button"
            className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            .focus-ring
          </button>
        </div>
      </div>
    </div>
  ),
};
