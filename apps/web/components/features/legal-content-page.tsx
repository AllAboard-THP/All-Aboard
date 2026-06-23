"use client";

import type { LegalPageContent } from "@allaboard/ui/patterns/fixtures/legacy-legal-content";
import { LegalPageLayout } from "@allaboard/ui/patterns/legacy-legal-patterns";
import { LandingPageShell } from "@allaboard/ui/patterns/landing-page-shell";
import {
  useLegacyLabels,
  useLegacyLegalContent,
} from "@allaboard/ui/i18n/storybook-locale";

import { useLandingShellActions } from "@/lib/use-landing-shell-actions";

type LegalSlug = LegalPageContent["slug"];

/** Public legal page — landing chrome + wired cross-links. */
export function LegalContentPage({ slug }: { slug: LegalSlug }) {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent(slug);
  const {
    onSignInClick,
    onSignUpClick,
    onLogoClick,
    onLegalLinkClick,
    onLegalBackClick,
    onLegalPrivacyClick,
    onLegalMentionsClick,
  } = useLandingShellActions();

  return (
    <LandingPageShell
      labels={labels}
      background="app"
      onSignInClick={onSignInClick}
      onSignUpClick={onSignUpClick}
      onLogoClick={onLogoClick}
      onLegalLinkClick={onLegalLinkClick}
    >
      <div className="animate-fade-in px-4 py-10">
        <LegalPageLayout
          content={content}
          labels={labels}
          onBackClick={onLegalBackClick}
          onPrivacyClick={onLegalPrivacyClick}
          onLegalClick={onLegalMentionsClick}
        />
      </div>
    </LandingPageShell>
  );
}
