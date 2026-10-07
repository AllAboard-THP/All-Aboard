import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels, useLegacyResources } from "../i18n/storybook-locale";
import {
  ResourceCard,
  ResourceCardList,
  ResourcesPageHeader,
  SearchBar,
} from "./legacy-resource-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Resources",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function SearchBarStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-2xl">
      <SearchBar
        placeholder={labels.resources.searchPlaceholder}
        buttonLabel={labels.resources.searchButton}
      />
    </div>
  );
}

function PageHeaderStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-4xl">
      <ResourcesPageHeader labels={labels} />
    </div>
  );
}

function ResourceCardStory() {
  const resources = useLegacyResources();
  return (
    <div className="w-full max-w-3xl">
      <ResourceCard resource={resources[0]} />
    </div>
  );
}

function ResourceListStory() {
  const resources = useLegacyResources();
  return (
    <div className="w-full max-w-3xl">
      <ResourceCardList resources={resources} />
    </div>
  );
}

export const SearchBarDefault: Story = {
  name: "SearchBar",
  decorators: [withPatternStoryFrame()],
  render: () => <SearchBarStory />,
};

export const PageHeaderWithIcon: Story = {
  name: "PageHeader/WithIcon",
  decorators: [withPatternStoryFrame("full")],
  render: () => <PageHeaderStory />,
};

export const ResourceCardDefault: Story = {
  name: "ResourceCard",
  decorators: [withPatternStoryFrame()],
  render: () => <ResourceCardStory />,
};

export const ResourceCardListDefault: Story = {
  name: "ResourceCard/List",
  decorators: [withPatternStoryFrame("full")],
  render: () => <ResourceListStory />,
};
