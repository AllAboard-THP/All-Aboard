import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Foundations/Spacing & Radius",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const radii = [
  { name: "radius-sm", className: "rounded-sm" },
  { name: "radius-md", className: "rounded-md" },
  { name: "radius-lg (default)", className: "rounded-lg" },
  { name: "radius-xl", className: "rounded-xl" },
] as const;

export const RadiusScale: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Rayons (--radius: 0.75rem)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {radii.map(({ name, className }) => (
            <div
              key={name}
              className={`flex h-24 items-end border border-border bg-card p-3 ${className}`}
            >
              <span className="text-xs font-medium text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Espacements courants</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="w-16 text-xs text-muted-foreground">gap-2</span>
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-md bg-primary/40" />
              <div className="h-8 w-8 rounded-md bg-primary/40" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-xs text-muted-foreground">gap-3</span>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-md bg-primary/40" />
              <div className="h-8 w-8 rounded-md bg-primary/40" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-xs text-muted-foreground">p-6</span>
            <div className="rounded-lg border border-dashed border-border p-6">
              <div className="h-8 w-full max-w-xs rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
