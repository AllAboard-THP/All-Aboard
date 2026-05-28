import type { Decorator } from "@storybook/react";
import type { ReactNode } from "react";

import { cn } from "@allaboard/ui/lib/utils";

type FrameWidth = "feed" | "form";

/** Spacing compact pour cartes feed en prod (apps/web). */
export const patternListCardClassName = "gap-0 py-4";
export const patternListCardHeaderClassName = "gap-1.5 px-4 pb-2";
export const patternListCardHeaderSoloClassName = "gap-1.5 px-4 pb-0";
export const patternListCardContentClassName = "px-4 pt-0";

/**
 * Enveloppe compacte type Badge — bordure, fond, padding serré, contenu centré.
 * Utilisée dans les stories Patterns (preview) ; en prod voir Card pleine largeur.
 */
export function PatternDemoCardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-sm flex-col items-center gap-2 rounded-xl border bg-card px-4 py-3 text-center shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Alert compacte et centrée (même logique que le shell). */
export const patternDemoAlertClassName =
  "!flex w-full max-w-sm flex-col items-center gap-1 rounded-lg border px-4 py-3 text-center [&_[data-slot=alert-title]]:w-full [&_[data-slot=alert-title]]:text-center [&_[data-slot=alert-description]]:w-full [&_[data-slot=alert-description]]:justify-items-center [&_[data-slot=alert-description]]:text-center";

export function PatternStoryFrame({
  children,
  width = "feed",
}: {
  children: ReactNode;
  width?: FrameWidth;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center p-6">
      <div className={width === "form" ? "w-full max-w-md" : "flex justify-center"}>
        {children}
      </div>
    </div>
  );
}

export function withPatternStoryFrame(width: FrameWidth = "feed"): Decorator {
  return (Story) => (
    <PatternStoryFrame width={width}>
      <Story />
    </PatternStoryFrame>
  );
}

export const patternStoryParameters = {
  layout: "fullscreen" as const,
};
