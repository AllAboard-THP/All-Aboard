"use client";

import { Menu } from "lucide-react";
import type { ComponentType, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "../lib/utils";
import {
  APP_SHELL_SIDEBAR_CHROME_CLASS,
  APP_SIDEBAR_SHELL_CLASS,
  APP_SIDEBAR_WIDTH_COLLAPSED,
  APP_SIDEBAR_WIDTH_EXPANDED,
} from "./landing-layout";
import {
  AppSidebarContextPanelSection,
  AppSidebarDrawerSection,
  AppSidebarRailItem,
} from "./app-sidebar-parts";
import { useAppSidebarOptional } from "./app-sidebar-provider";
import type {
  AppSidebarContextPanel,
  AppSidebarNavId,
  AppSidebarSection,
  AppSidebarSectionId,
} from "./app-sidebar-nav";

export type AppSidebarLabels = {
  navigationGroup: string;
  communityGroup: string;
  mentorGroup: string;
  adminGroup: string;
  expandSidebar: string;
  collapseSidebar: string;
};

export type AppSidebarItem = {
  id: string;
  label: string;
  icon: import("lucide-react").LucideIcon;
  href?: string;
  active?: boolean;
};

export type AppSidebarLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  style?: React.CSSProperties;
  title?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export type AppSidebarProps = {
  labels: AppSidebarLabels;
  sections: AppSidebarSection[];
  openSectionIds?: AppSidebarSectionId[];
  badges?: Partial<Record<AppSidebarNavId, number>>;
  mentorDot?: boolean;
  contextPanel?: AppSidebarContextPanel | null;
  contextLinkLabels?: Record<string, string>;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  prefersReducedMotion?: boolean;
  onItemClick?: (id: string) => void;
  LinkComponent?: ComponentType<AppSidebarLinkProps>;
  className?: string;
  /** Force expanded layout (mobile sheet) — disables click-to-toggle. */
  forceExpanded?: boolean;
};

function sectionLabel(labels: AppSidebarLabels, section: AppSidebarSection): string {
  if (section.labelKey === "navigationGroup") return labels.navigationGroup;
  if (section.labelKey === "communityGroup") return labels.communityGroup;
  if (section.labelKey === "mentorGroup") return labels.mentorGroup;
  return labels.adminGroup;
}

export function AppSidebar({
  labels,
  sections,
  openSectionIds = ["navigation"],
  badges,
  mentorDot,
  contextPanel,
  contextLinkLabels = {},
  expanded: expandedProp,
  onExpandedChange,
  prefersReducedMotion: prefersReducedMotionProp,
  onItemClick,
  LinkComponent,
  className,
  forceExpanded = false,
}: AppSidebarProps) {
  const sidebarContext = useAppSidebarOptional();
  const expanded = forceExpanded ? true : (expandedProp ?? sidebarContext?.expanded ?? true);
  const prefersReducedMotion =
    prefersReducedMotionProp ?? sidebarContext?.prefersReducedMotion ?? false;

  const [openSections, setOpenSections] = useState<Set<AppSidebarSectionId>>(
    () => new Set(openSectionIds),
  );

  useEffect(() => {
    if (expandedProp !== undefined) {
      sidebarContext?.setExpanded(expandedProp);
    }
  }, [expandedProp, sidebarContext]);

  useEffect(() => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      for (const id of openSectionIds) {
        next.add(id);
      }
      return next;
    });
  }, [openSectionIds.join(",")]);

  const toggleSection = useCallback((id: AppSidebarSectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  const handleShellClick = useCallback(() => {
    if (forceExpanded) {
      return;
    }
    const next = !expanded;
    onExpandedChange?.(next);
    sidebarContext?.setExpanded(next);
  }, [expanded, forceExpanded, onExpandedChange, sidebarContext]);

  let staggerIndex = 0;

  return (
    <aside
      className={cn(
        APP_SHELL_SIDEBAR_CHROME_CLASS,
        APP_SIDEBAR_SHELL_CLASS,
        expanded ? "app-sidebar-shell--expanded" : "app-sidebar-shell--collapsed",
        "app-sidebar-shell--click-toggle hidden shrink-0 flex-col md:flex",
        className,
      )}
      style={{
        ["--app-sidebar-width" as string]: expanded
          ? APP_SIDEBAR_WIDTH_EXPANDED
          : APP_SIDEBAR_WIDTH_COLLAPSED,
      }}
      data-sidebar-expanded={expanded ? "true" : "false"}
      aria-expanded={expanded}
      title={expanded ? labels.collapseSidebar : labels.expandSidebar}
      onClick={handleShellClick}
    >
      <nav
        className="pointer-events-none flex min-h-0 flex-1 flex-col overflow-y-auto py-3"
        aria-label={labels.navigationGroup}
      >
        {expanded ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <AppSidebarDrawerSection
                key={section.id}
                id={section.id}
                label={sectionLabel(labels, section)}
                open={openSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                expanded={expanded}
                prefersReducedMotion={prefersReducedMotion}
              >
                {section.items.map((item) => {
                  const index = staggerIndex++;
                  return (
                    <AppSidebarRailItem
                      key={item.id}
                      item={item}
                      expanded={expanded}
                      badge={badges?.[item.id as AppSidebarNavId]}
                      showDot={item.id === "mentor" && mentorDot}
                      onItemClick={onItemClick}
                      LinkComponent={LinkComponent}
                      staggerIndex={index}
                    />
                  );
                })}
              </AppSidebarDrawerSection>
            ))}
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {flatItems.map((item) => {
              const index = staggerIndex++;
              return (
                <AppSidebarRailItem
                  key={item.id}
                  item={item}
                  expanded={false}
                  badge={badges?.[item.id as AppSidebarNavId]}
                  showDot={item.id === "mentor" && mentorDot}
                  onItemClick={onItemClick}
                  LinkComponent={LinkComponent}
                  staggerIndex={index}
                />
              );
            })}
          </div>
        )}

        {contextPanel ? (
          <AppSidebarContextPanelSection
            panel={contextPanel}
            linkLabels={contextLinkLabels}
            expanded={expanded}
            LinkComponent={LinkComponent}
            onItemClick={onItemClick}
          />
        ) : null}

        <div className="min-h-6 flex-1 shrink-0" aria-hidden />
      </nav>
    </aside>
  );
}

/** Mobile menu trigger — opens sheet with sidebar content. */
export function AppSidebarMobileTrigger({
  label,
  className,
  onClick,
}: {
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const sidebarContext = useAppSidebarOptional();

  return (
    <button
      type="button"
      className={cn(
        "dashboard-hover-link inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground md:hidden",
        className,
      )}
      aria-label={label}
      onClick={() => {
        sidebarContext?.setMobileOpen(true);
        onClick?.();
      }}
    >
      <Menu className="size-5" aria-hidden />
    </button>
  );
}
