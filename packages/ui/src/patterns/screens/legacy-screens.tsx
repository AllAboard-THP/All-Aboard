"use client";

import { useCallback, useState } from "react";
import { Button } from "../../components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card";
import { Checkbox } from "../../components/checkbox";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { cn } from "@allaboard/ui/lib/utils";
import {
  useLegacyAdminUsers,
  useLegacyConversations,
  useLegacyEvents,
  useLegacyFeedThreadComments,
  useLegacyLabels,
  useLegacyLegalContent,
  useLegacyMentorDashboard,
  useLegacyModeration,
  useLegacyProfile,
  useLegacyResources,
  usePostCardFixture,
  usePostCardLabels,
  usePostCardSecondaryFixture,
  useLegacyFeedThreadCommentsSecondary,
} from "../../i18n/storybook-locale";
import {
  AdminModerationQueue,
  AdminUsersTable,
} from "../legacy-admin-extended-patterns";
import {
  AdminActionGrid,
  AdminStatsGrid,
} from "../legacy-admin-patterns";
import {
  ForgotPasswordForm,
  RegisterForm,
  RegisterHeroPanel,
} from "../legacy-auth-patterns";
import {
  EventsListWithFilters,
  EventsPageHeader,
} from "../legacy-event-patterns";
import {
  LegalPageLayout,
} from "../legacy-legal-patterns";
import {
  MentorHelpPanel,
  MentorStatsGrid,
  MentorValidationPanel,
} from "../legacy-mentor-patterns";
import {
  FeedPostWithThread,
  FeedSearchCard,
  FeedSidebarContributions,
  FeedSidebarRecentViewed,
  FeedSidebarUnanswered,
  ScrollToTopFab,
} from "../legacy-feed-patterns";
import type { LegacyRecentlyViewedPost } from "../fixtures/legacy-feed-thread";
import { MessagesInboxLayout } from "../legacy-messages-patterns";
import {
  ProfileAboutCard,
  ProfileActivityTabs,
  ProfileHeaderCard,
  ProfileStatGrid,
} from "../legacy-profile-patterns";
import {
  LANDING_HERO_CONTAINER_CLASS,
  LANDING_HERO_COPY_CLASS,
  LANDING_HERO_DESCRIPTION_CLASS,
  LANDING_HERO_HEADING_CLASS,
  LANDING_HERO_GRID_CLASS,
  LANDING_HERO_PADDING_CLASS,
  LANDING_HERO_SECTION_CLASS,
  LANDING_GLASS_INPUT_CLASS,
  LANDING_LOGIN_CARD_CLASS,
} from "../landing-layout";
import { LandingPageShell } from "../landing-page-shell";
import {
  FeaturePill,
  GradientHeading,
  SubjectCardGrid,
} from "../legacy-ui";
import {
  ResourceCardList,
  ResourcesPageHeader,
  SearchBar,
} from "../legacy-resource-patterns";
import { SubjectRequestModal } from "../legacy-modal-patterns";
import { AppChrome } from "../pattern-app-chrome";
import {
  FEED_CENTER_COLUMN_CLASS,
  FEED_LEFT_RAIL_COLUMN_CLASS,
  FEED_RIGHT_RAIL_COLUMN_CLASS,
  FEED_THREE_COLUMN_GRID_CLASS,
} from "../feed-concept-background";
import { legacyDemoToast } from "../legacy-story-feedback";
import { GraduationCap } from "lucide-react";

export function LandingLoginScreen() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels}>
      <div
        className={cn(
          "auth-grid",
          LANDING_HERO_SECTION_CLASS,
          LANDING_HERO_PADDING_CLASS,
        )}
      >
        <div className={cn(LANDING_HERO_CONTAINER_CLASS, LANDING_HERO_GRID_CLASS)}>
          <div className={LANDING_HERO_COPY_CLASS}>
            <GradientHeading
              allowWrap
              chromeText
              className={LANDING_HERO_HEADING_CLASS}
              lead={labels.landing.headingLead}
              line2Prefix={labels.landing.headingLine2Prefix}
              accent={labels.landing.headingAccent}
            />
            <p className={LANDING_HERO_DESCRIPTION_CLASS}>
              {labels.landing.description}
            </p>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {labels.landing.pills.map((pill, index) => (
                <FeaturePill
                  key={pill}
                  label={pill}
                  iconIndex={index as 0 | 1 | 2}
                />
              ))}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-center lg:justify-end">
            <Card
              className={cn(
                "flex aspect-square w-full max-w-[min(100%,32rem)] shrink-0 flex-col justify-between rounded-[2rem] border-white/10 p-6 shadow-none sm:max-h-[min(34rem,calc(100dvh-14rem))] sm:p-8",
                LANDING_LOGIN_CARD_CLASS,
              )}
            >
              <CardHeader className="shrink-0 px-0 pb-0 text-center">
                <CardTitle className="text-xl sm:text-2xl">
                  {labels.auth.loginTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col justify-center gap-3.5 px-0">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="legacy-email">{labels.auth.email}</Label>
                  <Input
                    id="legacy-email"
                    type="email"
                    className={LANDING_GLASS_INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="legacy-password">
                    {labels.auth.password}
                  </Label>
                  <Input
                    id="legacy-password"
                    type="password"
                    className={LANDING_GLASS_INPUT_CLASS}
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg">
                  <Checkbox id="legacy-remember" />
                  <Label htmlFor="legacy-remember" className="text-sm">
                    {labels.auth.rememberMe}
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="shrink-0 flex-col gap-3 px-0 pt-0">
                <Button
                  className="h-10 w-full rounded-2xl sm:h-11"
                  onClick={() => legacyDemoToast(labels.auth.submit)}
                >
                  {labels.auth.submit}
                </Button>
                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  {labels.auth.noAccount}{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => legacyDemoToast(labels.auth.signUp)}
                  >
                    {labels.auth.signUp}
                  </button>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </LandingPageShell>
  );
}

export function ExploreSubjectsScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const [subjectRequestOpen, setSubjectRequestOpen] = useState(false);

  return (
    <AppChrome activeLink="explore" mobileChrome={mobileChrome}>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">{labels.explore.title}</h2>
          <p className="text-muted-foreground">{labels.explore.subtitle}</p>
        </div>
        <SubjectCardGrid
          labels={labels}
          onProposeSubjectClick={() => setSubjectRequestOpen(true)}
        />
      </div>
      <SubjectRequestModal
        open={subjectRequestOpen}
        onOpenChange={setSubjectRequestOpen}
        labels={labels}
      />
    </AppChrome>
  );
}

export function ResourcesListScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const resources = useLegacyResources().slice(0, 3);

  return (
    <AppChrome activeLink="resources" mobileChrome={mobileChrome}>
      <div className="mx-auto max-w-4xl animate-fade-in">
        <ResourcesPageHeader labels={labels} />
        <SearchBar
          placeholder={labels.resources.searchPlaceholder}
          buttonLabel={labels.resources.searchButton}
          className="mb-6"
        />
        <ResourceCardList resources={resources} />
      </div>
    </AppChrome>
  );
}

export function AdminDashboardScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();

  return (
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome}>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">{labels.admin.title}</h1>
          <p className="text-muted-foreground">{labels.admin.subtitle}</p>
        </div>
        <AdminStatsGrid labels={labels} />
        <AdminActionGrid labels={labels} />
      </div>
    </AppChrome>
  );
}

export function NavWithAdminUserScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const isEn = labels.nav.feed === "Home";

  return (
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome}>
      <div className="animate-fade-in">
        <p className="text-muted-foreground">
          {isEn
            ? `${labels.userMenu.adminDashboard} — click the AA avatar to open the menu.`
            : `${labels.userMenu.adminDashboard} — cliquez sur l’avatar AA pour ouvrir le menu.`}
        </p>
      </div>
    </AppChrome>
  );
}

export function EventsListScreen({ mobileChrome = false }: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const events = useLegacyEvents().slice(0, 3);

  return (
    <AppChrome activeLink="events" mobileChrome={mobileChrome}>
      <div className="mx-auto max-w-4xl animate-fade-in">
        <EventsPageHeader labels={labels} />
        <EventsListWithFilters
          events={events}
          labels={labels}
          showPagination
        />
      </div>
    </AppChrome>
  );
}

export function MessagesInboxScreen({ mobileChrome = false }: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const conversations = useLegacyConversations();

  return (
    <AppChrome activeLink="messages" messageCount={3} mobileChrome={mobileChrome}>
      <div className="animate-fade-in">
        <MessagesInboxLayout conversations={conversations} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function UserProfileScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const profile = useLegacyProfile();

  return (
    <AppChrome activeLink="feed" mobileChrome={mobileChrome}>
      <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
        <ProfileHeaderCard profile={profile} labels={labels} />
        <ProfileAboutCard profile={profile} labels={labels} />
        <ProfileStatGrid profile={profile} labels={labels} />
        <ProfileActivityTabs profile={profile} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function RegisterScreen() {
  const labels = useLegacyLabels();

  return (
    <AppChrome showNav={false}>
      <div className="auth-shell relative min-h-[100dvh] overflow-hidden">
        <div className="landing-grid absolute inset-0" />
        <div className="auth-grid relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid min-h-[90vh] items-center gap-12 lg:grid-cols-2">
            <RegisterHeroPanel labels={labels} />
            <RegisterForm labels={labels} />
          </div>
        </div>
      </div>
    </AppChrome>
  );
}

export function ForgotPasswordScreen() {
  const labels = useLegacyLabels();

  return (
    <AppChrome showNav={false}>
      <div className="auth-shell relative min-h-[100dvh] overflow-hidden">
        <div className="landing-grid absolute inset-0" />
        <div className="auth-grid relative mx-auto flex min-h-[90vh] max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <ForgotPasswordForm labels={labels} />
        </div>
      </div>
    </AppChrome>
  );
}

export function LegalCguScreen() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("cgu");

  return (
    <AppChrome showNav={false}>
      <div className="animate-fade-in px-4 py-10">
        <LegalPageLayout content={content} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function LegalPrivacyScreen() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("privacy");

  return (
    <AppChrome showNav={false}>
      <div className="animate-fade-in px-4 py-10">
        <LegalPageLayout content={content} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function LegalMentionsScreen() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("mentions");

  return (
    <AppChrome showNav={false}>
      <div className="animate-fade-in px-4 py-10">
        <LegalPageLayout content={content} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function MentorDashboardScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const fixture = useLegacyMentorDashboard();

  return (
    <AppChrome activeLink="feed" isAdmin isMentor showMentorDot mobileChrome={mobileChrome}>
      <div className="mx-auto max-w-4xl animate-fade-in">
        <div className="mb-8">
          <h1 className="mb-1 flex items-center gap-3 text-3xl font-bold">
            <GraduationCap className="size-7 text-emerald-400" />
            {labels.mentor.title}
          </h1>
          <p className="text-muted-foreground">{labels.mentor.subtitle}</p>
        </div>
        <MentorStatsGrid fixture={fixture} labels={labels} className="mb-8" />
        <MentorHelpPanel posts={fixture.helpPosts} labels={labels} />
        <MentorValidationPanel
          resources={fixture.pendingResources}
          labels={labels}
        />
      </div>
    </AppChrome>
  );
}

export function AdminModerationScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const fixture = useLegacyModeration();

  return (
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome}>
      <div className="animate-fade-in">
        <AdminModerationQueue fixture={fixture} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function AdminUsersScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const users = useLegacyAdminUsers();

  return (
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome}>
      <div className="animate-fade-in">
        <AdminUsersTable users={users} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function FeedThreeColumnScreen({ mobileChrome = false }: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const postLabels = usePostCardLabels();
  const fixture = usePostCardFixture();
  const secondaryFixture = usePostCardSecondaryFixture();
  const threadComments = useLegacyFeedThreadComments();
  const secondaryThreadComments = useLegacyFeedThreadCommentsSecondary();
  const [recentlyViewed, setRecentlyViewed] = useState<LegacyRecentlyViewedPost[]>([]);
  const isEn = labels.nav.feed === "Home";

  const markPostViewed = useCallback(
    (id: string, title: string, subjectName: string, accentColor: string) => {
      setRecentlyViewed((current) => {
        const entry: LegacyRecentlyViewedPost = {
          id,
          title,
          subjectName,
          accentColor,
          timeAgo: isEn ? "just now" : "à l'instant",
        };

        return [
          entry,
          ...current.filter((item) => item.id !== entry.id),
        ].slice(0, 4);
      });
    },
    [isEn],
  );

  const handleRecentItemClick = (id: string) => {
    const item = recentlyViewed.find((entry) => entry.id === id);
    if (item) {
      legacyDemoToast(item.title);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUnansweredClick = (item: {
    id: string;
    title: string;
    subjectName: string;
    accentColor: string;
  }) => {
    setRecentlyViewed((current) => {
      const entry: LegacyRecentlyViewedPost = {
        id: item.id,
        title: item.title,
        subjectName: item.subjectName,
        accentColor: item.accentColor,
        timeAgo: isEn ? "just now" : "à l'instant",
      };

      return [
        entry,
        ...current.filter((existing) => existing.id !== entry.id),
      ].slice(0, 4);
    });
    legacyDemoToast(item.title);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppChrome
      activeLink="feed"
      messageCount={2}
      mobileChrome={mobileChrome}
      mainInnerLayout="feed"
    >
      <div className="relative pb-24 lg:pb-8">
        <div className={FEED_THREE_COLUMN_GRID_CLASS}>
          <div className={FEED_LEFT_RAIL_COLUMN_CLASS}>
            <FeedSidebarRecentViewed
              items={recentlyViewed}
              labels={labels}
              onItemClick={handleRecentItemClick}
            />
            <FeedSidebarUnanswered
              labels={labels}
              onItemClick={handleUnansweredClick}
            />
          </div>

          <div className={FEED_CENTER_COLUMN_CLASS}>
            <FeedPostWithThread
              fixture={fixture}
              postLabels={postLabels}
              labels={labels}
              initialComments={threadComments}
              onPostEngage={() =>
                markPostViewed(
                  "feed-main-post",
                  fixture.title,
                  fixture.subjectName,
                  "#EAB308",
                )
              }
            />
            <FeedPostWithThread
              fixture={secondaryFixture}
              postLabels={postLabels}
              labels={labels}
              initialComments={secondaryThreadComments}
              onPostEngage={() =>
                markPostViewed(
                  "feed-secondary-post",
                  secondaryFixture.title,
                  secondaryFixture.subjectName,
                  "#EAB308",
                )
              }
            />
          </div>

          <div className={FEED_RIGHT_RAIL_COLUMN_CLASS}>
            <FeedSearchCard labels={labels} />
            <FeedSidebarContributions labels={labels} />
          </div>
        </div>
      </div>

      <ScrollToTopFab
        ariaLabel={labels.feed.scrollTop}
        trackScroll
        scrollThreshold={mobileChrome ? 180 : 320}
      />
    </AppChrome>
  );
}
