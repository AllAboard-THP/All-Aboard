import type { ReactNode } from "react";

import { cn } from "@allaboard/ui/lib/utils";

type MarketingPageShellProps = {
  children: ReactNode;
  maxWidth?: "default" | "narrow";
};

export function MarketingPageShell({
  children,
  maxWidth = "default",
}: MarketingPageShellProps) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div
        className={cn(
          "w-full",
          maxWidth === "narrow" ? "max-w-lg" : "max-w-3xl",
        )}
      >
        {children}
      </div>
    </main>
  );
}
