"use client";

import { UserMenu } from "@allaboard/ui/patterns/legacy-ui";
import {
  legacyLabelsEn,
  legacyLabelsFr,
  type LegacyLabels,
} from "@allaboard/ui/i18n/legacy-labels";

const DEMO_USER = {
  name: "Inès Martin",
  email: "demo@allaboard.app",
  initials: "AA",
} as const;

export function AppChromeUserMenu({
  locale = "fr",
  userName = DEMO_USER.name,
  userEmail = DEMO_USER.email,
  userInitials = DEMO_USER.initials,
  isMentor = false,
  isAdmin = false,
  labels,
}: {
  locale?: "fr" | "en";
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  isMentor?: boolean;
  isAdmin?: boolean;
  labels?: LegacyLabels;
}) {
  const resolvedLabels =
    labels ?? (locale === "en" ? legacyLabelsEn : legacyLabelsFr);

  return (
    <UserMenu
      userName={userName}
      userEmail={userEmail}
      userInitials={userInitials}
      isMentor={isMentor}
      isAdmin={isAdmin}
      labels={resolvedLabels}
    />
  );
}
