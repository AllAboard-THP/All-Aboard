import type { Meta, StoryObj } from "@storybook/react";

import {
  AdminDashboardScreen,
  AdminModerationScreen,
  AdminUsersScreen,
  EventsListScreen,
  ExploreSubjectsScreen,
  FeedThreeColumnScreen,
  ForgotPasswordScreen,
  LandingLoginScreen,
  LegalCguScreen,
  LegalMentionsScreen,
  LegalPrivacyScreen,
  MentorDashboardScreen,
  MessagesInboxScreen,
  NavWithAdminUserScreen,
  RegisterScreen,
  ResourcesListScreen,
  UserProfileScreen,
} from "./screens/legacy-screens";
import { mobileStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Mobile/Screens",
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

export const MentorDashboard: Story = {
  name: "MentorDashboard",
  render: () => <MentorDashboardScreen mobileChrome />,
};

export const AdminDashboard: Story = {
  name: "AdminDashboard",
  render: () => <AdminDashboardScreen mobileChrome />,
};

export const AdminModeration: Story = {
  name: "AdminModeration",
  render: () => <AdminModerationScreen mobileChrome />,
};

export const AdminUsers: Story = {
  name: "AdminUsers",
  render: () => <AdminUsersScreen mobileChrome />,
};

export const NavWithAdminUser: Story = {
  name: "NavWithAdminUser",
  render: () => <NavWithAdminUserScreen mobileChrome />,
};

export const LandingLogin: Story = {
  name: "LandingLogin",
  render: () => <LandingLoginScreen />,
};

export const Register: Story = {
  name: "Register",
  render: () => <RegisterScreen />,
};

export const ForgotPassword: Story = {
  name: "ForgotPassword",
  render: () => <ForgotPasswordScreen />,
};

export const LegalCgu: Story = {
  name: "LegalCgu",
  render: () => <LegalCguScreen />,
};

export const LegalPrivacy: Story = {
  name: "LegalPrivacy",
  render: () => <LegalPrivacyScreen />,
};

export const LegalMentions: Story = {
  name: "LegalMentions",
  render: () => <LegalMentionsScreen />,
};
