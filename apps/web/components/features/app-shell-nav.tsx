"use client";

import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { Link, usePathname } from "@/i18n/navigation";

export const APP_SHELL_NAV = [
  { href: "/", labelKey: "feed" as const },
  { href: "/help/new", labelKey: "newRequest" as const },
  { href: "/mentor", labelKey: "mentor" as const },
] as const;

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  if (href === "/") {
    return pathname === "/";
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
      aria-label={t("mainAriaLabel")}
      className="flex flex-wrap items-center gap-2"
    >
      {APP_SHELL_NAV.map(({ href, labelKey }) => {
        const active = isNavActive(pathname, href);
        const label = t(labelKey);
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
    </nav>
  );
}
