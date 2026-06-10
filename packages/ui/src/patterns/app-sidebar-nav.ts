import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageSquare,
  Users,
} from "lucide-react";

import type { AppSidebarItem, AppSidebarLabels } from "./app-sidebar";

export type AppSidebarNavId =
  | "dashboard"
  | "subjects"
  | "resources"
  | "events"
  | "feed"
  | "messages"
  | "mentor"
  | "profile";

export type AppSidebarNavDef = {
  id: AppSidebarNavId;
  href: string;
  icon: LucideIcon;
  group: "navigation" | "community";
};

/** Canonical sidebar routes — shared by web AppShell and Storybook AppChrome. */
export const APP_SIDEBAR_NAV: AppSidebarNavDef[] = [
  { id: "dashboard", href: "/dashboard/demo", icon: LayoutDashboard, group: "navigation" },
  { id: "subjects", href: "/explore", icon: Compass, group: "navigation" },
  { id: "resources", href: "/resources", icon: Library, group: "navigation" },
  { id: "events", href: "/events", icon: Calendar, group: "navigation" },
  { id: "feed", href: "/feed", icon: Users, group: "community" },
  { id: "messages", href: "/messages", icon: MessageSquare, group: "community" },
  { id: "mentor", href: "/mentor", icon: GraduationCap, group: "community" },
  { id: "profile", href: "/profile", icon: BookOpen, group: "community" },
];

export type AppSidebarLabelMap = AppSidebarLabels & {
  dashboard: string;
  subjects: string;
  resources: string;
  events: string;
  feed: string;
  messages: string;
  mentor: string;
  profile: string;
};

export function buildAppSidebarItems(
  labels: AppSidebarLabelMap,
  activeId?: AppSidebarNavId,
): {
  labels: AppSidebarLabels;
  navigationItems: AppSidebarItem[];
  communityItems: AppSidebarItem[];
} {
  const sidebarLabels: AppSidebarLabels = {
    navigationGroup: labels.navigationGroup,
    communityGroup: labels.communityGroup,
  };

  const toItem = (def: AppSidebarNavDef): AppSidebarItem => ({
    id: def.id,
    label: labels[def.id],
    icon: def.icon,
    href: def.href,
    active: activeId === def.id,
  });

  return {
    labels: sidebarLabels,
    navigationItems: APP_SIDEBAR_NAV.filter((item) => item.group === "navigation").map(toItem),
    communityItems: APP_SIDEBAR_NAV.filter((item) => item.group === "community").map(toItem),
  };
}

/** Storybook legacy top nav → sidebar active item. */
export const LEGACY_NAV_TO_SIDEBAR: Partial<
  Record<"feed" | "explore" | "resources" | "events" | "messages", AppSidebarNavId>
> = {
  feed: "feed",
  explore: "subjects",
  resources: "resources",
  events: "events",
  messages: "messages",
};

export function resolveSidebarActiveId(
  activeId: AppSidebarNavId | undefined,
  legacyNav?: keyof typeof LEGACY_NAV_TO_SIDEBAR,
): AppSidebarNavId | undefined {
  if (activeId) {
    return activeId;
  }
  if (legacyNav) {
    return LEGACY_NAV_TO_SIDEBAR[legacyNav];
  }
  return undefined;
}
