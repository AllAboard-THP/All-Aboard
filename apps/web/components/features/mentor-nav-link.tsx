"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { Link } from "@/i18n/navigation";
import { useAuthRole } from "@/lib/use-auth-role";

type MentorNavLinkProps = {
  active: boolean;
};

export function MentorNavLink({ active }: MentorNavLinkProps) {
  const t = useTranslations("nav");
  const { isMentor } = useAuthRole();
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    if (!isMentor) return;
    let cancelled = false;

    async function loadBadgeCounts() {
      const feedPromise = fetch("/api/mentor/feed", {
        cache: "no-store",
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      const dashboardPromise = fetch("/api/mentor/dashboard", {
        cache: "no-store",
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      const [feedData, dashboardData] = await Promise.all([
        feedPromise,
        dashboardPromise,
      ]);

      if (cancelled) return;

      const feedUnread =
        feedData?.items?.filter(
          (item: { hasUnreadForMentor?: boolean }) => item.hasUnreadForMentor,
        ).length ?? 0;
      const pendingResources =
        dashboardData?.stats?.pendingResourcesCount ?? 0;

      setBadgeCount(feedUnread + pendingResources);
    }

    loadBadgeCounts();

    return () => {
      cancelled = true;
    };
  }, [isMentor]);

  if (!isMentor) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      <Link href="/mentor" aria-current={active ? "page" : undefined}>
        <span className="inline-flex items-center gap-1.5">
          {t("mentor")}
          {badgeCount > 0 ?
            <Badge
              variant="destructive"
              data-testid="mentor-notification-badge"
              aria-label={t("mentorUnreadAria", { count: badgeCount })}
            >
              {badgeCount}
            </Badge>
          : null}
        </span>
      </Link>
    </Button>
  );
}
