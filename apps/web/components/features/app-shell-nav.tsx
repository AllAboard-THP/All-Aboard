"use client";

import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { MentorNavLink } from "@/components/features/mentor-nav-link";
import { Link, usePathname } from "@/i18n/navigation";

export const APP_SHELL_NAV = [
  { href: "/feed", navKey: "feed" as const },
  { href: "/help/new", navKey: "newRequest" as const },
] as const;

const MENTOR_HREF = "/mentor";

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  if (href === "/feed") {
    return pathname === "/feed";
  }
  if (href.startsWith("/requests")) {
    return pathname.startsWith("/requests");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShellNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="flex flex-wrap items-center gap-2"
    >
      {APP_SHELL_NAV.map(({ href, navKey }) => {
        const active = isNavActive(pathname, href);
        const label = t(navKey);
        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            asChild
            className={cn(active && "bg-accent text-accent-foreground")}
          >
            <Link href={href} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          </Button>
        );
      })}
      <MentorNavLink active={isNavActive(pathname, MENTOR_HREF)} />
    </nav>
  );
}
