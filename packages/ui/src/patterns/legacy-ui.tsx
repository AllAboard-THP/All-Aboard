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
import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
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

import { AppChromeBrand, AppChromeHeader, AppChromeHeaderRow } from "./app-chrome-shell";
import {
  APP_CHROME_BRAND_MARK_CLASS,
  APP_CHROME_BRAND_WORDMARK_CLASS,
  APP_GLASS_CARD_CLASS,
  LANDING_EDGE_PADDING_CLASS,
} from "./landing-layout";
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
  markClassName,
  showWordmark = true,
  tagline,
}: {
  labels?: LegacyLabels;
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  /** Renders below the wordmark (e.g. landing header tagline). */
  tagline?: ReactNode;
}) {
  if (showWordmark && !tagline) {
    return (
      <AppChromeBrand
        brandName={labels.brandName}
        className={className}
        markClassName={markClassName}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AllAboardLogoMark
        className={markClassName ?? APP_CHROME_BRAND_MARK_CLASS}
        title={labels.brandName}
      />
      {tagline ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          {showWordmark ? (
            <span className={APP_CHROME_BRAND_WORDMARK_CLASS}>{labels.brandName}</span>
          ) : null}
          {tagline}
        </div>
      ) : null}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
  chromeText = false,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  chromeText?: boolean;
  /** Landing hero — lavender glow on photo background. */
  variant?: "default" | "landing";
}) {
  return (
    <p
      className={cn(
        "mb-4 uppercase tracking-[0.3em]",
        variant === "landing"
          ? "landing-hero-eyebrow landing-hero-hover-zoom"
          : cn(
              "text-xs",
              chromeText ? "landing-chrome-text--eyebrow" : "text-primary",
            ),
        className,
      )}
    >
      {children}
    </p>
  );
}

export function GradientHeading({
  lead,
  line2Prefix,
  accent,
  accentPrimary,
  accentSecondary,
  className,
  allowWrap = false,
  chromeText = false,
  landingHero = false,
}: {
  lead: string;
  line2Prefix: string;
  accent: string;
  accentPrimary?: string;
  accentSecondary?: string;
  className?: string;
  /** When true, lines wrap inside narrow columns (e.g. landing grid). */
  allowWrap?: boolean;
  /** Metallic chrome on lead + line2; accent keeps brand gradient. */
  chromeText?: boolean;
  /** Photo landing — white title, purple + gradient accent split. */
  landingHero?: boolean;
}) {
  const lineClass = cn(
    "block text-pretty",
    allowWrap ? "text-balance" : "whitespace-nowrap",
  );
  const lightLine = landingHero
    ? "landing-hero-title-light"
    : chromeText
      ? "landing-chrome-text"
      : undefined;
  const useAccentSplit =
    landingHero && accentPrimary != null && accentSecondary != null;

  return (
    <h1
      className={cn(
        "text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.12] font-bold tracking-tight text-foreground",
        landingHero && "landing-hero-heading font-extrabold",
        className,
      )}
    >
      {useAccentSplit ? (
        <>
          <span className={cn(lineClass, lightLine)}>{lead.trimEnd()}</span>
          <span className={lineClass}>
            <span className={lightLine}>{line2Prefix}</span>
            <span className="landing-hero-accent-purple">{accentPrimary}</span>
          </span>
          <span className={lineClass}>
            <span className="gradient-text">{accentSecondary}</span>.
          </span>
        </>
      ) : (
        <>
          <span className={cn(lineClass, lightLine)}>{lead}</span>
          <span className={lineClass}>
            <span className={lightLine}>{line2Prefix}</span>
            <span className="gradient-text">{accent}</span>.
          </span>
        </>
      )}
    </h1>
  );
}

const pillIcons = [Zap, MessageCircle, Layers] as const;

export function FeaturePill({
  label,
  iconIndex,
  size = "default",
  className,
}: {
  label: string;
  iconIndex: 0 | 1 | 2;
  size?: "default" | "lg";
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
        "subject-chip group inline-flex cursor-default items-center gap-2 rounded-full text-gray-200 shadow-none",
        size === "lg"
          ? "px-5 py-2.5 text-base sm:px-6 sm:py-3"
          : "px-4 py-2 text-sm",
        "transition-[transform,background-color,border-color] duration-200 ease-out",
        "hover:scale-105 hover:border-white/30 hover:bg-white/12",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "lg" ? "size-5" : "size-4",
          "transition-[filter,transform] duration-200 group-hover:scale-110 group-hover:brightness-125",
          iconClass,
        )}
      />
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
  onProposeClick,
}: {
  labels?: LegacyLabels;
  className?: string;
  onProposeClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "glass group block w-full rounded-2xl border-2 border-dashed border-white/10 p-6 text-left transition-colors hover:border-primary/50 hover:bg-white/5",
        className,
      )}
      onClick={() =>
        onProposeClick
          ? onProposeClick()
          : legacyDemoToast(labels.subjectCard.proposeTitle)
      }
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
  onProposeSubjectClick,
}: {
  labels?: LegacyLabels;
  className?: string;
  onProposeSubjectClick?: () => void;
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
      <ProposeSubjectCard
        labels={labels}
        onProposeClick={onProposeSubjectClick}
      />
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
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-4 text-center md:p-6", className)}>
      <p className={cn("text-3xl font-bold", toneClass)}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/** Canonical legal routes for a future apps/web port (`/legal/cgu`, etc.). */
export type LegacyLegalLinkKey = "cgu" | "privacy" | "legal";

const LEGAL_LINK_HREFS: Record<LegacyLegalLinkKey, string> = {
  cgu: "/legal/cgu",
  privacy: "/legal/privacy",
  legal: "/legal/mentions",
};

export function AppFooter({
  labels = legacyLabelsFr,
  className,
  edgeToEdge = true,
  edgePaddingClassName = LANDING_EDGE_PADDING_CLASS,
  onLegalLinkClick,
}: {
  labels?: LegacyLabels;
  className?: string;
  /** Full-width row with landing edge padding (default, matches landing shell). */
  edgeToEdge?: boolean;
  edgePaddingClassName?: string;
  onLegalLinkClick?: (key: LegacyLegalLinkKey) => void;
}) {
  const year = new Date().getFullYear();
  const links: { key: LegacyLegalLinkKey; label: string }[] = [
    { key: "cgu", label: labels.footer.cgu },
    { key: "privacy", label: labels.footer.privacy },
    { key: "legal", label: labels.footer.legal },
  ];

  return (
    <footer className={className}>
      <div
        className={
          edgeToEdge
            ? cn(
                "flex w-full flex-col items-center justify-between gap-4 md:flex-row",
                edgePaddingClassName,
              )
            : "mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8"
        }
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AllAboardLogoMark className="size-5" title={labels.brandName} />
          <span className="gradient-text font-semibold">{labels.brandName}</span>
          <span>{labels.footer.rights(year)}</span>
        </div>
        <nav
          aria-label="Legal"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {links.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className="transition-colors hover:text-foreground"
              title={LEGAL_LINK_HREFS[key]}
              onClick={() =>
                onLegalLinkClick
                  ? onLegalLinkClick(key)
                  : legacyDemoToast(label)
              }
            >
              {label}
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
  showMainNav = true,
  showUserMenu = true,
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
  /** Main nav links (feed, explore, …). Brand block stays visible when false. */
  showMainNav?: boolean;
  showUserMenu?: boolean;
  labels?: LegacyLabels;
  className?: string;
}) {
  const [currentLink, setCurrentLink] = useState(activeLink);

  useEffect(() => {
    setCurrentLink(activeLink);
  }, [activeLink]);

  return (
    <AppChromeHeader layout="bar" className={className}>
      <AppChromeHeaderRow>
        <BrandLogo labels={labels} className="min-w-0 shrink-0" />
        {showMainNav || showUserMenu ? (
          <div className="ml-auto flex shrink-0 items-center gap-2 self-center sm:gap-4">
            {showMainNav ? (
              <nav
                aria-label="Main"
                className="hidden items-center gap-6 md:flex"
              >
                {(Object.keys(navIcons) as LegacyNavLink[]).map((link) => {
                  const Icon = navIcons[link];
                  const active = currentLink === link;

                  return (
                    <button
                      key={link}
                      type="button"
                      className={cn(
                        "relative flex items-center gap-2 text-sm font-medium transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
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
              </nav>
            ) : null}
            {showUserMenu ? (
              <UserMenu
                userName={userName}
                userEmail={userEmail}
                userInitials={userInitials}
                isAdmin={isAdmin}
                isMentor={isMentor}
                defaultOpen={userMenuOpen}
                labels={labels}
              />
            ) : null}
          </div>
        ) : null}
      </AppChromeHeaderRow>
    </AppChromeHeader>
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
