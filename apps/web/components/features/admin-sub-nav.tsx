"use client";

import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { Link, usePathname } from "@/i18n/navigation";
import { ADMIN_SUB_NAV, isAdminSubNavActive } from "@/lib/admin-sub-nav";

export function AdminSubNav() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="border-b border-border px-4 pb-3 pt-4 sm:px-6"
      data-testid="admin-sub-nav"
    >
      <div className="flex flex-wrap items-center gap-2">
        {ADMIN_SUB_NAV.map(({ href, navKey, exact }) => {
          const active = isAdminSubNavActive(pathname, href, exact);
          return (
            <Button
              key={href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(active && "bg-accent text-accent-foreground")}
            >
              <Link href={href} aria-current={active ? "page" : undefined}>
                {t(navKey)}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
