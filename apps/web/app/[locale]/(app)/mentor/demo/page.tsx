"use client";

import { MentorDashboardScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { LegacyScreenPage } from "@/components/features/legacy-screen-page";

/** Storybook mentor dashboard — mock data. */
export default function MentorDemoPage() {
  return <LegacyScreenPage screen={MentorDashboardScreen} />;
}
