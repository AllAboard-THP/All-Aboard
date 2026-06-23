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
import { screenStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Screens/App",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedThreeColumn: Story = {
  name: "FeedThreeColumn",
  render: () => <FeedThreeColumnScreen />,
};

export const ExploreSubjects: Story = {
  name: "ExploreSubjects",
  render: () => <ExploreSubjectsScreen />,
};

export const ResourcesList: Story = {
  name: "ResourcesList",
  render: () => <ResourcesListScreen />,
};

export const EventsList: Story = {
  name: "EventsList",
  render: () => <EventsListScreen />,
};

export const MessagesInbox: Story = {
  name: "MessagesInbox",
  render: () => <MessagesInboxScreen />,
};

export const UserProfile: Story = {
  name: "UserProfile",
  render: () => <UserProfileScreen />,
};

/** Storybook id: `screens-app--nav-with-user-menu-open` (legacy: `screens--nav-with-user-menu-open`) */
export const NavWithUserMenuOpen: Story = {
  name: "NavWithAdminUser",
  render: () => <NavWithAdminUserScreen />,
};
