import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
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

export type AppSidebarContextLinkDef = {
  id: string;
  href: string;
  labelKey: string;
  icon?: LucideIcon;
};

export type AppSidebarContextDef = {
  navId: AppSidebarNavId;
  titleKey: string;
  descriptionKey?: string;
  links: AppSidebarContextLinkDef[];
};

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

export const APP_SIDEBAR_CONTEXT: Partial<Record<AppSidebarNavId, AppSidebarContextDef>> = {
  dashboard: {
    navId: "dashboard",
    titleKey: "context.dashboard.title",
    descriptionKey: "context.dashboard.description",
    links: [{ id: "demo", href: "/dashboard/demo", labelKey: "context.dashboard.demo" }],
  },
  subjects: {
    navId: "subjects",
    titleKey: "context.subjects.title",
    links: [{ id: "explore", href: "/explore", labelKey: "context.subjects.explore" }],
  },
  resources: {
    navId: "resources",
    titleKey: "context.resources.title",
    links: [{ id: "all", href: "/resources", labelKey: "context.resources.all" }],
  },
  events: {
    navId: "events",
    titleKey: "context.events.title",
    links: [{ id: "all", href: "/events", labelKey: "context.events.all" }],
  },
  newRequest: {
    navId: "newRequest",
    titleKey: "context.newRequest.title",
    descriptionKey: "context.newRequest.description",
    links: [
      { id: "create", href: "/help/new", labelKey: "context.newRequest.create", icon: Plus },
      { id: "feed", href: "/feed", labelKey: "context.newRequest.backToFeed", icon: ArrowLeft },
    ],
  },
  feed: {
    navId: "feed",
    titleKey: "context.feed.title",
    descriptionKey: "context.feed.description",
    links: [
      { id: "feed", href: "/feed", labelKey: "context.feed.browse" },
      { id: "new", href: "/help/new", labelKey: "context.feed.newRequest", icon: Plus },
    ],
  },
  messages: {
    navId: "messages",
    titleKey: "context.messages.title",
    links: [{ id: "inbox", href: "/messages", labelKey: "context.messages.inbox" }],
  },
  mentor: {
    navId: "mentor",
    titleKey: "context.mentor.title",
    links: [
      { id: "space", href: "/mentor", labelKey: "context.mentor.space" },
      { id: "demo", href: "/mentor/demo", labelKey: "context.mentor.demo" },
    ],
  },
  profile: {
    navId: "profile",
    titleKey: "context.profile.title",
    links: [{ id: "view", href: "/profile", labelKey: "context.profile.view" }],
  },
  admin: {
    navId: "admin",
    titleKey: "context.admin.title",
    descriptionKey: "context.admin.description",
    links: [
      { id: "overview", href: "/admin", labelKey: "context.admin.overview" },
      { id: "users", href: "/admin/users", labelKey: "context.admin.users", icon: UserCog },
      { id: "moderation", href: "/admin/moderation", labelKey: "context.admin.moderation", icon: Gavel },
    ],
  },
  adminUsers: {
    navId: "adminUsers",
    titleKey: "context.admin.title",
    links: [{ id: "users", href: "/admin/users", labelKey: "context.admin.users", icon: UserCog }],
  },
  adminModeration: {
    navId: "adminModeration",
    titleKey: "context.admin.title",
    links: [
      {
        id: "moderation",
        href: "/admin/moderation",
        labelKey: "context.admin.moderation",
        icon: Gavel,
      },
    ],
  },
};

export type AppSidebarLabelMap = {
  navigationGroup: string;
  communityGroup: string;
  mentorGroup: string;
  adminGroup: string;
  expandSidebar: string;
  collapseSidebar: string;
  openMenu: string;
  closeMenu: string;
} & Record<AppSidebarNavId, string> &
  Record<string, string>;

export type AppSidebarContextLink = {
  id: string;
  href: string;
  label: string;
  icon?: LucideIcon;
  active?: boolean;
};

export type AppSidebarContextPanelData = {
  title: string;
  description?: string;
  links: AppSidebarContextLink[];
};

export type AppSidebarResolvedContext = {
  activeId?: AppSidebarNavId;
  openSectionIds: AppSidebarSectionId[];
  showMentorSection: boolean;
  showAdminSection: boolean;
  context?: AppSidebarContextPanelData;
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

function resolveContextLinks(
  pathname: string | null,
  activeId?: AppSidebarNavId,
  labelMap?: AppSidebarLabelMap,
): AppSidebarContextPanelData | undefined {
  if (!activeId) {
    return undefined;
  }

  const def = APP_SIDEBAR_CONTEXT[activeId];
  if (!def || !labelMap) {
    return undefined;
  }

  const path = pathname ? normalizeAppSidebarPathname(pathname) : "";

  return {
    title: labelMap[def.titleKey] ?? def.titleKey,
    description: def.descriptionKey ? labelMap[def.descriptionKey] : undefined,
    links: def.links.map((link) => ({
      id: link.id,
      href: link.href,
      label: labelMap[link.labelKey] ?? link.labelKey,
      icon: link.icon,
      active: path === link.href || path.startsWith(`${link.href}/`),
    })),
  };
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
  options?: AppSidebarRoleOptions & {
    labelMap?: AppSidebarLabelMap;
  },
): AppSidebarResolvedContext {
  const activeId = resolveAppSidebarActiveId(pathname);
  const { showMentorSection, showAdminSection } = resolveAppSidebarRoleFlags(options);

  return {
    activeId,
    openSectionIds: resolveOpenSectionIds({ showMentorSection, showAdminSection }),
    showMentorSection,
    showAdminSection,
    context: resolveContextLinks(pathname, activeId, options?.labelMap),
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
