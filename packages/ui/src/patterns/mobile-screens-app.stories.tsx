import type { Meta, StoryObj } from "@storybook/react";

import {
  EventsListScreen,
  ExploreSubjectsScreen,
  FeedThreeColumnScreen,
  MessagesInboxScreen,
  NavWithAdminUserScreen,
  ResourcesListScreen,
  UserProfileScreen,
} from "./screens/legacy-screens";
import { mobileStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Mobile/Screens/App",
  parameters: mobileStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedThreeColumn: Story = {
  name: "FeedThreeColumn",
  render: () => <FeedThreeColumnScreen mobileChrome />,
};

export const ExploreSubjects: Story = {
  name: "ExploreSubjects",
  render: () => <ExploreSubjectsScreen mobileChrome />,
};

export const ResourcesList: Story = {
  name: "ResourcesList",
  render: () => <ResourcesListScreen mobileChrome />,
};

export const EventsList: Story = {
  name: "EventsList",
  render: () => <EventsListScreen mobileChrome />,
};

export const MessagesInbox: Story = {
  name: "MessagesInbox",
  render: () => <MessagesInboxScreen mobileChrome />,
};

export const UserProfile: Story = {
  name: "UserProfile",
  render: () => <UserProfileScreen mobileChrome />,
};

export const NavWithAdminUser: Story = {
  name: "NavWithAdminUser",
  render: () => <NavWithAdminUserScreen mobileChrome />,
};
