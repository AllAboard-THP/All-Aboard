import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyEvents, useLegacyLabels } from "../i18n/storybook-locale";
import {
  EventCard,
  EventCardList,
  EventsPageHeader,
  EventsUpcomingSection,
  FilterPillBar,
  PaginationBar,
} from "./legacy-event-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Events",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function EventCardStory() {
  const labels = useLegacyLabels();
  const events = useLegacyEvents();
  return (
    <div className="w-full max-w-3xl">
      <EventCard event={events[0]} labels={labels} />
    </div>
  );
}

function FilterPillBarStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-4xl">
      <FilterPillBar labels={labels} />
    </div>
  );
}

function PaginationBarStory() {
  return (
    <div className="w-full max-w-md">
      <PaginationBar currentPage={2} totalPages={3} />
    </div>
  );
}

function EventsSectionStory() {
  const labels = useLegacyLabels();
  const events = useLegacyEvents();
  return (
    <div className="w-full max-w-4xl">
      <EventsPageHeader labels={labels} />
      <FilterPillBar labels={labels} />
      <EventsUpcomingSection
        events={events.slice(0, 3)}
        labels={labels}
        showPagination
      />
    </div>
  );
}

function EventListStory() {
  const labels = useLegacyLabels();
  const events = useLegacyEvents();
  return (
    <div className="w-full max-w-3xl">
      <EventCardList events={events.slice(0, 3)} labels={labels} />
    </div>
  );
}

export const EventCardDefault: Story = {
  name: "EventCard",
  decorators: [withPatternStoryFrame()],
  render: () => <EventCardStory />,
};

export const FilterPillBarDefault: Story = {
  name: "FilterPillBar",
  decorators: [withPatternStoryFrame("full")],
  render: () => <FilterPillBarStory />,
};

export const PaginationBarDefault: Story = {
  name: "PaginationBar",
  decorators: [withPatternStoryFrame()],
  render: () => <PaginationBarStory />,
};

export const EventCardListDefault: Story = {
  name: "EventCard/List",
  decorators: [withPatternStoryFrame("full")],
  render: () => <EventListStory />,
};

export const EventsUpcomingSectionDefault: Story = {
  name: "Events/UpcomingSection",
  decorators: [withPatternStoryFrame("full")],
  render: () => <EventsSectionStory />,
};
