"use client";

import type { LegacyLegalLinkKey } from "@allaboard/ui/patterns/legacy-ui";

import { useRouter } from "@/i18n/navigation";

export const LEGAL_PATHS: Record<
  LegacyLegalLinkKey,
  "/legal/cgu" | "/legal/privacy" | "/legal/mentions"
> = {
  cgu: "/legal/cgu",
  privacy: "/legal/privacy",
  legal: "/legal/mentions",
};

/** Shared landing chrome actions for apps/web (header + footer legal links). */
export function useLandingShellActions() {
  const router = useRouter();

  return {
    onSignInClick: () => router.push("/"),
    onSignUpClick: () => router.push("/register"),
    onLogoClick: () => router.push("/"),
    onLegalLinkClick: (key: LegacyLegalLinkKey) => router.push(LEGAL_PATHS[key]),
    onLegalBackClick: () => router.push("/"),
    onLegalPrivacyClick: () => router.push(LEGAL_PATHS.privacy),
    onLegalMentionsClick: () => router.push(LEGAL_PATHS.legal),
  };
}
