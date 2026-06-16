"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { Link, usePathname } from "@/i18n/navigation";

const MESSAGES_HREF = "/messages";

function isMessagesActive(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === MESSAGES_HREF || pathname.startsWith(`${MESSAGES_HREF}/`);
}

export function MessagesNavLink() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/conversations", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: { items?: Array<{ unreadCount?: number }> } | null) => {
          if (cancelled || !data?.items) return;
          const total = data.items.reduce(
            (sum, item) => sum + (item.unreadCount ?? 0),
            0,
          );
          setUnreadCount(total);
        },
      )
      .catch(() => {
        /* unauthenticated users ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const active = isMessagesActive(pathname);

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      <Link href={MESSAGES_HREF} aria-current={active ? "page" : undefined}>
        <span className="inline-flex items-center gap-1.5">
          {t("messages")}
          {unreadCount > 0 ?
            <Badge
              variant="destructive"
              data-testid="messages-notification-badge"
              aria-label={t("messagesUnreadAria", { count: unreadCount })}
            >
              {unreadCount}
            </Badge>
          : null}
        </span>
      </Link>
    </Button>
  );
}
