"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Compass,
  Crown,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  MessageCircle,
  MessagesSquare,
  Paperclip,
  Plus,
  Send,
  User,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "../components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import {
  legacyLabelsFr,
  type LegacyLabels,
  type LegacyNavLink,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacySubjects,
  type LegacySubject,
} from "./fixtures/legacy-subjects";
import { legacyDemoToast } from "./legacy-story-feedback";

export type { LegacyLabels, LegacyNavLink } from "../i18n/legacy-labels";

const navIcons: Record<LegacyNavLink, LucideIcon> = {
  feed: Home,
  explore: Compass,
  resources: Bookmark,
  events: Calendar,
  messages: MessagesSquare,
};

export function BrandLogo({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
        <GraduationCap className="size-5 text-primary-foreground" />
      </div>
      <span className="gradient-text text-xl font-bold">{labels.brandName}</span>
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-4 text-xs tracking-[0.3em] text-primary uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function GradientHeading({
  lead,
  accent,
  className,
}: {
  lead: string;
  accent: string;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-5xl leading-tight font-extrabold md:text-6xl",
        className,
      )}
    >
      {lead} <span className="gradient-text">{accent}</span>.
    </h1>
  );
}

const pillIcons = [Zap, MessageCircle, Layers] as const;

export function FeaturePill({
  label,
  iconIndex,
  className,
}: {
  label: string;
  iconIndex: 0 | 1 | 2;
  className?: string;
}) {
  const Icon = pillIcons[iconIndex];
  const iconClass =
    iconIndex === 0
      ? "text-primary"
      : iconIndex === 1
        ? "text-accent"
        : "text-cyan-400";

  return (
    <span
      className={cn(
        "subject-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-gray-200",
        className,
      )}
    >
      <Icon className={cn("size-4", iconClass)} />
      {label}
    </span>
  );
}

export function SubjectTag({
  name,
  accentColor,
  icon: Icon,
  className,
}: {
  name: string;
  accentColor: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        className,
      )}
      style={{
        color: accentColor,
        borderColor: `${accentColor}33`,
        backgroundColor: `${accentColor}18`,
      }}
    >
      {Icon ? <Icon className="size-3" /> : null}
      {name}
    </span>
  );
}

export function SubjectCard({
  subject,
  labels = legacyLabelsFr,
  className,
}: {
  subject: LegacySubject;
  labels?: LegacyLabels;
  className?: string;
}) {
  const Icon = subject.icon;

  return (
    <button
      type="button"
      className={cn(
        "glass group block w-full rounded-2xl p-6 text-left transition-colors hover:bg-white/5",
        className,
      )}
      onClick={() => legacyDemoToast(subject.name)}
    >
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
        style={{
          backgroundColor: `${subject.accentColor}1F`,
          color: subject.accentColor,
        }}
      >
        <Icon className="size-7" />
      </div>
      <h3 className="mb-2 text-xl font-bold">{subject.name}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{subject.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {labels.subjectCard.requests(subject.requestCount)}
        </span>
        <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

export function ProposeSubjectCard({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "glass group block w-full rounded-2xl border-2 border-dashed border-white/10 p-6 text-left transition-colors hover:border-primary/50 hover:bg-white/5",
        className,
      )}
      onClick={() => legacyDemoToast(labels.subjectCard.proposeTitle)}
    >
      <div className="mb-4 size-14 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] transition-transform group-hover:scale-110">
        <div className="flex size-full items-center justify-center rounded-2xl bg-card">
          <Plus className="size-7 text-primary" />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold">{labels.subjectCard.proposeTitle}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {labels.subjectCard.proposeDescription}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {labels.subjectCard.proposeAction}
        </span>
        <Send className="size-4 text-primary transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

export function SubjectCardGrid({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {legacySubjects.map((subject) => (
        <SubjectCard key={subject.slug} subject={subject} labels={labels} />
      ))}
      <ProposeSubjectCard labels={labels} />
    </div>
  );
}

export function StatCard({
  value,
  label,
  tone = "primary",
  className,
}: {
  value: string | number;
  label: string;
  tone?: "primary" | "accent" | "emerald" | "orange" | "yellow";
  className?: string;
}) {
  const toneClass = {
    primary: "text-primary",
    accent: "text-accent",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    yellow: "text-yellow-400",
  }[tone];

  return (
    <div className={cn("glass rounded-2xl p-4 text-center md:p-6", className)}>
      <p className={cn("text-3xl font-bold", toneClass)}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AppFooter({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  const year = new Date().getFullYear();
  const links = [
    labels.footer.cgu,
    labels.footer.privacy,
    labels.footer.legal,
  ];

  return (
    <footer className={cn("mt-12 border-t border-white/5 py-8", className)}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
            <GraduationCap className="size-3 text-primary-foreground" />
          </div>
          <span className="gradient-text font-semibold">{labels.brandName}</span>
          <span>{labels.footer.rights(year)}</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((link) => (
            <button
              key={link}
              type="button"
              className="transition-colors hover:text-foreground"
              onClick={() => legacyDemoToast(link)}
            >
              {link}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function AppNavBar({
  activeLink = "feed",
  messageCount = 0,
  userName = "Admin AllAboard",
  userEmail = "",
  userInitials = "AA",
  isAdmin = true,
  isMentor = false,
  userMenuOpen = false,
  labels = legacyLabelsFr,
  className,
}: {
  activeLink?: LegacyNavLink;
  messageCount?: number;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  isAdmin?: boolean;
  isMentor?: boolean;
  userMenuOpen?: boolean;
  labels?: LegacyLabels;
  className?: string;
}) {
  const [currentLink, setCurrentLink] = useState(activeLink);

  useEffect(() => {
    setCurrentLink(activeLink);
  }, [activeLink]);

  return (
    <nav
      className={cn(
        "glass fixed top-0 z-50 w-full border-b border-white/10",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo labels={labels} />
        <div className="hidden items-center gap-6 md:flex">
          {(Object.keys(navIcons) as LegacyNavLink[]).map((link) => {
            const Icon = navIcons[link];
            const active = currentLink === link;

            return (
              <button
                key={link}
                type="button"
                className={cn(
                  "relative flex items-center gap-2 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setCurrentLink(link)}
              >
                <Icon className="size-4" />
                {labels.nav[link]}
                {link === "messages" && messageCount > 0 ? (
                  <span className="absolute -top-2 -right-3 flex size-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                    {messageCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          userInitials={userInitials}
          isAdmin={isAdmin}
          isMentor={isMentor}
          defaultOpen={userMenuOpen}
          labels={labels}
        />
      </div>
    </nav>
  );
}

export function UserMenu({
  userName,
  userEmail,
  userInitials = "U",
  isAdmin = false,
  isMentor = false,
  defaultOpen = false,
  labels = legacyLabelsFr,
}: {
  userName: string;
  userEmail?: string;
  userInitials?: string;
  isAdmin?: boolean;
  isMentor?: boolean;
  defaultOpen?: boolean;
  labels?: LegacyLabels;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="rounded-full focus-visible:outline-none">
          <Avatar className="size-10 border-2 border-primary">
            <AvatarFallback className="bg-muted text-sm">{userInitials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass w-56 rounded-xl p-2">
        <div className="mb-2 border-b border-white/10 px-3 py-2">
          <p className="text-sm font-semibold">{userName}</p>
          {userEmail ? (
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          ) : null}
        </div>
        <DropdownMenuItem onSelect={() => legacyDemoToast(labels.userMenu.profile)}>
          <User data-icon="inline-start" />
          {labels.userMenu.profile}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => legacyDemoToast(labels.userMenu.myPosts)}>
          <Paperclip data-icon="inline-start" />
          {labels.userMenu.myPosts}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => legacyDemoToast(labels.userMenu.bookmarks)}>
          <Bookmark data-icon="inline-start" />
          {labels.userMenu.bookmarks}
        </DropdownMenuItem>
        {isMentor ? (
          <>
            <DropdownMenuSeparator className="my-2 bg-white/10" />
            <DropdownMenuItem
              className="font-medium text-emerald-400 focus:text-emerald-400"
              onSelect={() => legacyDemoToast(labels.userMenu.mentorSpace)}
            >
              <GraduationCap data-icon="inline-start" />
              {labels.userMenu.mentorSpace}
            </DropdownMenuItem>
          </>
        ) : null}
        {isAdmin ? (
          <>
            <DropdownMenuSeparator className="my-2 bg-white/10" />
            <DropdownMenuItem
              className="font-medium text-yellow-400 focus:text-yellow-400"
              onSelect={() => legacyDemoToast(labels.userMenu.adminDashboard)}
            >
              <Crown data-icon="inline-start" />
              {labels.userMenu.adminDashboard}
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator className="my-2 bg-white/10" />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => legacyDemoToast(labels.userMenu.signOut)}
        >
          <LogOut data-icon="inline-start" />
          {labels.userMenu.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
