"use client";

import { FeedThreeColumnScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { LegacyScreenPage } from "@/components/features/legacy-screen-page";

/** Storybook feed layout — mock data, illustrated stage background. */
export default function FeedDemoPage() {
  return <LegacyScreenPage screen={FeedThreeColumnScreen} />;
}
