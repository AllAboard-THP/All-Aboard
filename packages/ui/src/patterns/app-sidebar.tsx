"use client";

import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { cn } from "../lib/utils";
import { APP_SHELL_SIDEBAR_CHROME_CLASS } from "./landing-layout";

export type AppSidebarLabels = {
  navigationGroup: string;
  communityGroup: string;
};

export type AppSidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

export type AppSidebarLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  "aria-current"?: "page";
};

const APP_SIDEBAR_CLASS = cn(
  APP_SHELL_SIDEBAR_CHROME_CLASS,
  "flex w-full shrink-0 flex-col md:w-64 md:min-h-0",
);

function sidebarLinkClass(active?: boolean) {
  return cn(
    "dashboard-hover-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm",
    active ? "dashboard-nav-active font-medium text-primary" : "text-muted-foreground",
  );
}

function AppSidebarNavItem({
  item,
  onItemClick,
  LinkComponent,
}: {
  item: AppSidebarItem;
  onItemClick?: (id: string) => void;
  LinkComponent?: ComponentType<AppSidebarLinkProps>;
}) {
  const Icon = item.icon;
  const className = sidebarLinkClass(item.active);

  if (item.href && LinkComponent) {
    return (
      <LinkComponent href={item.href} className={className} aria-current={item.active ? "page" : undefined}>
        <Icon className="size-4 shrink-0" aria-hidden />
        <span>{item.label}</span>
      </LinkComponent>
    );
  }

  return (
    <button type="button" onClick={() => onItemClick?.(item.id)} className={className}>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{item.label}</span>
    </button>
  );
}

export function AppSidebar({
  labels,
  navigationItems,
  communityItems,
  onItemClick,
  LinkComponent,
  className,
}: {
  labels: AppSidebarLabels;
  navigationItems: AppSidebarItem[];
  communityItems: AppSidebarItem[];
  onItemClick?: (id: string) => void;
  LinkComponent?: ComponentType<AppSidebarLinkProps>;
  className?: string;
}) {
  return (
    <aside className={cn(APP_SIDEBAR_CLASS, className)}>
      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        aria-label={labels.navigationGroup}
      >
        <div>
          <p className="landing-eyebrow mb-2 px-3">{labels.navigationGroup}</p>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <AppSidebarNavItem
                key={item.id}
                item={item}
                onItemClick={onItemClick}
                LinkComponent={LinkComponent}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="landing-eyebrow mb-2 px-3">{labels.communityGroup}</p>
          <div className="space-y-1">
            {communityItems.map((item) => (
              <AppSidebarNavItem
                key={item.id}
                item={item}
                onItemClick={onItemClick}
                LinkComponent={LinkComponent}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
