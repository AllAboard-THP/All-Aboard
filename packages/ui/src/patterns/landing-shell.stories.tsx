import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { LandingForgotPasswordBody } from "./landing-forgot-password-body";
import { LandingHeroBody } from "./landing-hero-body";
import { LandingPresentationBody } from "./landing-presentation-body";
import { LandingOnboardingBody } from "./landing-onboarding-body";
import { LandingPageShell } from "./landing-page-shell";
import { LandingRegisterBody } from "./landing-register-body";
import { LandingPresentationScreen } from "./screens/legacy-screens";
import { screenStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Patterns/LandingShell",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function LandingBgStory() {
  return <LandingPresentationScreen />;
}

function AppBgStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="app" activeAction="signUp">
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        {labels.auth.registerTitle}
      </div>
    </LandingPageShell>
  );
}

function PresentationBodyStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="landing">
      <LandingPresentationBody labels={labels} />
    </LandingPageShell>
  );
}

function HeroWithLoginCardStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="landing">
      <LandingHeroBody labels={labels} />
    </LandingPageShell>
  );
}

function RegisterBodyStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="app" activeAction="signUp">
      <LandingRegisterBody labels={labels} />
    </LandingPageShell>
  );
}

function ForgotPasswordBodyStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="app" activeAction="signIn">
      <LandingForgotPasswordBody labels={labels} />
    </LandingPageShell>
  );
}

function OnboardingBodyStory() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="app" activeAction="signUp">
      <LandingOnboardingBody labels={labels} />
    </LandingPageShell>
  );
}

export const LandingBackground: Story = {
  name: "LandingBackground",
  render: () => <LandingBgStory />,
};

export const AppBackground: Story = {
  name: "AppBackground",
  render: () => <AppBgStory />,
};

export const PresentationBody: Story = {
  name: "PresentationBody",
  render: () => <PresentationBodyStory />,
};

export const HeroWithLoginCard: Story = {
  name: "HeroWithLoginCard",
  render: () => <HeroWithLoginCardStory />,
};

export const RegisterBody: Story = {
  name: "RegisterBody",
  render: () => <RegisterBodyStory />,
};

export const ForgotPasswordBody: Story = {
  name: "ForgotPasswordBody",
  render: () => <ForgotPasswordBodyStory />,
};

export const OnboardingBody: Story = {
  name: "OnboardingBody",
  render: () => <OnboardingBodyStory />,
};
