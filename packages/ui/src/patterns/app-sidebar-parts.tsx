"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { ComponentType, ReactNode, MouseEvent } from "react";

import { cn } from "../lib/utils";
import type { AppSidebarLinkProps } from "./app-sidebar";

export function AppSidebarDrawerSection({
  id,
  label,
  open,
  onToggle,
  expanded,
  prefersReducedMotion,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  expanded: boolean;
  prefersReducedMotion: boolean;
  children: ReactNode;
}) {
  if (!expanded) {
    return <div className="hidden" aria-hidden />;
  }

  return (
    <section className="app-sidebar-drawer-section" data-sidebar-section={id}>
      <button
        type="button"
        className="dashboard-hover-link flex w-full items-center justify-between rounded-xl px-3 py-2 text-left"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <span className="landing-eyebrow">{label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            prefersReducedMotion ? "" : "duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn("app-sidebar-drawer", open && "app-sidebar-drawer--open")}
        aria-hidden={!open}
      >
        <div className="app-sidebar-drawer__inner">
          <div className="space-y-1 px-1 pb-2 pt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function AppSidebarRailItem({
  item,
  expanded,
  badge,
  showDot,
  onItemClick,
  LinkComponent,
  staggerIndex,
}: {
  item: { id: string; label: string; icon: LucideIcon; href?: string; active?: boolean };
  expanded: boolean;
  badge?: number;
  showDot?: boolean;
  onItemClick?: (id: string) => void;
  LinkComponent?: ComponentType<AppSidebarLinkProps>;
  staggerIndex: number;
}) {
  const Icon = item.icon;
  const className = cn(
    "app-sidebar-nav-item dashboard-hover-link relative flex w-full items-center rounded-xl py-2.5 text-left text-sm",
    expanded ? "gap-3 px-3" : "justify-center px-0",
    item.active ? "dashboard-nav-active font-medium text-primary" : "text-muted-foreground",
  );

  const stopShellToggle = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const content = (
    <>
      <span className="relative shrink-0">
        <Icon className="size-4" aria-hidden />
        {showDot ? (
          <span
            className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2 ring-background"
            aria-hidden
          />
        ) : null}
      </span>
      {expanded ? <span className="min-w-0 truncate">{item.label}</span> : null}
      {expanded && badge && badge > 0 ? (
        <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
      {!expanded && badge && badge > 0 ? (
        <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" aria-hidden />
      ) : null}
    </>
  );

  const style = { ["--sidebar-stagger-index" as string]: staggerIndex };

  if (item.href && LinkComponent) {
    return (
      <LinkComponent
        href={item.href}
        className={className}
        style={style}
        title={expanded ? undefined : item.label}
        aria-current={item.active ? "page" : undefined}
        aria-label={expanded ? undefined : item.label}
        onClick={stopShellToggle}
      >
        {content}
      </LinkComponent>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      title={expanded ? undefined : item.label}
      aria-label={expanded ? undefined : item.label}
      onClick={(event) => {
        stopShellToggle(event);
        onItemClick?.(item.id);
      }}
    >
      {content}
    </button>
  );
}
