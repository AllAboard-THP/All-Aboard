import type { ReactNode } from "react";

import { AppShellNav } from "@/components/features/app-shell-nav";
import { LocaleSwitcher } from "@/components/features/locale-switcher";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm font-bold tracking-widest text-primary uppercase">
            All-Aboard
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
    </div>
  );
}
