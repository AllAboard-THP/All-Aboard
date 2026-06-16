"use client";

import { useCallback, useState } from "react";
import {
  useLegacyAdminUsers,
  useLegacyConversations,
  useLegacyEvents,
  useLegacyFeedThreadComments,
  useLegacyLabels,
  useLegacyLegalContent,
  useLegacyMentorDashboard,
  useLegacyModeration,
  useMvpPatternLabels,
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
  CommentCard,
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
import { ProfilePrivatePageDemo } from "../profile-page-screen";
import { Button } from "../../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { LandingForgotPasswordBody } from "../landing-forgot-password-body";
import { LandingHeroBody } from "../landing-hero-body";
import { LandingOnboardingBody } from "../landing-onboarding-body";
import { LandingPageShell } from "../landing-page-shell";
import { LandingRegisterBody } from "../landing-register-body";
import { SubjectCardGrid } from "../legacy-ui";
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

import { MentorDashboardScreen as MentorDashboardPage } from "../mentor-dashboard-screen";

export function LandingLoginScreen({
  onForgotPasswordClick,
  onSignUpClick,
  onGoogleSignInClick,
}: {
  onForgotPasswordClick?: () => void;
  onSignUpClick?: () => void;
  onGoogleSignInClick?: () => void;
} = {}) {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels}>
      <LandingHeroBody
        labels={labels}
        onForgotPasswordClick={onForgotPasswordClick}
        onSignUpClick={onSignUpClick}
        onGoogleSignInClick={onGoogleSignInClick}
      />
    </LandingPageShell>
  );
}

export function ExploreSubjectsScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const [subjectRequestOpen, setSubjectRequestOpen] = useState(false);

  return (
    <AppChrome activeLink="explore" mobileChrome={mobileChrome} sidebarActiveId="subjects">
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
    <AppChrome activeLink="resources" mobileChrome={mobileChrome} sidebarActiveId="resources">
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
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome} sidebarActiveId="dashboard">
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
    <AppChrome activeLink="events" mobileChrome={mobileChrome} sidebarActiveId="events">
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
    <AppChrome activeLink="messages" messageCount={3} mobileChrome={mobileChrome} sidebarActiveId="messages">
      <div className="animate-fade-in">
        <MessagesInboxLayout conversations={conversations} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function UserProfileScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  return (
    <AppChrome activeLink="feed" mobileChrome={mobileChrome} sidebarActiveId="profile">
      <ProfilePrivatePageDemo />
    </AppChrome>
  );
}

export function RegisterScreen({
  onSignInClick,
  onGoogleSignInClick,
  onCguClick,
  onSubmit,
  submitting = false,
  errorMessage,
}: {
  onSignInClick?: () => void;
  onGoogleSignInClick?: () => void;
  onCguClick?: () => void;
  onSubmit?: Parameters<
    typeof import("../landing-register-body").LandingRegisterBody
  >[0]["onSubmit"];
  submitting?: boolean;
  errorMessage?: string | null;
} = {}) {
  const labels = useLegacyLabels();

  const handleSignIn =
    onSignInClick ?? (() => legacyDemoToast(labels.auth.signIn));
  const handleGoogleSignIn =
    onGoogleSignInClick ??
    (() => legacyDemoToast(labels.auth.continueWithGoogle));

  return (
    <LandingPageShell
      labels={labels}
      background="app"
      activeAction="signUp"
      onSignInClick={handleSignIn}
    >
      <LandingRegisterBody
        labels={labels}
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        onGoogleSignInClick={handleGoogleSignIn}
        onCguClick={onCguClick}
      />
    </LandingPageShell>
  );
}

export function ForgotPasswordScreen({
  onSignInClick,
}: {
  onSignInClick?: () => void;
} = {}) {
  const labels = useLegacyLabels();

  const handleSignIn =
    onSignInClick ?? (() => legacyDemoToast(labels.auth.signIn));

  return (
    <LandingPageShell
      labels={labels}
      background="app"
      activeAction="signIn"
      onSignInClick={handleSignIn}
    >
      <LandingForgotPasswordBody labels={labels} />
    </LandingPageShell>
  );
}

export function OAuthOnboardingScreen({
  onCguClick,
  onSubmit,
  submitting = false,
  errorMessage,
}: {
  onCguClick?: () => void;
  onSubmit?: Parameters<typeof LandingOnboardingBody>[0]["onSubmit"];
  submitting?: boolean;
  errorMessage?: string | null;
} = {}) {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="app" activeAction="signUp">
      <LandingOnboardingBody
        labels={labels}
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        onCguClick={onCguClick}
      />
    </LandingPageShell>
  );
}

export function HelpNewScreen({ mobileChrome = false }: { mobileChrome?: boolean } = {}) {
  const formLabels = useMvpPatternLabels().formField;
  const pageLabels = useMvpPatternLabels().pageHeader;
  const emptyLabels = useMvpPatternLabels().emptyState;

  return (
    <AppChrome activeLink="feed" mobileChrome={mobileChrome} sidebarActiveId="newRequest">
      <div className="mx-auto w-full max-w-lg animate-fade-in">
        <Card>
          <CardHeader>
            <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
              {pageLabels.feedEyebrow}
            </p>
            <CardTitle className="text-2xl">{pageLabels.feedCta}</CardTitle>
            <CardDescription>{pageLabels.feedDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="help-screen-email">{formLabels.userIdLabel}</Label>
                <Input id="help-screen-email" type="email" defaultValue="bob@dev.local" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="help-screen-password">{formLabels.passwordMvpLabel}</Label>
                <Input id="help-screen-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="help-screen-title">{formLabels.titleLabel}</Label>
                <Input
                  id="help-screen-title"
                  placeholder={formLabels.titlePlaceholder}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="help-screen-tags">{formLabels.tagsLabel}</Label>
                <Input
                  id="help-screen-tags"
                  placeholder={formLabels.tagsPlaceholder}
                />
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => legacyDemoToast(formLabels.submitButton)}
              >
                {formLabels.submitButton}
              </Button>
            </div>
            <p className="mt-5">
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => legacyDemoToast(emptyLabels.backToFeed)}
              >
                {emptyLabels.backToFeed}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppChrome>
  );
}

export function HelpRequestDetailScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const pageLabels = useMvpPatternLabels().pageHeader;
  const postLabels = usePostCardLabels();

  return (
    <AppChrome activeLink="feed" mobileChrome={mobileChrome} sidebarActiveId="newRequest">
      <div className="mx-auto w-full max-w-3xl animate-fade-in space-y-6">
        <header>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {pageLabels.detailEyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{pageLabels.detailTitle}</h1>
          <p className="text-muted-foreground">{pageLabels.detailMeta}</p>
        </header>
        <div className="space-y-4">
          <CommentCard
            authorName="Yann L."
            authorInitials="YL"
            timeAgo="il y a 1 h"
            body="Essaie de retirer data des deps ou de mémoriser fetchData avec useCallback."
            code={{
              language: "javascript",
              snippet: "const fetchData = useCallback(() => {...}, []);",
            }}
          />
          <CommentCard
            authorName="Inès M."
            authorInitials="IM"
            timeAgo="il y a 45 min"
            body="Tu peux aussi isoler la logique dans un hook dédié pour clarifier le composant."
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => legacyDemoToast(postLabels.copy)}
        >
          {labels.nav.feed}
        </Button>
      </div>
    </AppChrome>
  );
}

export function LegalCguScreen() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("cgu");

  return (
    <AppChrome showNav={false} showSidebar={false}>
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
    <AppChrome showNav={false} showSidebar={false}>
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
    <AppChrome showNav={false} showSidebar={false}>
      <div className="animate-fade-in px-4 py-10">
        <LegalPageLayout content={content} labels={labels} />
      </div>
    </AppChrome>
  );
}

export function MentorDashboardScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  if (mobileChrome) {
    const labels = useLegacyLabels();
    const fixture = useLegacyMentorDashboard();

    return (
      <AppChrome activeLink="feed" isAdmin isMentor showMentorDot mobileChrome sidebarActiveId="mentor">
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
          <MentorValidationPanel resources={fixture.pendingResources} labels={labels} />
        </div>
      </AppChrome>
    );
  }

  return <MentorDashboardPage />;
}

export function AdminModerationScreen({
  mobileChrome = false,
}: { mobileChrome?: boolean } = {}) {
  const labels = useLegacyLabels();
  const fixture = useLegacyModeration();

  return (
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome} sidebarActiveId="dashboard">
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
    <AppChrome activeLink="feed" isAdmin mobileChrome={mobileChrome} sidebarActiveId="dashboard">
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
