import type { Meta, StoryObj } from "@storybook/react-vite";
import { GoogleSignInButton } from "./google-sign-in-button";

const meta = {
  title: "Components/GoogleSignInButton",
  component: GoogleSignInButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof GoogleSignInButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "GoogleSignInButton",
  args: {
    label: "Continuer avec Google",
    onClick: () => undefined,
  },
  render: (args) => (
    <div className="w-[320px]">
      <GoogleSignInButton {...args} />
    </div>
  ),
};
