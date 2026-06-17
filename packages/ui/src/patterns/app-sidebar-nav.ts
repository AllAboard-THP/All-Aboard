import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageSquare,
  Plus,
  Shield,
  UserCog,
  Gavel,
  Users,
} from "lucide-react";

import type { AppSidebarItem } from "./app-sidebar";

export const APP_SIDEBAR_LOCALES = ["fr", "en"] as const;

export type AppSidebarNavId =
  | "dashboard"
  | "subjects"
  | "resources"
  | "events"
  | "newRequest"
  | "feed"
  | "messages"
  | "profile"
  | "mentor"
  | "admin"
  | "adminUsers"
  | "adminModeration";

export type AppSidebarSectionId = "navigation" | "community" | "mentor" | "admin";

export type AppSidebarNavDef = {
  id: AppSidebarNavId;
  href: string;
  icon: LucideIcon;
  group: AppSidebarSectionId;
};

export type AppSidebarSection = {
  id: AppSidebarSectionId;
  labelKey: AppSidebarSectionLabelKey;
  items: AppSidebarItem[];
};

export type AppSidebarSectionLabelKey =
  | "navigationGroup"
  | "communityGroup"
  | "mentorGroup"
  | "adminGroup";

/** Student + mentor/admin base routes — mentor items live in APP_SIDEBAR_MENTOR_NAV. */
export const APP_SIDEBAR_NAV: AppSidebarNavDef[] = [
  { id: "dashboard", href: "/dashboard/demo", icon: LayoutDashboard, group: "navigation" },
  { id: "subjects", href: "/explore", icon: Compass, group: "navigation" },
  { id: "resources", href: "/resources", icon: Library, group: "navigation" },
  { id: "events", href: "/events", icon: Calendar, group: "navigation" },
  { id: "newRequest", href: "/help/new", icon: Plus, group: "community" },
  { id: "feed", href: "/feed", icon: Users, group: "community" },
  { id: "messages", href: "/messages", icon: MessageSquare, group: "community" },
  { id: "profile", href: "/profile", icon: BookOpen, group: "community" },
];

/** Visible when role is mentor or admin. */
export const APP_SIDEBAR_MENTOR_NAV: AppSidebarNavDef[] = [
  { id: "mentor", href: "/mentor", icon: GraduationCap, group: "mentor" },
];

/** Visible when role is admin. Order matters for active-route resolution (specific paths first). */
export const APP_SIDEBAR_ADMIN_NAV: AppSidebarNavDef[] = [
  { id: "adminUsers", href: "/admin/users", icon: UserCog, group: "admin" },
  { id: "adminModeration", href: "/admin/moderation", icon: Gavel, group: "admin" },
  { id: "admin", href: "/admin", icon: Shield, group: "admin" },
];

/** All defs for active-route matching (role-agnostic). */
export const APP_SIDEBAR_ALL_NAV: AppSidebarNavDef[] = [
  ...APP_SIDEBAR_NAV,
  ...APP_SIDEBAR_MENTOR_NAV,
  ...APP_SIDEBAR_ADMIN_NAV,
];

export type AppSidebarLabelMap = {
  navigationGroup: string;
  communityGroup: string;
  mentorGroup: string;
  adminGroup: string;
  expandSidebar: string;
  collapseSidebar: string;
  openMenu: string;
  closeMenu: string;
} & Record<AppSidebarNavId, string>;

export type AppSidebarResolvedContext = {
  activeId?: AppSidebarNavId;
  openSectionIds: AppSidebarSectionId[];
  showMentorSection: boolean;
  showAdminSection: boolean;
};

export type AppSidebarRoleOptions = {
  isMentor?: boolean;
  isAdmin?: boolean;
};

export function normalizeAppSidebarPathname(pathname: string): string {
  for (const locale of APP_SIDEBAR_LOCALES) {
    if (pathname === `/${locale}`) {
      return "/";
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

export function isAppSidebarItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }

  const path = normalizeAppSidebarPathname(pathname);

  if (href === "/help/new") {
    return path === "/help/new" || path.startsWith("/help/new/");
  }

  if (href === "/feed") {
    return (
      path === "/feed" ||
      path.startsWith("/feed/") ||
      path.startsWith("/requests/")
    );
  }

  if (href === "/dashboard/demo") {
    return path === "/dashboard/demo" || path.startsWith("/dashboard/");
  }

  if (href === "/mentor") {
    return path === "/mentor" || path.startsWith("/mentor/");
  }

  if (href === "/profile") {
    return path === "/profile" || path.startsWith("/profile/");
  }

  if (href === "/admin/users") {
    return path === "/admin/users" || path.startsWith("/admin/users/");
  }

  if (href === "/admin/moderation") {
    return path === "/admin/moderation" || path.startsWith("/admin/moderation/");
  }

  if (href === "/admin") {
    return path === "/admin";
  }

  return path === href || path.startsWith(`${href}/`);
}

export function resolveAppSidebarActiveId(pathname: string | null): AppSidebarNavId | undefined {
  if (!pathname) {
    return undefined;
  }

  for (const def of APP_SIDEBAR_ALL_NAV) {
    if (isAppSidebarItemActive(pathname, def.href)) {
      return def.id;
    }
  }

  return undefined;
}

function resolveOpenSectionIds(options: {
  showMentorSection: boolean;
  showAdminSection: boolean;
}): AppSidebarSectionId[] {
  const sections: AppSidebarSectionId[] = ["navigation", "community"];
  if (options.showMentorSection) {
    sections.push("mentor");
  }
  if (options.showAdminSection) {
    sections.push("admin");
  }
  return sections;
}

export function resolveAppSidebarRoleFlags(options?: AppSidebarRoleOptions): {
  showMentorSection: boolean;
  showAdminSection: boolean;
} {
  const isAdmin = Boolean(options?.isAdmin);
  const isMentor = Boolean(options?.isMentor) || isAdmin;

  return {
    showMentorSection: isMentor,
    showAdminSection: isAdmin,
  };
}

export function resolveAppSidebarContext(
  pathname: string | null,
  options?: AppSidebarRoleOptions,
): AppSidebarResolvedContext {
  const activeId = resolveAppSidebarActiveId(pathname);
  const { showMentorSection, showAdminSection } = resolveAppSidebarRoleFlags(options);

  return {
    activeId,
    openSectionIds: resolveOpenSectionIds({ showMentorSection, showAdminSection }),
    showMentorSection,
    showAdminSection,
  };
}

export function buildAppSidebarSections(
  labels: AppSidebarLabelMap,
  options?: {
    activeId?: AppSidebarNavId;
    showMentorSection?: boolean;
    showAdminSection?: boolean;
  },
): AppSidebarSection[] {
  const toItem = (def: AppSidebarNavDef): AppSidebarItem => ({
    id: def.id,
    label: labels[def.id],
    icon: def.icon,
    href: def.href,
    active: options?.activeId === def.id,
  });

  const sections: {
    id: AppSidebarSectionId;
    labelKey: AppSidebarSectionLabelKey;
    defs: AppSidebarNavDef[];
  }[] = [
    {
      id: "navigation",
      labelKey: "navigationGroup",
      defs: APP_SIDEBAR_NAV.filter((item) => item.group === "navigation"),
    },
    {
      id: "community",
      labelKey: "communityGroup",
      defs: APP_SIDEBAR_NAV.filter((item) => item.group === "community"),
    },
  ];

  if (options?.showMentorSection) {
    sections.push({
      id: "mentor",
      labelKey: "mentorGroup",
      defs: APP_SIDEBAR_MENTOR_NAV,
    });
  }

  if (options?.showAdminSection) {
    sections.push({
      id: "admin",
      labelKey: "adminGroup",
      defs: APP_SIDEBAR_ADMIN_NAV,
    });
  }

  return sections.map((section) => ({
    id: section.id,
    labelKey: section.labelKey,
    items: section.defs.map((def) => toItem(def)),
  }));
}

/** @deprecated Use buildAppSidebarSections — kept for gradual migration. */
export function buildAppSidebarItems(
  labels: AppSidebarLabelMap,
  activeId?: AppSidebarNavId,
): {
  labels: { navigationGroup: string; communityGroup: string };
  navigationItems: AppSidebarItem[];
  communityItems: AppSidebarItem[];
} {
  const sections = buildAppSidebarSections(labels, { activeId, showAdminSection: false });

  return {
    labels: {
      navigationGroup: labels.navigationGroup,
      communityGroup: labels.communityGroup,
    },
    navigationItems: sections.find((s) => s.id === "navigation")?.items ?? [],
    communityItems: sections.find((s) => s.id === "community")?.items ?? [],
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

/** Default pathname for Storybook when only `sidebarActiveId` is provided. */
export const APP_SIDEBAR_ACTIVE_ID_PATH: Record<AppSidebarNavId, string> = {
  dashboard: "/dashboard/demo",
  subjects: "/explore",
  resources: "/resources",
  events: "/events",
  newRequest: "/help/new",
  feed: "/feed",
  messages: "/messages",
  profile: "/profile",
  mentor: "/mentor",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminModeration: "/admin/moderation",
};

export function resolveAppSidebarPathname(
  pathname?: string | null,
  activeId?: AppSidebarNavId,
): string {
  if (pathname) {
    return pathname;
  }
  if (activeId) {
    return APP_SIDEBAR_ACTIVE_ID_PATH[activeId];
  }
  return "/feed";
}

export type AppSidebarContextLinkDef = {
  id: string;
  href: string;
};

/** Route-specific quick links shown in the sidebar context panel (expanded only). */
export const APP_SIDEBAR_CONTEXT_LINKS: Partial<
  Record<AppSidebarNavId, AppSidebarContextLinkDef[]>
> = {
  dashboard: [
    { id: "newRequest", href: "/help/new" },
    { id: "browseFeed", href: "/feed" },
    { id: "inbox", href: "/messages" },
    { id: "myRequests", href: "/me/posts" },
  ],
  subjects: [{ id: "explore", href: "/explore" }],
  resources: [{ id: "all", href: "/resources" }],
  events: [{ id: "all", href: "/events" }],
  newRequest: [
    { id: "create", href: "/help/new" },
    { id: "backToFeed", href: "/feed" },
  ],
  feed: [
    { id: "browse", href: "/feed" },
    { id: "newRequest", href: "/help/new" },
    { id: "backToFeed", href: "/feed" },
  ],
  messages: [{ id: "inbox", href: "/messages" }],
  mentor: [{ id: "space", href: "/mentor" }],
  profile: [{ id: "view", href: "/profile" }],
  admin: [
    { id: "overview", href: "/admin" },
    { id: "users", href: "/admin/users" },
    { id: "moderation", href: "/admin/moderation" },
  ],
  adminUsers: [
    { id: "users", href: "/admin/users" },
    { id: "overview", href: "/admin" },
  ],
  adminModeration: [
    { id: "moderation", href: "/admin/moderation" },
    { id: "overview", href: "/admin" },
  ],
};

export type AppSidebarContextPanelLabels = {
  title: string;
  description?: string;
  links: Record<string, string>;
};

export type AppSidebarContextPanel = {
  title: string;
  description?: string;
  links: AppSidebarContextLinkDef[];
};

export function resolveAppSidebarContextPanel(
  activeId: AppSidebarNavId | undefined,
  labels: AppSidebarContextPanelLabels | null,
): AppSidebarContextPanel | null {
  if (!activeId || !labels) {
    return null;
  }

  const linkDefs = APP_SIDEBAR_CONTEXT_LINKS[activeId];
  if (!linkDefs || linkDefs.length === 0) {
    return null;
  }

  const links = linkDefs.filter((link) => labels.links[link.id]);
  if (links.length === 0) {
    return null;
  }

  return {
    title: labels.title,
    description: labels.description,
    links,
  };
}

type SidebarContextSource = {
  dashboard: {
    title: string;
    description: string;
    newRequest: string;
    browseFeed: string;
    inbox: string;
    myRequests: string;
  };
  subjects: { title: string; explore: string };
  resources: { title: string; all: string };
  events: { title: string; all: string };
  newRequest: { title: string; description: string; create: string; backToFeed: string };
  feed: {
    title: string;
    description: string;
    browse: string;
    newRequest: string;
    backToFeed: string;
  };
  messages: { title: string; inbox: string };
  mentor: { title: string; space: string };
  profile: { title: string; view: string };
  admin: {
    title: string;
    description: string;
    overview: string;
    users: string;
    moderation: string;
  };
};

export function buildSidebarContextPanelLabels(
  activeId: AppSidebarNavId | undefined,
  context: SidebarContextSource,
): AppSidebarContextPanelLabels | null {
  if (!activeId) {
    return null;
  }

  switch (activeId) {
    case "dashboard":
      return {
        title: context.dashboard.title,
        description: context.dashboard.description,
        links: {
          newRequest: context.dashboard.newRequest,
          browseFeed: context.dashboard.browseFeed,
          inbox: context.dashboard.inbox,
          myRequests: context.dashboard.myRequests,
        },
      };
    case "subjects":
      return {
        title: context.subjects.title,
        links: { explore: context.subjects.explore },
      };
    case "resources":
      return {
        title: context.resources.title,
        links: { all: context.resources.all },
      };
    case "events":
      return {
        title: context.events.title,
        links: { all: context.events.all },
      };
    case "newRequest":
      return {
        title: context.newRequest.title,
        description: context.newRequest.description,
        links: {
          create: context.newRequest.create,
          backToFeed: context.newRequest.backToFeed,
        },
      };
    case "feed":
      return {
        title: context.feed.title,
        description: context.feed.description,
        links: {
          browse: context.feed.browse,
          newRequest: context.feed.newRequest,
          backToFeed: context.feed.backToFeed,
        },
      };
    case "messages":
      return {
        title: context.messages.title,
        links: { inbox: context.messages.inbox },
      };
    case "mentor":
      return {
        title: context.mentor.title,
        links: { space: context.mentor.space },
      };
    case "profile":
      return {
        title: context.profile.title,
        links: { view: context.profile.view },
      };
    case "admin":
      return {
        title: context.admin.title,
        description: context.admin.description,
        links: {
          overview: context.admin.overview,
          users: context.admin.users,
          moderation: context.admin.moderation,
        },
      };
    case "adminUsers":
      return {
        title: context.admin.title,
        links: {
          users: context.admin.users,
          overview: context.admin.overview,
        },
      };
    case "adminModeration":
      return {
        title: context.admin.title,
        links: {
          moderation: context.admin.moderation,
          overview: context.admin.overview,
        },
      };
    default:
      return null;
  }
}
