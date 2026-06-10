"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "../lib/utils";
import {
  APP_SHELL_SIDEBAR_CHROME_CLASS,
  APP_SIDEBAR_SHELL_CLASS,
  APP_SIDEBAR_WIDTH_COLLAPSED,
  APP_SIDEBAR_WIDTH_EXPANDED,
} from "./landing-layout";
import {
  AppSidebarContextPanel,
  AppSidebarDrawerSection,
  AppSidebarRailItem,
} from "./app-sidebar-parts";
import { useAppSidebarOptional } from "./app-sidebar-provider";
import type {
  AppSidebarContextPanelData,
  AppSidebarNavId,
  AppSidebarSection,
  AppSidebarSectionId,
} from "./app-sidebar-nav";

export type AppSidebarLabels = {
  navigationGroup: string;
  communityGroup: string;
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
};

export type AppSidebarProps = {
  labels: AppSidebarLabels;
  sections: AppSidebarSection[];
  context?: AppSidebarContextPanelData;
  activeId?: AppSidebarNavId;
  openSectionIds?: AppSidebarSectionId[];
  badges?: Partial<Record<AppSidebarNavId, number>>;
  mentorDot?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  prefersReducedMotion?: boolean;
  onItemClick?: (id: string) => void;
  LinkComponent?: ComponentType<AppSidebarLinkProps>;
  className?: string;
  /** Force expanded layout (mobile sheet). */
  forceExpanded?: boolean;
  /** Hide collapse toggle (mobile sheet). */
  hideToggle?: boolean;
};

function sectionLabel(labels: AppSidebarLabels, section: AppSidebarSection): string {
  if (section.labelKey === "navigationGroup") return labels.navigationGroup;
  if (section.labelKey === "communityGroup") return labels.communityGroup;
  return labels.adminGroup;
}

export function AppSidebar({
  labels,
  sections,
  context,
  activeId,
  openSectionIds = ["navigation"],
  badges,
  mentorDot,
  expanded: expandedProp,
  onExpandedChange,
  prefersReducedMotion: prefersReducedMotionProp,
  onItemClick,
  LinkComponent,
  className,
  forceExpanded = false,
  hideToggle = false,
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

  const handleToggleExpand = useCallback(() => {
    const next = !expanded;
    onExpandedChange?.(next);
    sidebarContext?.setExpanded(next);
  }, [expanded, onExpandedChange, sidebarContext]);

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  let staggerIndex = 0;

  return (
    <aside
      className={cn(
        APP_SHELL_SIDEBAR_CHROME_CLASS,
        APP_SIDEBAR_SHELL_CLASS,
        expanded ? "app-sidebar-shell--expanded" : "app-sidebar-shell--collapsed",
        "hidden shrink-0 flex-col md:flex",
        className,
      )}
      style={{
        ["--app-sidebar-width" as string]: expanded
          ? APP_SIDEBAR_WIDTH_EXPANDED
          : APP_SIDEBAR_WIDTH_COLLAPSED,
      }}
      data-sidebar-expanded={expanded ? "true" : "false"}
    >
      {!hideToggle ? (
        <div className={cn("flex shrink-0 border-b border-white/10 p-2", expanded ? "justify-end" : "justify-center")}>
          <button
            type="button"
            className="dashboard-hover-link inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground"
            onClick={handleToggleExpand}
            aria-expanded={expanded}
            aria-label={expanded ? labels.collapseSidebar : labels.expandSidebar}
          >
            {expanded ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
          </button>
        </div>
      ) : null}

      <nav
        className="flex min-h-0 flex-1 flex-col overflow-y-auto py-3"
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

        {expanded ? (
          <AppSidebarContextPanel
            data={context}
            activeId={activeId}
            LinkComponent={LinkComponent}
            onItemClick={onItemClick}
          />
        ) : null}
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
