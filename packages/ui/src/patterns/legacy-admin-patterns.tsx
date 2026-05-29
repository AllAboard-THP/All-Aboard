"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  Crown,
  Inbox,
  Mail,
  Shield,
  Trash2,
  Users,
} from "lucide-react";

import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import { StatCard } from "./legacy-ui";

type AdminActionTone = "primary" | "yellow" | "emerald" | "accent" | "orange";

const actionToneClass: Record<AdminActionTone, string> = {
  primary: "bg-primary/20 text-primary hover:bg-primary/30",
  yellow: "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
  accent: "bg-accent/20 text-accent hover:bg-accent/30",
  orange: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
};

const badgeToneClass: Record<AdminActionTone, string> = {
  primary: "bg-primary text-primary-foreground",
  yellow: "bg-yellow-400 text-black",
  emerald: "bg-emerald-500 text-white",
  accent: "bg-accent text-accent-foreground",
  orange: "bg-orange-400 text-black",
};

export function AdminActionButton({
  label,
  icon: Icon,
  tone = "primary",
  badge,
  className,
}: {
  label: string;
  icon: LucideIcon;
  tone?: AdminActionTone;
  badge?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 rounded-lg p-4 text-left text-sm font-medium transition-colors",
        actionToneClass[tone],
        className,
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
            badgeToneClass[tone],
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function AdminStatsGrid({
  labels = legacyLabelsFr,
  flaggedCount = 1,
}: {
  labels?: LegacyLabels;
  flaggedCount?: number;
}) {
  const stats = labels.admin.stats;

  return (
    <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
      <StatCard value={312} label={stats.posts} tone="primary" />
      <StatCard value={184} label={stats.users} tone="accent" />
      <StatCard value={4} label={stats.subjectRequests} tone="yellow" />
      <StatCard value={7} label={stats.pendingResources} tone="emerald" />
      <StatCard
        value={flaggedCount}
        label={stats.moderation}
        tone="orange"
        className={cn(
          "col-span-2 md:col-span-1",
          flaggedCount > 0 && "ring-1 ring-orange-400/40",
        )}
      />
    </div>
  );
}

export function AdminActionGrid({
  labels = legacyLabelsFr,
}: {
  labels?: LegacyLabels;
}) {
  const actions = labels.admin.actions;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="mb-4 text-2xl font-bold">{labels.admin.actionsTitle}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AdminActionButton label={actions.managePosts} icon={Trash2} />
        <AdminActionButton label={actions.viewUsers} icon={Users} />
        <AdminActionButton label={actions.sendMessage} icon={Mail} />
        <AdminActionButton
          label={actions.subjectRequests}
          icon={Inbox}
          tone="yellow"
          badge={4}
        />
        <AdminActionButton
          label={actions.createAdmin}
          icon={Crown}
          tone="yellow"
        />
        <AdminActionButton
          label={actions.validateResources}
          icon={BookOpen}
          tone="emerald"
          badge={7}
        />
        <AdminActionButton
          label={actions.events}
          icon={Calendar}
          tone="accent"
          badge={2}
        />
        <AdminActionButton
          label={actions.moderation}
          icon={Shield}
          tone="orange"
          badge={1}
        />
      </div>
    </div>
  );
}
