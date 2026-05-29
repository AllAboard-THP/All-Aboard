import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
import {
  BrandLogo,
  Eyebrow,
  FeaturePill,
  GradientHeading,
} from "./legacy-ui";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Legacy Brand",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function BrandLogoStory() {
  const labels = useLegacyLabels();
  return <BrandLogo labels={labels} />;
}

function EyebrowStory() {
  const labels = useLegacyLabels();
  return <Eyebrow>{labels.landing.eyebrow}</Eyebrow>;
}

function GradientHeadingStory() {
  const labels = useLegacyLabels();
  return (
    <GradientHeading
      lead={labels.landing.headingLead}
      accent={labels.landing.headingAccent}
    />
  );
}

function FeaturePillsStory() {
  const labels = useLegacyLabels();
  return (
    <div className="flex max-w-2xl flex-wrap gap-3">
      {labels.landing.pills.map((pill, index) => (
        <FeaturePill
          key={pill}
          label={pill}
          iconIndex={index as 0 | 1 | 2}
        />
      ))}
    </div>
  );
}

export const BrandLogoDefault: Story = {
  name: "BrandLogo",
  render: () => <BrandLogoStory />,
};

export const LogoMark: Story = {
  name: "AllAboardLogoMark",
  render: () => {
    const labels = useLegacyLabels();
    return (
      <div className="flex items-center gap-8">
        <AllAboardLogoMark className="size-10" title={labels.brandName} />
        <AllAboardLogoMark className="size-16" title={labels.brandName} />
      </div>
    );
  },
};

export const EyebrowDefault: Story = {
  name: "Eyebrow",
  render: () => <EyebrowStory />,
};

export const GradientHeadingDefault: Story = {
  name: "GradientHeading",
  render: () => <GradientHeadingStory />,
};

export const FeaturePills: Story = {
  name: "FeaturePill",
  render: () => <FeaturePillsStory />,
};
