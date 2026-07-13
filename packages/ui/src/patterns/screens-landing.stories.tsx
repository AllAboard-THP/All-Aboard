import type { Meta, StoryObj } from "@storybook/react";

import { LandingPresentationScreen } from "./screens/legacy-screens";
import { screenStoryParameters } from "./pattern-story-frame";
import { legacyDemoToast } from "./legacy-story-feedback";
import { useLegacyLabels } from "../i18n/storybook-locale";

const meta = {
  title: "Screens/Landing",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function LandingPresentationStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPresentationScreen
      onSignInClick={() => legacyDemoToast(labels.auth.signIn)}
      onSignUpClick={() => legacyDemoToast(labels.auth.signUp)}
      onLogoClick={() => legacyDemoToast(labels.brandName)}
    />
  );
}

/** Public marketing homepage (`/`) — hero copy + CTAs, login on dedicated page. */
export const LandingPresentation: Story = {
  name: "LandingPresentation",
  render: () => <LandingPresentationStory />,
};
