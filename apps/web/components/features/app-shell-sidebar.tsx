"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  AppSidebar,
  type AppSidebarLinkProps,
} from "@allaboard/ui/patterns/app-sidebar";
import {
  buildAppSidebarSections,
  resolveAppSidebarContext,
  type AppSidebarLabelMap,
  type AppSidebarNavId,
} from "@allaboard/ui/patterns/app-sidebar-nav";

import { Link, usePathname } from "@/i18n/navigation";
import { useAuthRole } from "@/lib/use-auth-role";

function AppSidebarLink({ href, className, children, ...rest }: AppSidebarLinkProps) {
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

function useSidebarLabelMap(): AppSidebarLabelMap {
  const t = useTranslations("studentDashboard.sidebar");

  return useMemo(
    (): AppSidebarLabelMap => ({
      navigationGroup: t("navigationGroup"),
      communityGroup: t("communityGroup"),
      mentorGroup: t("mentorGroup"),
      adminGroup: t("adminGroup"),
      expandSidebar: t("expandSidebar"),
      collapseSidebar: t("collapseSidebar"),
      openMenu: t("openMenu"),
      closeMenu: t("closeMenu"),
      dashboard: t("dashboard"),
      subjects: t("subjects"),
      resources: t("resources"),
      events: t("events"),
      newRequest: t("newRequest"),
      feed: t("feed"),
      messages: t("messages"),
      mentor: t("mentor"),
      profile: t("profile"),
      admin: t("adminOverview"),
      adminUsers: t("adminUsers"),
      adminModeration: t("adminModeration"),
      "context.dashboard.title": t("context.dashboard.title"),
      "context.dashboard.description": t("context.dashboard.description"),
      "context.dashboard.demo": t("context.dashboard.demo"),
      "context.subjects.title": t("context.subjects.title"),
      "context.subjects.explore": t("context.subjects.explore"),
      "context.resources.title": t("context.resources.title"),
      "context.resources.all": t("context.resources.all"),
      "context.events.title": t("context.events.title"),
      "context.events.all": t("context.events.all"),
      "context.newRequest.title": t("context.newRequest.title"),
      "context.newRequest.description": t("context.newRequest.description"),
      "context.newRequest.create": t("context.newRequest.create"),
      "context.newRequest.backToFeed": t("context.newRequest.backToFeed"),
      "context.feed.title": t("context.feed.title"),
      "context.feed.description": t("context.feed.description"),
      "context.feed.browse": t("context.feed.browse"),
      "context.feed.newRequest": t("context.feed.newRequest"),
      "context.feed.backToFeed": t("context.feed.backToFeed"),
      "context.messages.title": t("context.messages.title"),
      "context.messages.inbox": t("context.messages.inbox"),
      "context.mentor.title": t("context.mentor.title"),
      "context.mentor.space": t("context.mentor.space"),
      "context.mentor.demo": t("context.mentor.demo"),
      "context.profile.title": t("context.profile.title"),
      "context.profile.view": t("context.profile.view"),
      "context.admin.title": t("context.admin.title"),
      "context.admin.description": t("context.admin.description"),
      "context.admin.overview": t("context.admin.overview"),
      "context.admin.users": t("context.admin.users"),
      "context.admin.moderation": t("context.admin.moderation"),
    }),
    [t],
  );
}

export function AppShellSidebarContent({
  forceExpanded = false,
  className,
  messageCount = 0,
  showMentorDot = false,
  isMentor = false,
  isAdmin = false,
}: {
  forceExpanded?: boolean;
  className?: string;
  messageCount?: number;
  showMentorDot?: boolean;
  isMentor?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const labelMap = useSidebarLabelMap();

  const resolved = useMemo(
    () =>
      resolveAppSidebarContext(pathname, {
        isMentor,
        isAdmin,
        labelMap,
      }),
    [pathname, isMentor, isAdmin, labelMap],
  );

  const sections = useMemo(
    () =>
      buildAppSidebarSections(labelMap, {
        activeId: resolved.activeId,
        showMentorSection: resolved.showMentorSection,
        showAdminSection: resolved.showAdminSection,
      }),
    [labelMap, resolved.activeId, resolved.showMentorSection, resolved.showAdminSection],
  );

  const badges = useMemo(
    (): Partial<Record<AppSidebarNavId, number>> =>
      messageCount > 0 ? { messages: messageCount } : {},
    [messageCount],
  );

  return (
    <AppSidebar
      labels={{
        navigationGroup: labelMap.navigationGroup,
        communityGroup: labelMap.communityGroup,
        mentorGroup: labelMap.mentorGroup,
        adminGroup: labelMap.adminGroup,
        expandSidebar: labelMap.expandSidebar,
        collapseSidebar: labelMap.collapseSidebar,
      }}
      sections={sections}
      context={resolved.context}
      activeId={resolved.activeId}
      openSectionIds={resolved.openSectionIds}
      badges={badges}
      mentorDot={showMentorDot}
      LinkComponent={AppSidebarLink}
      forceExpanded={forceExpanded}
      className={className}
    />
  );
}

export function AppShellSidebar() {
  const { isMentor, isAdmin } = useAuthRole();

  return <AppShellSidebarContent isMentor={isMentor} isAdmin={isAdmin} />;
}
