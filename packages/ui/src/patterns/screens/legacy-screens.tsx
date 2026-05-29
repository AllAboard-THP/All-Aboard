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
  BrandLogo,
  Eyebrow,
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
import { legacyDemoToast } from "../legacy-story-feedback";
import { GraduationCap } from "lucide-react";

export function LandingLoginScreen() {
  const labels = useLegacyLabels();

  return (
    <AppChrome showNav={false}>
      <div className="auth-shell relative min-h-[100dvh] overflow-hidden">
        <div className="landing-grid absolute inset-0" />
        <div className="auth-grid relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-center">
            <BrandLogo labels={labels} />
          </div>

          <div className="grid min-h-[78vh] items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow>{labels.landing.eyebrow}</Eyebrow>
              <GradientHeading
                lead={labels.landing.headingLead}
                accent={labels.landing.headingAccent}
              />
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {labels.landing.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {labels.landing.pills.map((pill, index) => (
                  <FeaturePill
                    key={pill}
                    label={pill}
                    iconIndex={index as 0 | 1 | 2}
                  />
                ))}
              </div>
            </div>

            <Card className="hero-panel glass rounded-[2rem] border-white/10 p-8 shadow-none">
              <CardHeader className="px-0 pb-0">
                <CardTitle className="text-2xl">{labels.auth.loginTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {labels.auth.loginSubtitle}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-0">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="legacy-email">{labels.auth.email}</Label>
                  <Input
                    id="legacy-email"
                    type="email"
                    className="rounded-xl border-white/10 bg-white/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="legacy-password">{labels.auth.password}</Label>
                  <Input
                    id="legacy-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl border-white/10 bg-white/5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="legacy-remember" />
                  <Label htmlFor="legacy-remember">{labels.auth.rememberMe}</Label>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4 px-0">
                <Button
                  className="w-full rounded-2xl"
                  onClick={() => legacyDemoToast(labels.auth.submit)}
                >
                  {labels.auth.submit}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
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
    </AppChrome>
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
  const threadComments = useLegacyFeedThreadComments();
  const [recentlyViewed, setRecentlyViewed] = useState<LegacyRecentlyViewedPost[]>([]);
  const isEn = labels.nav.feed === "Home";

  const markMainPostViewed = useCallback(() => {
    setRecentlyViewed((current) => {
      const entry: LegacyRecentlyViewedPost = {
        id: "feed-main-post",
        title: fixture.title,
        subjectName: fixture.subjectName,
        accentColor: "#EAB308",
        timeAgo: isEn ? "just now" : "à l'instant",
      };

      return [
        entry,
        ...current.filter((item) => item.id !== entry.id),
      ].slice(0, 4);
    });
  }, [fixture.subjectName, fixture.title, isEn]);

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
    <AppChrome activeLink="feed" messageCount={2} mobileChrome={mobileChrome}>
      <div className="grid grid-cols-1 items-start gap-6 pb-24 lg:grid-cols-12 lg:pb-8">
        <div className="hidden space-y-6 lg:col-span-3 lg:block">
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

        <div className="col-span-1 space-y-6 lg:col-span-6">
          <FeedPostWithThread
            fixture={fixture}
            postLabels={postLabels}
            labels={labels}
            initialComments={threadComments}
            onPostEngage={markMainPostViewed}
          />
        </div>

        <div className="hidden space-y-6 lg:col-span-3 lg:block">
          <FeedSearchCard labels={labels} />
          <FeedSidebarContributions labels={labels} />
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
