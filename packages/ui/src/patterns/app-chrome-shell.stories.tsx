import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import {
  AppChromeBrand,
  AppChromeFooter,
  AppChromeFooterRow,
  AppChromeHeader,
  AppChromeHeaderRow,
} from "./app-chrome-shell";
import { AppFooter } from "./legacy-ui";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/AppChromeShell",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function HeaderBarStory() {
  const labels = useLegacyLabels();

  return (
    <AppChromeHeader layout="bar" className="relative w-full">
      <AppChromeHeaderRow>
        <AppChromeBrand brandName={labels.brandName} />
      </AppChromeHeaderRow>
    </AppChromeHeader>
  );
}

function HeaderSurfaceStory() {
  const labels = useLegacyLabels();

  return (
    <AppChromeHeader layout="surface" className="relative w-full">
      <AppChromeHeaderRow>
        <AppChromeBrand brandName={labels.brandName} />
      </AppChromeHeaderRow>
    </AppChromeHeader>
  );
}

function FooterStory() {
  const labels = useLegacyLabels();

  return (
    <AppChromeFooter className="relative w-full">
      <AppChromeFooterRow>
        <AppFooter labels={labels} edgeToEdge />
      </AppChromeFooterRow>
    </AppChromeFooter>
  );
}

function BrandStory() {
  const labels = useLegacyLabels();

  return <AppChromeBrand brandName={labels.brandName} />;
}

export const HeaderBar: Story = {
  name: "HeaderBar",
  decorators: [withPatternStoryFrame("full")],
  render: () => <HeaderBarStory />,
};

export const HeaderSurface: Story = {
  name: "HeaderSurface",
  decorators: [withPatternStoryFrame("full")],
  render: () => <HeaderSurfaceStory />,
};

export const Footer: Story = {
  name: "Footer",
  decorators: [withPatternStoryFrame("full")],
  render: () => <FooterStory />,
};

export const Brand: Story = {
  name: "Brand",
  decorators: [withPatternStoryFrame()],
  render: () => <BrandStory />,
};
