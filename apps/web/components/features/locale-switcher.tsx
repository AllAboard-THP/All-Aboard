"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("label")}
      data-testid="locale-switcher"
    >
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "min-w-9 px-2 font-semibold uppercase",
            locale === loc && "bg-accent text-accent-foreground",
          )}
          aria-pressed={locale === loc}
          onClick={() => {
            router.replace(pathname, { locale: loc });
          }}
        >
          {t(loc)}
        </Button>
      ))}
    </div>
  );
}
