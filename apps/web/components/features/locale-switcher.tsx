"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";

import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("locale");

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("label")}
      data-testid="locale-switcher"
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <Button
            key={loc}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            asChild={!isActive}
            aria-current={isActive ? "true" : undefined}
            className="min-w-9 px-2 font-mono text-xs"
          >
            {isActive ? (
              <span>{t(loc)}</span>
            ) : (
              <Link
                href={pathname}
                locale={loc}
                aria-label={loc === "fr" ? t("switchToFr") : t("switchToEn")}
                data-testid={`locale-switch-${loc}`}
              >
                {t(loc)}
              </Link>
            )}
          </Button>
        );
      })}
    </div>
  );
}
