"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

import type { AdminDashboardStats, UserRole } from "@allaboard/types";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@allaboard/ui/components/avatar";
import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@allaboard/ui/components/dropdown-menu";

import { Link, useRouter } from "@/i18n/navigation";

export type AppShellUserMenuProps = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  defaultOpen?: boolean;
};

function userInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function adminPendingCount(stats: AdminDashboardStats): number {
  return stats.flaggedCount + stats.pendingSubjectRequests + stats.pendingResources;
}

export function AppShellUserMenu({
  displayName,
  avatarUrl,
  role,
  defaultOpen = false,
}: AppShellUserMenuProps) {
  const t = useTranslations("userMenu");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mentorUnreadCount, setMentorUnreadCount] = useState(0);
  const [adminPendingCountState, setAdminPendingCountState] = useState(0);
  const isMentor = role === "mentor" || role === "admin";
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isMentor) return;
    let cancelled = false;
    fetch("/api/mentor/feed", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: Array<{ hasUnreadForMentor?: boolean }> } | null) => {
        if (cancelled || !data?.items) return;
        const count = data.items.filter((item) => item.hasUnreadForMentor).length;
        setMentorUnreadCount(count);
      })
      .catch(() => {
        /* mentor-only route — ignore errors */
      });
    return () => {
      cancelled = true;
    };
  }, [isMentor]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    fetch("/api/admin/dashboard", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stats?: AdminDashboardStats } | null) => {
        if (cancelled || !data?.stats) return;
        setAdminPendingCountState(adminPendingCount(data.stats));
      })
      .catch(() => {
        /* admin-only route — ignore errors */
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
      router.refresh();
    });
  }

  const avatarSrc = avatarUrl?.trim() || null;

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative size-9 rounded-full p-0"
          aria-label={t("ariaLabel", { name: displayName })}
          data-testid="app-shell-user-menu-trigger"
        >
          <Avatar size="default" className="size-9 border border-border">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={displayName} />
            ) : null}
            <AvatarFallback>{userInitials(displayName)}</AvatarFallback>
            {isMentor && mentorUnreadCount > 0 ? (
              <AvatarBadge
                data-testid="user-menu-mentor-badge"
                aria-label={tNav("mentorUnreadAria", { count: mentorUnreadCount })}
              />
            ) : null}
            {isAdmin && adminPendingCountState > 0 ? (
              <AvatarBadge
                data-testid="user-menu-admin-badge"
                aria-label={tNav("adminPendingAria", { count: adminPendingCountState })}
              />
            ) : null}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold">{displayName}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">{t("profile")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me/posts">{t("myPosts")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me/bookmarks">{t("myBookmarks")}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isMentor ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/mentor" className="flex w-full items-center justify-between">
                  <span>{t("mentor")}</span>
                  {mentorUnreadCount > 0 ? (
                    <Badge variant="destructive">{mentorUnreadCount}</Badge>
                  ) : null}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin" data-testid="user-menu-admin-link" className="flex w-full items-center justify-between">
                  <span>{t("admin")}</span>
                  {adminPendingCountState > 0 ? (
                    <Badge variant="destructive">{adminPendingCountState}</Badge>
                  ) : null}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            handleLogout();
          }}
          data-testid="app-shell-logout"
        >
          {pending ? t("logoutPending") : t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
