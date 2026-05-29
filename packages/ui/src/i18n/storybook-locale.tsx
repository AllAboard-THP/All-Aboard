"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import {
  legacyLabelsEn,
  legacyLabelsFr,
  type LegacyLabels,
} from "./legacy-labels";
import {
  alertLabelsEn,
  alertLabelsFr,
  type AlertLabels,
} from "./alert-labels";
import {
  mvpPatternLabelsEn,
  mvpPatternLabelsFr,
  type MvpPatternLabels,
} from "./mvp-pattern-labels";
import {
  legacyResources,
  legacyResourcesEn,
  type LegacyResource,
} from "../patterns/fixtures/legacy-resources";
import {
  legacyConversations,
  legacyConversationsEn,
  type LegacyConversation,
} from "../patterns/fixtures/legacy-conversations";
import {
  legacyEvents,
  legacyEventsEn,
  type LegacyEvent,
} from "../patterns/fixtures/legacy-events";
import {
  getLegalPageContent,
  type LegalPageContent,
} from "../patterns/fixtures/legacy-legal-content";
import {
  legacyAdminUsers,
  legacyAdminUsersEn,
  type AdminUserRow,
} from "../patterns/fixtures/legacy-admin-users";
import {
  legacyFeedThreadComments,
  legacyFeedThreadCommentsEn,
  type LegacyFeedComment,
} from "../patterns/fixtures/legacy-feed-thread";
import {
  legacyModeration,
  legacyModerationEn,
  type ModerationFixture,
} from "../patterns/fixtures/legacy-moderation";
import {
  legacyMentorDashboard,
  legacyMentorDashboardEn,
  type MentorDashboardFixture,
} from "../patterns/fixtures/legacy-mentor";
import {
  legacyProfile,
  legacyProfileEn,
  type LegacyProfile,
} from "../patterns/fixtures/legacy-profile";
import {
  postCardFixtureEn,
  postCardFixtureFr,
  postCardLabelsEn,
  postCardLabelsFr,
  type PostCardFixture,
  type PostCardLabels,
} from "./post-card-labels";

export type StorybookLocale = "fr" | "en";

export const storybookLocales: StorybookLocale[] = ["fr", "en"];

const StorybookLocaleContext = createContext<StorybookLocale>("fr");

export function StorybookLocaleProvider({
  locale,
  children,
}: {
  locale: StorybookLocale;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <StorybookLocaleContext.Provider value={locale}>
      {children}
    </StorybookLocaleContext.Provider>
  );
}

export function useStorybookLocale(): StorybookLocale {
  return useContext(StorybookLocaleContext);
}

export function useAlertLabels(): AlertLabels {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? alertLabelsEn : alertLabelsFr),
    [locale],
  );
}

export function useMvpPatternLabels(): MvpPatternLabels {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? mvpPatternLabelsEn : mvpPatternLabelsFr),
    [locale],
  );
}

export function usePostCardLabels(): PostCardLabels {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? postCardLabelsEn : postCardLabelsFr),
    [locale],
  );
}

export function usePostCardFixture(): PostCardFixture {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? postCardFixtureEn : postCardFixtureFr),
    [locale],
  );
}

export function useLegacyLabels(): LegacyLabels {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyLabelsEn : legacyLabelsFr),
    [locale],
  );
}

export function useLegacyResources(): LegacyResource[] {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyResourcesEn : legacyResources),
    [locale],
  );
}

export function useLegacyEvents(): LegacyEvent[] {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyEventsEn : legacyEvents),
    [locale],
  );
}

export function useLegacyConversations(): LegacyConversation[] {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyConversationsEn : legacyConversations),
    [locale],
  );
}

export function useLegacyProfile(): LegacyProfile {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyProfileEn : legacyProfile),
    [locale],
  );
}

export function useLegacyLegalContent(
  slug: LegalPageContent["slug"],
): LegalPageContent {
  const locale = useStorybookLocale();
  return useMemo(() => getLegalPageContent(slug, locale), [slug, locale]);
}

export function useLegacyMentorDashboard(): MentorDashboardFixture {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyMentorDashboardEn : legacyMentorDashboard),
    [locale],
  );
}

export function useLegacyModeration(): ModerationFixture {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyModerationEn : legacyModeration),
    [locale],
  );
}

export function useLegacyAdminUsers(): AdminUserRow[] {
  const locale = useStorybookLocale();
  return useMemo(
    () => (locale === "en" ? legacyAdminUsersEn : legacyAdminUsers),
    [locale],
  );
}

export function useLegacyFeedThreadComments(): LegacyFeedComment[] {
  const locale = useStorybookLocale();
  return useMemo(
    () =>
      locale === "en" ? legacyFeedThreadCommentsEn : legacyFeedThreadComments,
    [locale],
  );
}

export function resolveStorybookLocale(value: unknown): StorybookLocale {
  return value === "en" ? "en" : "fr";
}
