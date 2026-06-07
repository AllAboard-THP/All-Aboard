"use client";

import { NavWithAdminUserScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { LegacyScreenPage } from "@/components/features/legacy-screen-page";

/** Storybook nav state — admin user menu open. */
export default function NavDemoPage() {
  return <LegacyScreenPage screen={NavWithAdminUserScreen} />;
}
