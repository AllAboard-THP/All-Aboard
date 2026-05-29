"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

type MentorNavLinkProps = {
  active: boolean;
};

export function MentorNavLink({ active }: MentorNavLinkProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mentor/feed", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: Array<{ hasUnreadForMentor?: boolean }> } | null) => {
        if (cancelled || !data?.items) return;
        const count = data.items.filter((item) => item.hasUnreadForMentor).length;
        setUnreadCount(count);
      })
      .catch(() => {
        /* mentor-only route — ignore errors for students */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      <Link href="/mentor" aria-current={active ? "page" : undefined}>
        <span className="inline-flex items-center gap-1.5">
          Mentor
          {unreadCount > 0 ? (
            <Badge
              variant="destructive"
              data-testid="mentor-notification-badge"
              aria-label={`${unreadCount} demande${unreadCount > 1 ? "s" : ""} avec nouvelles réponses`}
            >
              {unreadCount}
            </Badge>
          ) : null}
        </span>
      </Link>
    </Button>
  );
}
