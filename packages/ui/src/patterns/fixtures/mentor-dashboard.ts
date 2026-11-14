import {
  legacyMentorDashboard,
  legacyMentorDashboardEn,
  type MentorDashboardFixture as MentorDashboardDataFixture,
  type MentorHelpPost,
  type MentorPendingResource,
} from "./legacy-mentor";

export type { MentorHelpPost, MentorPendingResource };

export type MentorDashboardFixture = MentorDashboardDataFixture & {
  firstName: string;
  fullName: string;
  initials: string;
  dateLabel: string;
};

export const mentorDashboardFixtureFr: MentorDashboardFixture = {
  ...legacyMentorDashboard,
  firstName: "Marc",
  fullName: "Marc L.",
  initials: "ML",
  dateLabel: "9 juin 2026",
};

export const mentorDashboardFixtureEn: MentorDashboardFixture = {
  ...legacyMentorDashboardEn,
  firstName: "Marc",
  fullName: "Marc L.",
  initials: "ML",
  dateLabel: "June 9, 2026",
};
