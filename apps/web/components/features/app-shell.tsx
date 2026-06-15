import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { AppShellNav } from "@/components/features/app-shell-nav";
import { CguGate } from "@/components/features/cgu-gate";
import { LocaleSwitcher } from "@/components/features/locale-switcher";
import { fetchAuthMe } from "@/lib/api-server";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const t = await getTranslations("common");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let requiresCguAcceptance = false;

  if (token) {
    const meResult = await fetchAuthMe(token);
    if (meResult.ok && !meResult.data.cguAcceptedAt) {
      requiresCguAcceptance = true;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm font-bold tracking-widest text-primary uppercase">
            {t("brand")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <AppShellNav />
            <LocaleSwitcher />
          </div>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {requiresCguAcceptance ? <CguGate /> : null}
    </div>
  );
}
