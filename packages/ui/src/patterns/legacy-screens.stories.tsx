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
import { screenStoryParameters, mobileStoryParameters } from "./pattern-app-chrome";

const meta = {
  title: "Screens",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LandingLogin: Story = {
  name: "LandingLogin",
  render: () => <LandingLoginScreen />,
};

export const ExploreSubjects: Story = {
  name: "ExploreSubjects",
  render: () => <ExploreSubjectsScreen />,
};

export const ResourcesList: Story = {
  name: "ResourcesList",
  render: () => <ResourcesListScreen />,
};

export const AdminDashboard: Story = {
  name: "AdminDashboard",
  render: () => <AdminDashboardScreen />,
};

/** ID Storybook historique : `screens--nav-with-user-menu-open` */
export const NavWithUserMenuOpen: Story = {
  name: "NavWithAdminUser",
  render: () => <NavWithAdminUserScreen />,
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

export const MentorDashboard: Story = {
  name: "MentorDashboard",
  render: () => <MentorDashboardScreen />,
};

export const AdminModeration: Story = {
  name: "AdminModeration",
  render: () => <AdminModerationScreen />,
};

export const AdminUsers: Story = {
  name: "AdminUsers",
  render: () => <AdminUsersScreen />,
};

export const FeedThreeColumn: Story = {
  name: "FeedThreeColumn",
  render: () => <FeedThreeColumnScreen />,
};

export const FeedThreeColumnMobile: Story = {
  name: "FeedThreeColumn/Mobile",
  parameters: mobileStoryParameters,
  render: () => <FeedThreeColumnScreen mobileChrome />,
};

export const EventsListMobile: Story = {
  name: "EventsList/Mobile",
  parameters: mobileStoryParameters,
  render: () => <EventsListScreen mobileChrome />,
};

export const MessagesInboxMobile: Story = {
  name: "MessagesInbox/Mobile",
  parameters: mobileStoryParameters,
  render: () => <MessagesInboxScreen mobileChrome />,
};

export const ExploreSubjectsMobile: Story = {
  name: "ExploreSubjects/Mobile",
  parameters: mobileStoryParameters,
  render: () => <ExploreSubjectsScreen mobileChrome />,
};

export const ResourcesListMobile: Story = {
  name: "ResourcesList/Mobile",
  parameters: mobileStoryParameters,
  render: () => <ResourcesListScreen mobileChrome />,
};

export const UserProfileMobile: Story = {
  name: "UserProfile/Mobile",
  parameters: mobileStoryParameters,
  render: () => <UserProfileScreen mobileChrome />,
};

export const MentorDashboardMobile: Story = {
  name: "MentorDashboard/Mobile",
  parameters: mobileStoryParameters,
  render: () => <MentorDashboardScreen mobileChrome />,
};

export const AdminDashboardMobile: Story = {
  name: "AdminDashboard/Mobile",
  parameters: mobileStoryParameters,
  render: () => <AdminDashboardScreen mobileChrome />,
};

export const AdminModerationMobile: Story = {
  name: "AdminModeration/Mobile",
  parameters: mobileStoryParameters,
  render: () => <AdminModerationScreen mobileChrome />,
};

export const AdminUsersMobile: Story = {
  name: "AdminUsers/Mobile",
  parameters: mobileStoryParameters,
  render: () => <AdminUsersScreen mobileChrome />,
};

export const NavWithAdminUserMobile: Story = {
  name: "NavWithAdminUser/Mobile",
  parameters: mobileStoryParameters,
  render: () => <NavWithAdminUserScreen mobileChrome />,
};

export const LandingLoginMobile: Story = {
  name: "LandingLogin/Mobile",
  parameters: mobileStoryParameters,
  render: () => <LandingLoginScreen />,
};

export const RegisterMobile: Story = {
  name: "Register/Mobile",
  parameters: mobileStoryParameters,
  render: () => <RegisterScreen />,
};

export const ForgotPasswordMobile: Story = {
  name: "ForgotPassword/Mobile",
  parameters: mobileStoryParameters,
  render: () => <ForgotPasswordScreen />,
};

export const LegalCguMobile: Story = {
  name: "LegalCgu/Mobile",
  parameters: mobileStoryParameters,
  render: () => <LegalCguScreen />,
};

export const LegalPrivacyMobile: Story = {
  name: "LegalPrivacy/Mobile",
  parameters: mobileStoryParameters,
  render: () => <LegalPrivacyScreen />,
};

export const LegalMentionsMobile: Story = {
  name: "LegalMentions/Mobile",
  parameters: mobileStoryParameters,
  render: () => <LegalMentionsScreen />,
};
