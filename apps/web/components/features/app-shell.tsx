import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { AllAboardLogoMark } from "@allaboard/ui/components/allaboard-logo-mark";
import {
  APP_CHROME_FOOTER_CLASS,
  APP_CHROME_FOOTER_ROW_CLASS,
  APP_CHROME_FOOTER_SHELL_CLASS,
  APP_CHROME_HEADER_CLASS,
  APP_CHROME_HEADER_ROW_CLASS,
  APP_CHROME_MAIN_CLASS,
  APP_CHROME_MAIN_INNER_CLASS,
  APP_STAGE_CLASS,
} from "@allaboard/ui/patterns/landing-layout";
import { AppAbstractBackground } from "@allaboard/ui/patterns/app-abstract-background";
import { cn } from "@allaboard/ui/lib/utils";

import { AppShellNav } from "@/components/features/app-shell-nav";
import { LocaleSwitcher } from "@/components/features/locale-switcher";
import { Link } from "@/i18n/navigation";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <div className={cn(APP_STAGE_CLASS, "relative flex min-h-[100dvh] flex-col text-foreground")}>
      <AppAbstractBackground />
      <header className={cn(APP_CHROME_HEADER_CLASS, "relative z-50")}>
        <div className={APP_CHROME_HEADER_ROW_CLASS}>
          <Link
            href="/feed"
            className="-ml-1 flex min-w-0 shrink-0 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AllAboardLogoMark className="size-10" title={t("brand")} />
            <span className="gradient-text min-w-0 text-xl font-bold">{t("brand")}</span>
          </Link>
          <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2 self-center sm:gap-4">
            <AppShellNav />
            <LocaleSwitcher />
          </div>
        </div>
      </header>
      <main id="main-content" className={cn(APP_CHROME_MAIN_CLASS, "relative z-10")}>
        <div className={cn(APP_CHROME_MAIN_INNER_CLASS, "pb-8")}>{children}</div>
      </main>
      <footer
        className={cn(
          APP_CHROME_FOOTER_SHELL_CLASS,
          APP_CHROME_FOOTER_CLASS,
          "relative z-10",
        )}
      >
        <div className={APP_CHROME_FOOTER_ROW_CLASS}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AllAboardLogoMark className="size-5" title={t("brand")} />
            <span className="gradient-text font-semibold">{t("brand")}</span>
            <span>© {year}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
