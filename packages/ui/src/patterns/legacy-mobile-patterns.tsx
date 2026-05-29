"use client";

import { Compass, Home, MessageCircle, Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";

export type MobileNavLink = "feed" | "explore" | "messages" | "profile";

export function MobileBottomNav({
  activeLink = "feed",
  messageCount = 0,
  userInitials = "HB",
  showMentorDot = false,
  labels = legacyLabelsFr,
  className,
}: {
  activeLink?: MobileNavLink;
  messageCount?: number;
  userInitials?: string;
  showMentorDot?: boolean;
  labels?: LegacyLabels;
  className?: string;
}) {
  const linkClass = (link: MobileNavLink) =>
    cn(
      "flex flex-col items-center gap-1 text-xs transition-colors",
      activeLink === link ? "text-primary" : "text-muted-foreground",
    );

  return (
    <nav
      className={cn(
        "glass safe-bottom fixed bottom-0 z-50 w-full border-t border-white/10 md:hidden",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-around">
        <button type="button" className={linkClass("feed")}>
          <Home className="size-5" />
          {labels.mobileNav.home}
        </button>

        <button type="button" className={linkClass("explore")}>
          <Compass className="size-5" />
          {labels.mobileNav.explore}
        </button>

        <button
          type="button"
          aria-label={labels.mobileNav.createAria}
          className="-mt-8 flex flex-col items-center gap-1"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Plus className="size-5 text-primary-foreground" />
          </span>
        </button>

        <button type="button" className={cn(linkClass("messages"), "relative")}>
          <MessageCircle className="size-5" />
          {messageCount > 0 ? (
            <span className="absolute -top-1 right-0 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
              {messageCount}
            </span>
          ) : null}
          {labels.mobileNav.messages}
        </button>

        <button type="button" className={cn(linkClass("profile"), "relative")}>
          <span className="relative">
            <Avatar className="size-6 border border-white/30">
              <AvatarFallback className="text-[10px]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {showMentorDot ? (
              <span className="absolute -top-1 -right-1 size-3.5 rounded-full border border-background bg-emerald-400" />
            ) : null}
          </span>
          {labels.mobileNav.profile}
        </button>
      </div>
    </nav>
  );
}
