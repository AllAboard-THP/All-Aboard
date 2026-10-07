import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Foundations/Motion",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const durations = [
  { token: "--motion-duration-fast", label: "150ms", className: "duration-150" },
  { token: "--motion-duration-normal", label: "250ms", className: "duration-[250ms]" },
  { token: "--motion-duration-slow", label: "400ms", className: "duration-[400ms]" },
] as const;

export const Transitions: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6 p-6">
      <p className="text-sm text-muted-foreground">
        Tokens définis dans <code className="text-foreground">globals.css</code>. Respect de{" "}
        <code className="text-foreground">prefers-reduced-motion</code> au niveau base.
      </p>
      {durations.map(({ token, label, className }) => (
        <div key={token} className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {token} · {label}
          </p>
          <button
            type="button"
            className={`focus-ring w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-card/90 ${className}`}
          >
            Survol pour voir la transition
          </button>
        </div>
      ))}
    </div>
  ),
};
